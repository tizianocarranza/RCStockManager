<script>
	import { trash } from '$lib/icons';

	import { selectedProduct } from '$lib/shared/products.svelte';

	const { product } = selectedProduct;

	$inspect(selectedProduct)
</script>

<section class="section eliminar">
	<form action="?/deleteProduct" method="POST" class="section-button" title="Eliminar roducto.">
		<input type="hidden" name="id" value={product._id} />
		<input type="hidden" name="tipo" value={product.tipo} />
		<button type="submit">
			<img src={trash} alt="Trash" />
		</button>
	</form>
</section>
