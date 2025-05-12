<script>
	import { packageImport } from '$lib/icons';
	import { selectedProduct } from '$lib/shared/products.svelte';

	const { product } = selectedProduct;
</script>

<section class="section ingreso">
	<form action="?/increaseProductQuantity" method="POST" class="input-with-icon__container">
		<input type="hidden" name="id" value="{product._id}" />
		<input type="hidden" name="tipo" value="{product.tipo}" />
		<input type="number" class="input-with-icon__input" name="stock-in" max={15} min={1} />
		<button type="submit" class="input-with-icon__button">
			<img src={packageImport} alt="Package Import icon" class="input-with-icon__icon" />
		</button>
	</form>
</section>
