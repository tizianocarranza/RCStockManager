import { currentDisplayed } from "$lib/shared/displayed.svelte";

export const changeDisplay = (newDisplay) => {
	for (const key in currentDisplayed) {
		currentDisplayed[key] = key === newDisplay;
	}
};