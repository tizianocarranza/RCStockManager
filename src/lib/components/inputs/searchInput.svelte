<script>
	import { search } from '$lib/icons';
	import { slide } from 'svelte/transition';
	import { products, filters } from '$lib/shared/products.svelte';
	import { changeDisplay } from '$lib/logic/displayed';
	import { currentDisplayed } from '$lib/shared/displayed.svelte';
	import { debounce } from '$lib/logic/utils';
	import { app } from '$lib/shared/app.svelte';

	let {
		placeholder = 'Ingrese el código o nombre del producto',
		name = 'product-search',
		section
	} = $props();

	let userSearch = $state('');
	let isSearching = $state(false);

	const handleFocus = () => {
		if (!currentDisplayed.search) {
			changeDisplay('search');
			debouncedFilter(userSearch);
		}
	};

	// Map UI labels to product collection keys
	const filterLabelToKey = {
		Radiadores: 'radiadores',
		Paneles: 'paneles',
		Electroventiladores: 'electroventiladores',
		Calefactores: 'calefactores',
		Evaporadores: 'evaporadores',
		Condensadores: 'condensadores',
		Intercoolers: 'intercoolers',
		Encauzadores: 'encauzadores',
		'Tanques de combustible': 'tanquesCombustible',
		Compresores: 'compresores',
		'Vasos recuperadores': 'vasosRecuperadores',
		'Enfriadores de aceite': 'enfriadoresAceite'
	};

	// Filter function (applies text search and type filter)
	const filterProducts = (allProducts) => {
		const query = userSearch.toLowerCase();
		const selectedKey = filters.selectedFilter
			? filterLabelToKey[filters.selectedFilter]
			: 'radiadores';

		const entries = Object.entries(allProducts).filter(([key]) => {
			return key === selectedKey;
		});

		return Object.fromEntries(
			entries.map(([key, items]) => [
				key,
				items.filter((product) => {
					if (query.trim() === '') return true;
					return (
						product.codigo.toLowerCase().includes(query) ||
						product.detalle.toLowerCase().includes(query) ||
						(product.marca && product.marca.toLowerCase().includes(query))
					);
				})
			])
		);
	};

	// Debounced filter function to avoid unnecessary calls
	const debouncedFilter = debounce((searchQuery) => {
		app.loading = true;
		isSearching = true;

		// Small delay to show loading state for better UX
		setTimeout(() => {
			// Always apply type filter; never show all products
			products.filteredProducts = filterProducts(products.allProducts);
			isSearching = false;
			app.loading = false;
		}, 100);
	}, 500); // 500ms delay

	$effect(() => {
		// React to text query changes
		debouncedFilter(userSearch);
	});

	$effect(() => {
		// React to type filter changes (including clearing it)
		const _selected = filters.selectedFilter;
		debouncedFilter(userSearch);
	});

	$effect(() => {
		// Re-run debounced filter when the product list updates
		const _allProducts = products.allProducts;
		debouncedFilter(userSearch);
	});
</script>

<form
	class="input-with-icon__container input-with-icon__container--large"
	transition:slide
	title="Buscar producto."
>
	<button class="input-with-icon__button" type="button">
		<img src={search} alt="Search icon" class="input-with-icon__icon" />
	</button>
	<input
		id="search-input"
		name="search"
		{placeholder}
		type="text"
		class="input-with-icon__input"
		onfocus={handleFocus}
		bind:value={userSearch}
	/>

	<!-- Loading indicator -->
	{#if isSearching}
		<div class="search-loading" transition:slide={{ duration: 100 }}>
			<div class="search-loading__spinner"></div>
		</div>
	{/if}
</form>
