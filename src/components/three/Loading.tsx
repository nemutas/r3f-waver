import { useEffect, VFC } from 'react';
import { appState } from '../../modules/store';

export const Loading: VFC = () => {
	useEffect(() => {
		return () => {
			appState.finishLoading = true
		}
	}, [])

	return null
}
