<script>
	import { slide } from 'svelte/transition';
     import { close } from "$lib/icons";

	const { sectionName } = $props();
</script>

<button
	class="absolute top-4 right-4 flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
	transition:slide
>
	<img src={close} alt="Close icon" class="icon" />
</button>
