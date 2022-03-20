import React, { useEffect, useRef, VFC } from 'react';
import { useSnapshot } from 'valtio';
import { css, keyframes } from '@emotion/css';
import { appState } from '../modules/store';

export const Loading: VFC = () => {
	const ref = useRef<HTMLDivElement>(null)
	const appSnap = useSnapshot(appState)
	useEffect(() => {
		if (appSnap.finishLoading) {
			ref.current!.classList.add('disable')
			ref.current!.ontransitionend = () => {
				ref.current!.style.zIndex = '-10'
			}
		}
	}, [appSnap.finishLoading])

	return (
		<div ref={ref} className={styles.container}>
			<div className={styles.rectangle} />
			<div className={styles.text}>Loading</div>
		</div>
	)
}

const animation = {
	rotate: keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `
}

const styles = {
	container: css`
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100vw;
		height: 100vh;
		background-color: rgba(255, 255, 255, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.5s;

		&.disable {
			opacity: 0;
		}
	`,
	rectangle: css`
		position: absolute;
		width: 150px;
		height: 150px;
		border: 5px solid #000;
		animation: ${animation.rotate} 2s linear infinite;
	`,
	text: css`
		position: absolute;
		color: #000;
		font-size: 1.5rem;
	`
}
