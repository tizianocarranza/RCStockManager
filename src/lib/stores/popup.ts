import { writable } from 'svelte/store';

type PopupState = {
	show: boolean;
	message: string;
	type: 'success' | 'error';
};

function createPopupStore() {
	const { subscribe, set } = writable<PopupState>({
		show: false,
		message: '',
		type: 'success'
	});

	return {
		subscribe,
		showSuccess: (message: string) => {
			set({
				show: true,
				message,
				type: 'success'
			});
		},
		showError: (message: string) => {
			set({
				show: true,
				message,
				type: 'error'
			});
		},
		hide: () => {
			set({
				show: false,
				message: '',
				type: 'success'
			});
		}
	};
}

export const popup = createPopupStore(); 