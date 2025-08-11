<script>
	import { search } from '$lib/icons';
	import { slide } from 'svelte/transition';
	import { products } from '$lib/shared/products.svelte';
	import { changeDisplay } from '$lib/logic/displayed';
	import { debounce } from '$lib/logic/utils';

	let {
		placeholder = 'Ingrese el código o nombre del producto',
		name = 'product-search',
		section
	} = $props();

	let userSearch = $state('');
	let isSearching = $state(false);

	const handleFocus = () => {
		changeDisplay("search")
	}

	// Filter function
	const filterProducts = (allProducts) => {
		return Object.fromEntries(
			Object.entries(allProducts).map(([key, items]) => [
				key,
				items.filter((product) => {
					const query = userSearch.toLowerCase();
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
		isSearching = true;
		
		// Small delay to show loading state for better UX
		setTimeout(() => {
			if (searchQuery.trim() === '') {
				// If search is empty, show all products
				products.filteredProducts = products.allProducts;
			} else {
				// Apply filter with the search query
				products.filteredProducts = filterProducts(products.allProducts);
			}
			isSearching = false;
		}, 100);
	}, 500); // 500ms delay

	// Watch for changes in userSearch and apply debounced filtering
	$effect(() => {
		debouncedFilter(userSearch);
	});
</script>

<form class="input-with-icon__container input-with-icon__container--large" transition:slide title="Buscar producto.">
	<button class="input-with-icon__button" type="button">
		<img src={search} alt="Search icon" class="input-with-icon__icon" />
	</button>
	<input id="search-input" name="search" {placeholder} type="text" class="input-with-icon__input" onfocus={handleFocus} bind:value={userSearch} />
	
	<!-- Loading indicator -->
	{#if isSearching}
		<div class="search-loading" transition:slide={{duration: 100}}>
			<div class="search-loading__spinner"></div>
		</div>
	{/if}
</form>
