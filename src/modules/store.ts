export const ImageFileNames = ['image01', 'image02', 'image03', 'image04'] as const

export const transitionState = {
	enabledAnimation1: false,
	enabledAnimation2: false,
	enabledHandler1: true,
	enabledHandler2: true,
	textureIndex: 0,
	prevIndex: 0,
	calcPrevIndex: () => {
		return transitionState.textureIndex === 0 ? ImageFileNames.length - 1 : transitionState.textureIndex - 1
	},
	calcNextIndex: () => {
		return transitionState.textureIndex < ImageFileNames.length - 1 ? transitionState.textureIndex + 1 : 0
	}
}
