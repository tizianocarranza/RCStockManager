<script>
	import { flip } from "svelte/animate";
	import { selectProduct } from "$lib/logic/products";
	import { changeDisplay } from "$lib/logic/displayed";

	let product = $props()

	const handleClick = () => {
		selectProduct(product);
		changeDisplay("product")
	}
</script>

<button class="flex justify-center items-center rounded-full px-4 py-2 gap-2 h-14 bg-gray-500/20 hover:bg-white/20 transition-colors" type="button"
	onclick={handleClick}
>
	<p class="font-semibold text-xs lg:text-sm text-red-200">{product.codigo}</p>
	<p class="text-xs flex-1">{product.detalle}</p>
</button>