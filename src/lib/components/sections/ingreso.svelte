<script>
	import { packageImport } from '$lib/icons';
	import { products, selectedProduct } from '$lib/shared/products.svelte';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { selectProduct } from '$lib/logic/products';
	import { app } from '$lib/shared/app.svelte';
	import { modelTypeToCategoryLabel } from '$lib/logic/utils';
	import { loadProductsByType } from '$lib/logic/lazyLoading';
	const { product } = selectedProduct;

	function handleSubmit() {
		app.loading = true;

		return async ({ result }) => {
			const r = result.data?.actionResult; // shortcut

			if (result.type === 'failure') {
				popup.showError(r?.message || 'Error al registrar el ingreso');
			} else if (result.type === 'success') {
				popup.showSuccess(r?.message || 'Ingreso registrado exitosamente');

				if (r?.producto) {
					selectProduct(r.producto);
				}

				const productType = product.tipo;
				const categoryLabel = modelTypeToCategoryLabel[productType];

				// Check structure
				if (products.loadedTypes.has(categoryLabel)) {
					products.loadedTypes.delete(categoryLabel);
					await loadProductsByType(categoryLabel);
				}
			}

			app.loading = false;
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
		<input type="hidden" name="id" value={product._id} />
		<input type="hidden" name="tipo" value={product.tipo} />
		<input type="number" class="input-with-icon__input" name="stock-in" max={15} min={1} required />
		<button type="submit" class="input-with-icon__button">
			<img src={packageImport} alt="Package Import icon" class="input-with-icon__icon" />
		</button>
	</form>
</section>
