<script>
	import { search } from '$lib/icons';
	import { slide } from 'svelte/transition';
	import { products } from '$lib/shared/products.svelte';
	import { changeDisplay } from '$lib/logic/displayed';

	let {
		placeholder = 'Ingrese el código o nombre del producto',
		name = 'product-search',
		section
	} = $props();

	let userSearch = $state('');

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

	// Derived state for filtered products
	let filteredProducts = $derived(filterProducts(products.allProducts));

	$effect(() => {
		products.filteredProducts = filteredProducts;
	});
</script>

<form class="input-with-icon__container input-with-icon__container--large" transition:slide title="Buscar producto.">
	<button class="input-with-icon__button" type="button">
		<img src={search} alt="Search icon" class="input-with-icon__icon" />
	</button>
	<input id="search-input" name="search" {placeholder} type="text" class="input-with-icon__input" onfocus={handleFocus} bind:value={userSearch} />
</form>
