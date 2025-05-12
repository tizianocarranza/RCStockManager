<script>
	import { packageExport } from '$lib/icons';

	import { selectedProduct } from '$lib/shared/products.svelte';

	const { product } = selectedProduct;

	$inspect(selectedProduct)
</script>

<section class="section egreso">
	<form action="?/decreaseProductQuantity" method="POST" class="input-with-icon__container" title="Registrar egreso.">
		<input type="hidden" name="id" value={product._id} />
		<input type="hidden" name="tipo" value={product.tipo} />
		<input type="number" class="input-with-icon__input" name="stock-out" max={product.cantidad} min={1} />
		<button type="submit" class="input-with-icon__button">
			<img src={packageExport} alt="Package Export icon" class="input-with-icon__icon" />
		</button>
	</form>
</section>
