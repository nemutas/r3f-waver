import React, { VFC } from 'react';
import { css, keyframes } from '@emotion/css';

export const ScrollAnnotation: VFC = () => {
	return (
		<div className={styles.scrollContainer}>
			<div className={styles.scrollbarAnimationContainer}>
				<div className={styles.scrollbar} />
			</div>
		</div>
	)
}

// --------------------------------------------------------
// styles

const animation = {
	scloll: keyframes`
    0% {
      transform: translate(0px, -100%);
    }
    100% {
      transform: translate(0px, 100%);
    }
  `
}

const styles = {
	scrollContainer: css`
		position: absolute;
		bottom: 10px;
		left: 10px;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	`,
	scrollbarAnimationContainer: css`
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		animation: ${animation.scloll} 2s linear infinite;
	`,
	scrollbar: css`
		width: 2px;
		height: 80%;
		background-color: rgba(255, 255, 255, 0.5);
	`
}
