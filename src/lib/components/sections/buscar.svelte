<script>
	import { slide } from 'svelte/transition';
	import { SearchInput } from '$lib/components';
	import { changeDisplay } from '$lib/logic/displayed';
	import { filters } from '$lib/shared/products.svelte';
	import { close, filter } from '$lib/icons';

	const filterOptions = [
		'Radiadores',
		'Paneles',
		'Electroventiladores',
		'Calefactores',
		'Evaporadores',
		'Condensadores',
		'Intercoolers',
		'Encauzadores',
		'Tanques de combustible',
		'Compresores',
		'Vasos recuperadores',
		'Enfriadores de aceite'
	];

	const handleFilterButtonClick = () => {
		changeDisplay('search');
		filters.showFilters = !filters.showFilters;
	};
	const handleFilterOptionClick = (option) => {
		changeDisplay('search');
		filters.selectedFilter = option;
		filters.showFilters = false;
	};
	const handleRemoveFilterClick = (option) => {
		changeDisplay('search');
		filters.selectedFilter = null;
		filters.showFilters = false;
	};
	const handleCloseFiltersClick = () => {
		changeDisplay('search');
		filters.showFilters = false;
	};
</script>

<section class="section buscar">
	<div class="flex flex-col w-full h-full items-center justify-center">
		{#if !filters.showFilters}
			<div
				class="relative flex gap-5 w-full items-center justify-center"
				transition:slide={{ duration: 150 }}
			>
				<SearchInput section="buscar" name="product-search" />

				<div class="flex justify-center items-center relative">
					<button
						class="flex items-center justify-center h-2 hover:scale-110 transition-transform duration-300"
						type="button"
						onclick={handleFilterButtonClick}
						title="Filtrar productos."
					>
						<img src={filter} alt="Filter icon" class="" />
					</button>
					{#if filters.selectedFilter}
						<div
							class="absolute left-[140%] text-nowrap flex items-center justify-center gap-5 text-xs border border-white rounded-sm pl-3 pr-1 py-1 font-normal italic"
							transition:slide={{ duration: 150 }}
						>
							<span>{filters.selectedFilter}</span>
							<button
								class="w-3 h-full hover:scale-110 transition-transform"
								onclick={handleRemoveFilterClick}
							>
								<img src={close} alt="Close icon." class="h-3" />
							</button>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex gap-4 w-full h-full items-start" transition:slide={{ duration: 150 }}>
				<div
					class="flex flex-wrap max-h-full w-full my-auto gap-2 items-center justify-center overflow-auto"
				>
					{#each filterOptions as option}
						<button
							class="rounded-full px-3 h-7 text-xs font-semibold bg-gray-500/20 hover:bg-white/20 transition-colors {filters.selectedFilter ===
							option
								? 'text-red-200 border border-red-200'
								: 'text-white border-0'}"
							onclick={() => handleFilterOptionClick(option)}
						>
							<span>{option}</span>
						</button>
					{/each}
				</div>
				<button
					onclick={handleCloseFiltersClick}
					class="hover:scale-110 transition-transform"
					transition:slide={{ delay: 150 }}
				>
					<img src={close} alt="Close icon" />
				</button>
			</div>
		{/if}
	</div>
</section>
