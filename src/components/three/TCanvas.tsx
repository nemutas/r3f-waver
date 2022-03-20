import { Suspense, VFC } from 'react';
import * as THREE from 'three';
import { Stats, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ImageFileNames } from '../../modules/store';
import { BackPlane } from './BackPlane';
import { FrontPlane } from './FrontPlane';
import { Loading } from './Loading';

export const TCanvas: VFC = () => {
	const OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)

	return (
		<Canvas camera={OrthographicCamera} dpr={window.devicePixelRatio}>
			{/* objects */}
			<Suspense fallback={<Loading />}>
				<Planes />
			</Suspense>
			{/* helper */}
			<Stats />
		</Canvas>
	)
}

const Planes: VFC = () => {
	const textures = ImageFileNames.map(name => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const texture = useTexture(process.env.PUBLIC_URL + `/assets/images/${name}.jpg`)
		texture.wrapS = THREE.MirroredRepeatWrapping
		texture.wrapT = THREE.MirroredRepeatWrapping
		return texture
	})

	return (
		<>
			<BackPlane textures={textures} />
			<FrontPlane textures={textures} />
		</>
	)
}
