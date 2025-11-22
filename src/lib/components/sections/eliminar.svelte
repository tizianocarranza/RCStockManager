<script>
	import { trash } from '$lib/icons';
	import { products, selectedProduct } from '$lib/shared/products.svelte';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { modelTypeToCategoryLabel } from '$lib/logic/utils';
	import { changeDisplay } from '$lib/logic/displayed';
	import { app } from '$lib/shared/app.svelte';
	import { loadProductsByType } from '$lib/logic/lazyLoading';

	const { product } = selectedProduct;

	function handleSubmit() {
		app.loading = true;

		return async ({ result }) => {
			const r = result.data?.actionResult;

			if (result.type === 'failure') {
				popup.showError(r?.message || 'Error al eliminar el producto');
			} else if (result.type === 'success') {
				popup.showSuccess(r?.message || 'Producto eliminado exitosamente');

				const productType = selectedProduct.product.tipo;
				const categoryLabel = modelTypeToCategoryLabel[productType];

				// Check structure
				if (products.loadedTypes.has(categoryLabel)) {
					products.loadedTypes.delete(categoryLabel);
					await loadProductsByType(categoryLabel);
				}

				changeDisplay('search');
			}

			app.loading = false;
		};
	}
</script>

<section class="section eliminar">
	<form
		action="?/deleteProduct"
		method="POST"
		class="section-button"
		title="Eliminar producto."
		use:enhance={handleSubmit}
	>
		<input type="hidden" name="id" value={product._id} />
		<input type="hidden" name="tipo" value={product.tipo} />
		<button type="submit">
			<img src={trash} alt="Trash" />
		</button>
	</form>
</section>
