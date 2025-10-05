<script>
	import { filter } from '$lib/icons';
	import { slide } from 'svelte/transition';
	import { filters } from '$lib/shared/products.svelte';
    import { changeDisplay } from '$lib/logic/displayed';

	const handleClick = () => {
		changeDisplay('search');
		filters.showFilters = !filters.showFilters;
	};
</script>

<div transition:slide title="Filtrar productos." class="relative">
	<button
		class="hover:scale-110 transition-transform duration-300"
		type="button"
		onclick={handleClick}
	>
		<img src={filter} alt="Filter icon" class="section-button__icon" />
	</button>
</div>
