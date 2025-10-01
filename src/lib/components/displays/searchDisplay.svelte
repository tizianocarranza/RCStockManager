<script>
	import { flip } from 'svelte/animate';
	import { ProductSearchResultCard } from '$lib/components';
	import { products } from '$lib/shared/products.svelte';
	import { slide } from 'svelte/transition';
	import { popup } from '$lib/stores/popup';

	let searchResults = $derived([
		...(products.filteredProducts.radiadores || []),
		...(products.filteredProducts.paneles || []),
		...(products.filteredProducts.electroventiladores || []),
		...(products.filteredProducts.calefactores || []),
		...(products.filteredProducts.evaporadores || []),
		...(products.filteredProducts.condensadores || []),
		...(products.filteredProducts.intercoolers || []),
		...(products.filteredProducts.encauzadores || []),
		...(products.filteredProducts.tanquesCombustible || []),
		...(products.filteredProducts.compresores || []),
		...(products.filteredProducts.vasosRecuperadores || []),
		...(products.filteredProducts.enfriadoresAceite || []),
		...(products.filteredProducts.otros || [])
	]);
</script>

<div class="h-full w-full flex flex-wrap gap-5 lg:p-5 items-start" in:slide>
	<div class="w-full max-h-full flex flex-wrap gap-3 lg:gap-7 p-2 items-center overflow-y-auto">
		{#each searchResults as product (product)}
        <div animate:flip={{ duration: 300 }}>
            <ProductSearchResultCard {...product} />
        </div>
		{/each}
	</div>
</div>
