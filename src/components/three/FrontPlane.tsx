import gsap from 'gsap';
import React, { useCallback, useEffect, useMemo, useRef, VFC } from 'react';
import * as THREE from 'three';
import { Plane } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { cnoise31 } from '../../glsl/noise';
import { transitionState } from '../../modules/store';

type FrontPlaneProps = {
	textures: THREE.Texture[]
}

export const FrontPlane: VFC<FrontPlaneProps> = ({ textures }) => {
	const ref = useRef<THREE.Mesh>(null)

	const planeSize = useMemo(() => [1.6 * 1.2, 0.9 * 1.2], [])

	const shader: THREE.Shader = {
		uniforms: {
			u_texture: { value: textures[transitionState.textureIndex] },
			u_prevTexture: { value: textures[transitionState.textureIndex] },
			u_textureAspect: { value: new THREE.Vector2(0, 0) },
			u_prevTextureAspect: { value: new THREE.Vector2(0, 0) },
			u_progress: { value: 0 },
			u_time: { value: 0 }
		},
		vertexShader,
		fragmentShader
	}

	// --------------------------------------------
	// texture uv scale update
	const updateTextureAspect = useCallback(
		(texture: THREE.Texture, mode: 'current' | 'prev') => {
			const imageAspect = texture.image.width / texture.image.height
			const aspect = planeSize[0] / planeSize[1]

			if (aspect < imageAspect) {
				if (mode === 'current') shader.uniforms.u_textureAspect.value.set(aspect / imageAspect, 1)
				else shader.uniforms.u_prevTextureAspect.value.set(aspect / imageAspect, 1)
			} else {
				if (mode === 'current') shader.uniforms.u_textureAspect.value.set(1, imageAspect / aspect)
				else shader.uniforms.u_prevTextureAspect.value.set(1, imageAspect / aspect)
			}
		},
		[planeSize, shader.uniforms.u_prevTextureAspect.value, shader.uniforms.u_textureAspect.value]
	)

	useEffect(() => {
		updateTextureAspect(textures[transitionState.textureIndex], 'current')
		updateTextureAspect(textures[transitionState.textureIndex], 'prev')
	}, [textures, updateTextureAspect])

	// --------------------------------------------
	// animation
	const animation = () => {
		shader.uniforms.u_texture.value = textures[transitionState.textureIndex]
		updateTextureAspect(textures[transitionState.textureIndex], 'current')

		const tl = gsap.timeline({
			onComplete: () => {
				transitionState.enabledHandler1 = true
			}
		})
		tl.to(shader.uniforms.u_progress, {
			value: 1,
			duration: 0.5,
			ease: 'power2.inOut',
			onComplete: () => {
				shader.uniforms.u_prevTexture.value = textures[transitionState.textureIndex]
				updateTextureAspect(textures[transitionState.textureIndex], 'prev')
				shader.uniforms.u_progress.value = 0
			}
		})
	}

	// --------------------------------------------
	// frame loop
	useFrame(({ size }) => {
		ref.current!.scale.set(size.height / size.width, 1, 1)
		shader.uniforms.u_time.value += 0.005

		// animation
		if (transitionState.enabledAnimation1) {
			animation()
			transitionState.enabledAnimation1 = false
		}
	})

	return (
		<Plane ref={ref} args={[planeSize[0], planeSize[1], 50, 50]} position={[0, 0, 1]}>
			<shaderMaterial args={[shader]} wireframe={false} transparent />
		</Plane>
	)
}

const vertexShader = `
uniform float u_time;
varying vec2 v_uv;

void main() {
  v_uv = uv;
  vec3 pos = position;
  pos.x += sin(pos.x * 5.0 + u_time * 3.0) * 0.01;
  pos.y += sin(pos.x * 5.0 + u_time * 3.0) * 0.01;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`

const fragmentShader = `
uniform sampler2D u_texture;
uniform sampler2D u_prevTexture;
uniform vec2 u_textureAspect;
uniform vec2 u_prevTextureAspect;
uniform float u_progress;
uniform float u_time;
varying vec2 v_uv;

${cnoise31}

void main() {
  vec2 aspect = mix(u_prevTextureAspect, u_textureAspect, u_progress);
  vec2 uv = (v_uv - 0.5) * aspect + 0.5;
  vec4 tex = texture2D(u_texture, uv);
  vec4 prevTex = texture2D(u_prevTexture, uv);

  tex = mix(prevTex, tex, u_progress);

  float n = cnoise31(vec3(v_uv * 1.5, u_time * 0.5));
  n = 1.0 - n;
  n = smoothstep(0.7, 1.0, n);

  gl_FragColor = vec4(tex.rgb, tex.a * n);
  // gl_FragColor = vec4(vec3(n), 1.0);
}
`
