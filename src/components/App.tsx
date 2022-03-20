import React, { useRef, VFC } from 'react';
import { css } from '@emotion/css';
import { transitionState } from '../modules/store';
import { LinkIconButton } from './LinkIconButton';
import { Loading } from './Loading';
import { ScrollAnnotation } from './ScrollAnnotation';
import { TCanvas } from './three/TCanvas';

export const App: VFC = () => {
	const containerRef = useRef<HTMLDivElement>(null)

	const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		if (transitionState.enabledHandler1 && transitionState.enabledHandler2) {
			if (0 < e.deltaY) {
				// next
				transitionState.prevIndex = transitionState.textureIndex
				transitionState.textureIndex = transitionState.calcNextIndex()
				transitionState.enabledAnimation1 = true
				transitionState.enabledAnimation2 = true
				transitionState.enabledHandler1 = false
				transitionState.enabledHandler2 = false
			} else if (e.deltaY < 0) {
				// prev
				transitionState.prevIndex = transitionState.textureIndex
				transitionState.textureIndex = transitionState.calcPrevIndex()
				transitionState.enabledAnimation1 = true
				transitionState.enabledAnimation2 = true
				transitionState.enabledHandler1 = false
				transitionState.enabledHandler2 = false
			}
		}
	}

	return (
		<div ref={containerRef} className={styles.container} onWheel={handleWheel}>
			<TCanvas />
			<LinkIconButton imagePath="/assets/icons/github.svg" linkPath="https://github.com/nemutas/r3f-waver" />
			<ScrollAnnotation />
			<Loading />
		</div>
	)
}

const styles = {
	container: css`
		position: relative;
		width: 100vw;
		height: 100vh;
	`
}
