<script>
	import { changeDisplay } from '$lib/logic/displayed';
	import { slide } from 'svelte/transition';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { selectProduct } from '$lib/logic/products';
	import { app } from '$lib/shared/app.svelte';
	import { selectedProduct, products } from '$lib/shared/products.svelte';
	import { modelTypeToCategoryLabel } from '$lib/logic/utils';
	import { loadProductsByType } from '$lib/logic/lazyLoading';
	import { SINGULAR_LABELS, resolveTipo, singularOf } from '$lib/logic/productTypes';

	let product = selectedProduct.product;
	let selectedType = $state(singularOf(product.tipo) ?? 'Otro');
	let selectedSlug = $derived(resolveTipo(selectedType));

	function handleSubmit() {
		app.loading = true;
		return async ({ result }) => {
			const r = result.data?.actionResult;

			if (result.type === 'failure') {
				popup.showError(r?.message || 'Error al actualizar el producto');
			} else if (result.type === 'success') {
				popup.showSuccess(r?.message || 'Producto actualizado exitosamente');

				const previousProduct = product;
				const previousProductType = product.tipo;
				const previousCategoryLabel = modelTypeToCategoryLabel[previousProductType];

				if (r?.producto) {
					selectProduct(r.producto);
					changeDisplay('product');
				}

				const newProduct = selectedProduct.product;
				const newProductType = newProduct.tipo;
				const newCategoryLabel = modelTypeToCategoryLabel[newProductType];

				// Check structure
				if (products.loadedTypes.has(newCategoryLabel)) {
					products.loadedTypes.delete(newCategoryLabel);
					await loadProductsByType(newCategoryLabel);
				}
				
				if (
					newCategoryLabel !== previousCategoryLabel &&
					products.loadedTypes.has(previousCategoryLabel)
				) {
					products.loadedTypes.delete(previousCategoryLabel);
					await loadProductsByType(previousCategoryLabel);
				} else {
				}
			}
			app.loading = false;
		};
	}
</script>

<div class="h-full w-full flex flex-col p-5 gap-10" in:slide>
	<h1 class="hidden lg:inline-blockp-2 pb-5 border-b text-4xl">
		Editar {selectedType}
	</h1>

	<form
		class="flex flex-col lg:flex-row gap-5 lg:gap-10 w-full h-full justify-between rounded overflow-y-auto"
		method="post"
		action="?/editProduct"
		use:enhance={handleSubmit}
	>
		<input type="hidden" name="id" value={product._id} />
		<input type="hidden" name="originalTipo" value={product.tipo} />

		<div class="flex flex-col gap-10 h-full flex-wrap">
			<div class="flex gap-5">
				<input
					class="input input--large"
					placeholder="Codigo"
					name="codigo"
					value={product.codigo}
					required
				/>
				<input
					class="input input--large"
					placeholder="Tipo"
					list="types"
					name="tipo"
					bind:value={selectedType}
					required
				/>
				<datalist id="types">
					{#each SINGULAR_LABELS as label (label)}
						<option value={label}>{label}</option>
					{/each}
				</datalist>
			</div>

			<input
				class="input input--large"
				placeholder="Detalle"
				name="detalle"
				value={product.detalle}
				required
			/>

			<div class="flex gap-5">
				<input
					class="input"
					placeholder="Cantidad"
					type="number"
					name="cantidad"
					value={product.cantidad}
					required
				/>
				<input class="input input--large" placeholder="Notas" name="notas" value={product.notas} />
			</div>

			<datalist id="materials">
				<option value="Aluminio y plastico">Aluminio y plastico</option>
				<option value="Cobre y bronce">Cobre y bronce</option>
				<option value="Brazado">Brazado</option>
			</datalist>

			{#if selectedSlug === 'radiador' || selectedSlug === 'panel'}
				<input
					class="input input--large"
					placeholder="Material"
					list="materials"
					name="material"
					transition:slide
					value={product.material}
					required
				/>
				<div class="flex gap-5">
					<input
						class="input"
						placeholder="Alto"
						name="alto"
						type="number"
						value={product.dimensiones?.alto}
					/>
					<input
						class="input"
						placeholder="Ancho"
						name="ancho"
						type="number"
						value={product.dimensiones?.ancho}
					/>
					<input
						class="input"
						placeholder="Espesor"
						name="espesor"
						type="number"
						value={product.dimensiones?.espesor}
					/>
				</div>
			{/if}

			{#if selectedSlug === 'panel'}
				<datalist id="filas">
					<option value="Supertubular">Supertubular</option>
					<option value="Aletado">Aletado</option>
					<option value="Rizado">Rizado</option>
				</datalist>
				<div class="flex gap-5" transition:slide>
					<input
						class="input input--large"
						placeholder="Numero de filas"
						name="numero-filas"
						type="number"
						value={product.filas?.numero}
					/>
					<input
						class="input input--large"
						placeholder="Tipo de filas"
						name="tipo-filas"
						list="filas"
						value={product.filas?.tipo}
					/>
				</div>
			{:else if selectedSlug === 'electroventilador'}
				<div class="flex gap-5" transition:slide>
					<input
						class="input input--large"
						placeholder="Diametro"
						name="diametro"
						type="number"
						value={product?.diametro}
					/>
					<input
						class="input input--large"
						placeholder="Numero de aspas"
						name="aspas"
						type="number"
						value={product?.aspas}
					/>
				</div>
			{/if}
		</div>

		<button
			type="submit"
			class="font-normal text-sm px-10 py-2 border rounded-full self-end hover:scale-105 hover:animate-none transition-transform"
		>
			Guardar cambios
		</button>
	</form>
</div>
