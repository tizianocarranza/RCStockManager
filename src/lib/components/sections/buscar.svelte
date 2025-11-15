<script>
	import { slide } from 'svelte/transition';
	import { SearchInput } from '$lib/components';
	import { changeDisplay } from '$lib/logic/displayed';
	import { filters } from '$lib/shared/products.svelte';
	import { close, filter, refresh } from '$lib/icons';
	import {
		loadProductsByType,
		isProductTypeLoaded,
		isProductTypeLoading
	} from '$lib/logic/lazyLoading';
	import { app } from '$lib/shared/app.svelte';
	import { invalidateAll } from '$app/navigation';
	import { selectedProduct } from '$lib/shared/products.svelte';
	import { selectProduct } from '$lib/logic/products';
	import { products } from '$lib/shared/products.svelte';
	import { currentDisplayed } from '$lib/shared/displayed.svelte';

	const handleRefreshClick = async () => {
		app.loading = true;
		await invalidateAll(); // Revalidate all data
		try {
			products.loadedTypes = new Set();
			await loadProductsByType(filters.selectedFilter);
			if(selectedProduct.product && currentDisplayed.product) {
				const updatedProduct = products.filteredProducts[filters.selectedFilter].find(product => product._id === selectedProduct.product._id);
				selectProduct(updatedProduct);
			}
			app.lastUpdated = new Date();
		} catch (error) {
			console.error('Error refreshing products:', error);
		}
	};

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

	const handleCloseFiltersClick = () => {
		changeDisplay('search');
		filters.showFilters = false;
	};
</script>

<section class="section buscar">
	<button
		class="absolute h-[20px] top-2 left-2 hidden lg:flex items-center justify-center transition-opacity duration-300 hover:opacity-80 disabled:animate-spin"
		disabled={app.loading}
		transition:slide
		onclick={handleRefreshClick}
	>
		<img src={refresh} alt="Refresh icon" class="icon" />
	</button>
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
							class="hidden xl:flex absolute left-0 md:left-[140%] text-nowrap items-center justify-center gap-5 text-xs border border-white rounded-sm px-3 py-1 font-normal italic"
							transition:slide={{ duration: 150 }}
						>
							<span>{filters.selectedFilter}</span>
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
							class="flex items-center justify-center gap-2 rounded-full h-7 px-3 text-xs font-semibold bg-gray-500/20 transition-colors {filters.selectedFilter ===
							option
								? 'text-red-200 border border-red-200'
								: 'text-white border-0 hover:bg-white/20'}"
							onclick={() => handleFilterOptionClick(option)}
						>
							<span>{option}</span>
							{#if isProductTypeLoading(option)}
								<div
									class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
								></div>
							{/if}
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
