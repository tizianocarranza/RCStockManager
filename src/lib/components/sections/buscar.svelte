<script>
	import { slide } from 'svelte/transition';
	import { SearchInput } from '$lib/components';
	import { changeDisplay } from '$lib/logic/displayed';
	import { filters } from '$lib/shared/products.svelte';
	import { close, filter } from '$lib/icons';
	import { loadProductsByType, isProductTypeLoaded, isProductTypeLoading } from '$lib/logic/lazyLoading';

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
	const handleFilterOptionClick = async (option) => {
		changeDisplay('search');
		filters.selectedFilter = option;
		filters.showFilters = false;
		
		// Load products for this type if not already loaded
		if (!isProductTypeLoaded(option)) {
			try {
				await loadProductsByType(option);
			} catch (error) {
				console.error('Error loading products:', error);
			}
		}
	};
	const handleRemoveFilterClick = (option) => {
		changeDisplay('search');
		// Don't allow removing the filter - always keep a filter active
		// If trying to remove current filter, set it back to Radiadores
		if (filters.selectedFilter === option) {
			filters.selectedFilter = 'Radiadores';
		}
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
						class="flex items-center justify-center h-2 hover:scale-120 transition-transform duration-300"
						type="button"
						onclick={handleFilterButtonClick}
						title="Filtrar productos."
					>
						<img src={filter} alt="Filter icon" class="" />
					</button>
					{#if filters.selectedFilter}
						<div
							class="hidden xl:flex absolute left-0 md:left-[140%] text-nowrap items-center justify-center gap-5 text-xs border border-white rounded-sm pl-3 pr-1 py-1 font-normal italic"
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
						<div
							class="flex items-center justify-center gap-2 rounded-full h-7 text-xs font-semibold bg-gray-500/20 transition-colors {filters.selectedFilter ===
							option
								? 'text-red-200 border border-red-200'
								: 'text-white border-0 hover:bg-white/20'}"
						>
							<button class="px-3 h-full flex items-center gap-1" onclick={() => handleFilterOptionClick(option)}>
								<span>{option}</span>
								{#if isProductTypeLoading(option)}
									<div class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
								{/if}
							</button>
							{#if filters.selectedFilter === option}
								<button
									class="rounded-full flex items-center justify-center h-4 w-4 mr-1 hover:scale-120 transition-transform hover:bg-red-200"
									onclick={handleRemoveFilterClick}
								>
									<img src={close} alt="Close icon." class="h-3" />
								</button>
							{/if}
						</div>
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
