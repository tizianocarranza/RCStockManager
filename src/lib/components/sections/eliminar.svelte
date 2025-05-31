<script>
	import { trash } from '$lib/icons';
	import { selectedProduct } from '$lib/shared/products.svelte';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { changeDisplay } from '$lib/logic/displayed';

	const { product } = selectedProduct;

	function handleSubmit() {
		return async ({ result }) => {
			if (result.type === 'failure') {
				popup.showError(result.data?.message || 'Error al eliminar el producto');
			} else if (result.type === 'success') {
				popup.showSuccess(result.data?.message || 'Producto eliminado exitosamente');
				await invalidateAll(); // Revalidate all data
				changeDisplay(null); // Clear the selected product
			}
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
