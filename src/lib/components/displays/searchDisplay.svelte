<script>
	import { flip } from 'svelte/animate';
	import { ProductSearchResultCard } from '$lib/components';
	import { products } from '$lib/shared/products.svelte';
	import { slide } from 'svelte/transition';

	let searchResults = $derived([
		...(products.filteredProducts.radiadores || []),
		...(products.filteredProducts.paneles || []),
		...(products.filteredProducts.electroventiladores || [])
	]);
</script>

<div class="h-full w-full flex flex-wrap gap-5 p-5 items-start" in:slide>
	<div class="w-full max-h-full flex flex-wrap gap-7 p-5 items-center overflow-scroll">
		{#each searchResults as product (product)}
        <div animate:flip={{ duration: 300 }}>
            <ProductSearchResultCard {...product} />
        </div>
		{/each}
	</div>
</div>
