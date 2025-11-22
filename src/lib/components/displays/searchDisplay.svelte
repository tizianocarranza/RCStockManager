<script>
	import { flip } from 'svelte/animate';
	import { ProductSearchResultCard } from '$lib/components';
	import { products } from '$lib/shared/products.svelte';
	import { slide } from 'svelte/transition';
	import { popup } from '$lib/stores/popup';

	let searchResults = $derived([
		...(products.filteredProducts["Radiadores"] || []),
		...(products.filteredProducts["Paneles"] || []),
		...(products.filteredProducts["Electroventiladores"] || []),
		...(products.filteredProducts["Calefactores"] || []),
		...(products.filteredProducts["Evaporadores"] || []),
		...(products.filteredProducts["Condensadores"] || []),
		...(products.filteredProducts["Intercoolers"] || []),
		...(products.filteredProducts["Encauzadores"] || []),
		...(products.filteredProducts["Tanques de combustible"] || []),
		...(products.filteredProducts["Compresores"] || []),
		...(products.filteredProducts["Vasos recuperadores"] || []),
		...(products.filteredProducts["Enfriadores de aceite"] || []),
		...(products.filteredProducts["Otros"] || [])
	]);

	$inspect("products.filteredProducts: ", products.filteredProducts)
	$inspect("products.allProducts: ", products.allProducts)
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
