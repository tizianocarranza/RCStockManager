<script>
	import { packageImport } from '$lib/icons';
	import { selectedProduct } from '$lib/shared/products.svelte';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { selectProduct } from '$lib/logic/products';
	const { product } = selectedProduct;

	function handleSubmit() {
		return async ({ result }) => {
			if (result.type === 'failure') {
				popup.showError(result.data?.message || 'Error al registrar el ingreso');
			} else if (result.type === 'success') {
				popup.showSuccess(result.data?.message || 'Ingreso registrado exitosamente');
				if (result.data?.producto) {
					selectProduct(result.data.producto);
				}
				await invalidateAll();
			}
		};
	}
</script>

<section class="section ingreso">
	<form 
		action="?/increaseProductQuantity" 
		method="POST" 
		class="input-with-icon__container" 
		title="Registrar ingreso."
		use:enhance={handleSubmit}
	>
		<input type="hidden" name="id" value="{product._id}" />
		<input type="hidden" name="tipo" value="{product.tipo}" />
		<input type="number" class="input-with-icon__input" name="stock-in" max={15} min={1} required />
		<button type="submit" class="input-with-icon__button">
			<img src={packageImport} alt="Package Import icon" class="input-with-icon__icon" />
		</button>
	</form>
</section>
