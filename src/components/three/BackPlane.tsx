import gsap from 'gsap';
import React, { useCallback, useEffect, VFC } from 'react';
import * as THREE from 'three';
import { Plane } from '@react-three/drei';
import { Size, useFrame, useThree } from '@react-three/fiber';
import { blendmode } from '../../glsl/blendmode';
import { transitionState } from '../../modules/store';

type BackPlaneProps = {
	textures: THREE.Texture[]
}

export const BackPlane: VFC<BackPlaneProps> = ({ textures }) => {
	const { size } = useThree()

	const shader: THREE.Shader = {
		uniforms: {
			u_texture: { value: textures[transitionState.textureIndex] },
			u_prevTexture: { value: textures[transitionState.textureIndex] },
			u_textureAspect: { value: new THREE.Vector2(0, 0) },
			u_prevTextureAspect: { value: new THREE.Vector2(0, 0) },
			u_progress: { value: 0 },
			u_time: { value: 0 },
			u_mouse: { value: new THREE.Vector2(0, 0) }
		},
		vertexShader,
		fragmentShader
	}

	const updateTextureAspect = useCallback(
		(size: Size, texture: THREE.Texture, mode: 'current' | 'prev') => {
			const imageAspect = texture.image.width / texture.image.height
			const aspect = size.width / size.height

			if (aspect < imageAspect) {
				if (mode === 'current') shader.uniforms.u_textureAspect.value.set(aspect / imageAspect, 1)
				else shader.uniforms.u_prevTextureAspect.value.set(aspect / imageAspect, 1)
			} else {
				if (mode === 'current') shader.uniforms.u_textureAspect.value.set(1, imageAspect / aspect)
				else shader.uniforms.u_prevTextureAspect.value.set(1, imageAspect / aspect)
			}
		},
		[shader.uniforms.u_prevTextureAspect.value, shader.uniforms.u_textureAspect.value]
	)

	useEffect(() => {
		updateTextureAspect(size, textures[transitionState.textureIndex], 'prev')
		updateTextureAspect(size, textures[transitionState.textureIndex], 'current')
	}, [size, textures, updateTextureAspect])

	// --------------------------------------------
	// animation
	const animation = (size: Size) => {
		shader.uniforms.u_texture.value = textures[transitionState.textureIndex]
		updateTextureAspect(size, textures[transitionState.textureIndex], 'current')

		const tl = gsap.timeline({
			onComplete: () => {
				transitionState.enabledHandler2 = true
			}
		})
		tl.to(shader.uniforms.u_progress, {
			value: 1,
			duration: 1,
			ease: 'power2.inOut',
			onComplete: () => {
				shader.uniforms.u_prevTexture.value = textures[transitionState.textureIndex]
				updateTextureAspect(size, textures[transitionState.textureIndex], 'prev')
				shader.uniforms.u_progress.value = 0
			}
		})
	}

	// --------------------------------------------
	// frame loop
	const vec2 = new THREE.Vector2()
	useFrame(({ mouse, size }) => {
		shader.uniforms.u_time.value += 0.005
		shader.uniforms.u_mouse.value.lerp(vec2.set(mouse.x, mouse.y), 0.02) // -1 ~ 1

		// animation
		if (transitionState.enabledAnimation2) {
			animation(size)
			transitionState.enabledAnimation2 = false
		}
	})

	return (
		<Plane args={[2, 2]}>
			<shaderMaterial args={[shader]} />
		</Plane>
	)
}

const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform sampler2D u_texture;
uniform sampler2D u_prevTexture;
uniform vec2 u_textureAspect;
uniform vec2 u_prevTextureAspect;
uniform float u_progress;
uniform float u_time;
uniform vec2 u_mouse;
varying vec2 v_uv;

// complex
const int max_iter = 7;

${blendmode}

void main() {
  vec2 aspect = mix(u_prevTextureAspect, u_textureAspect, u_progress);
  vec2 uv = (v_uv - 0.5) * aspect + 0.5;
  
	vec2 p = (0.8 * 0.8 * (uv + 0.5)) * 12.0;
	vec2 p2 = vec2(cos(-p.x) + sin(p.y), sin(-p.y) + cos(p.x));
	float c = 1.0;
	float inten = 1.7;

	for(int i = 0; i < max_iter; i++){
		float t = u_time * float(i) * 1.0 / float(max_iter);
		p2 = p + vec2(cos(t - p2.x) + sin(t + p2.y), sin(t - p2.y) + cos(t + p2.x));

		vec2 rand = vec2(p.x / sin(p2.x + t), p.y / cos(p2.y + t));
		rand /= inten;
		c += 11.0 / (length(rand));
	}

	c /= float(max_iter);
	c = 1.8 - sqrt(c);
	c = pow(c, 6.0);

	vec2 mouse = u_mouse * vec2(1.0, -1.0);

	vec2 uv_offset = mouse * 2.0;
	float distortion = clamp(c, 0.0, 1.0);
	uv_offset += sin(distortion * 5.0 * length(mouse)) * 0.5;
	uv_offset *= 0.1;

  vec4 tex = texture2D(u_texture, uv);
  vec4 tex2 = texture2D(u_texture, uv + uv_offset);
  vec4 prevTex = texture2D(u_prevTexture, uv);
  vec4 prevTex2 = texture2D(u_prevTexture, uv + uv_offset);

  tex = mix(prevTex, tex, u_progress);
  tex2 = mix(prevTex2, tex2, u_progress);
  
	vec3 color = blendMultiply(tex.rgb, tex2.rgb, 1.0);
	color = blendMultiply(color, vec3((c + 0.2) * 2.0), 1.0);
	
	// gl_FragColor = vec4(vec3(c) , 1.0);
	gl_FragColor = vec4(color , 1.0);
}
`
