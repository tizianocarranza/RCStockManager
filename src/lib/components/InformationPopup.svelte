<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let message: string = '';
	export let type: 'success' | 'error' = 'success';
	export let duration: number = 3000;
	export let show: boolean = false;

	const dispatch = createEventDispatcher();

	$: if (show) {
		setTimeout(() => {
			show = false;
			dispatch('close');
		}, duration);
	}
</script>

{#if show}
	<div
		class="fixed right-4 top-4 z-50 min-w-[300px] max-w-md"
		in:fly={{ y: -20, duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div
			class="rounded-lg p-4 shadow-lg {type === 'success'
				? 'bg-emerald-500 text-white'
				: 'bg-red-500 text-white'}"
			role="alert"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					{#if type === 'success'}
						<svg
							class="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{:else}
						<svg
							class="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{/if}
					<p class="text-sm font-medium">{message}</p>
				</div>
				<button
					class="ml-4 inline-flex text-white hover:opacity-75"
					on:click={() => {
						show = false;
						dispatch('close');
					}}
				>
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if} 