<script>
	import { slide } from 'svelte/transition';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { selectProduct } from '$lib/logic/products';
	import { changeDisplay } from '$lib/logic/displayed';
	import { app } from '$lib/shared/app.svelte';
	import { selectedProduct, products } from '$lib/shared/products.svelte';
	import { modelTypeToCategoryLabel } from '$lib/logic/utils';
	import { loadProductsByType } from '$lib/logic/lazyLoading';
	let selectedType = $state('');

	function handleSubmit() {
		app.loading = true;
		return async ({ result }) => {
			const r = result.data?.actionResult;

			if (result.type === 'failure') {
				popup.showError(r?.message || 'Error al crear el producto');
			} else if (result.type === 'success') {
				popup.showSuccess(r?.message || 'Producto creado exitosamente');
				selectedType = '';
				if (r?.producto) {
					selectProduct(r.producto);
					changeDisplay('product');
				}
				const product = selectedProduct.product;
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

<div class="h-full w-full flex flex-col p-5 gap-10" in:slide>
	<h1 class="hidden lg:inline-block p-2 pb-5 border-b text-4xl">
		Nuevo {selectedType === 'Radiador' ||
		selectedType === 'Electroventilador' ||
		selectedType === 'Panel'
			? selectedType
			: 'Producto'}
	</h1>
	<form
		class="flex flex-col lg:flex-row gap-5 lg:gap-10 w-full h-full justify-between rounde overflow-y-auto"
		method="post"
		action="?/createProduct"
		use:enhance={handleSubmit}
	>
		<div class="flex flex-col gap-10 h-full flex-wrap">
			<div class="flex gap-5">
				<input class="input input--large" placeholder="Codigo" name="codigo" required />
				<input
					class="input input--large"
					placeholder="Tipo"
					list="types"
					name="tipo"
					bind:value={selectedType}
					required
				/>
				<datalist id="types">
					<option value="Radiador">Radiador</option>
					<option value="Panel">Panel</option>
					<option value="Electroventilador">Electroventilador</option>
					<option value="Calefactor">Calefactor</option>
					<option value="Evaporador">Evaporador</option>
					<option value="Condensador">Condensador</option>
					<option value="Intercooler">Intercooler</option>
					<option value="Encauzador">Encauzador</option>
					<option value="Tanque de combustible">Tanque de combustible</option>
					<option value="Kit de distribucion">Kit de distribucion</option>
					<option value="Bomba de agua">Bomba de agua</option>
					<option value="Termostato">Termostato</option>
					<option value="Compresor">Compresor</option>
					<option value="Vaso recuperador">Vaso recuperador</option>
					<option value="Enfriador de aceite">Enfriador de aceite</option>
					<option value="Otro">Otro</option>
				</datalist>
			</div>
			<input class="input input--large" placeholder="Detalle" name="detalle" required />
			<div class="flex gap-5">
				<input class="input" placeholder="Cantidad" type="number" name="cantidad" required />
				<input class="input input--large" placeholder="Notas" name="notas" />
			</div>
			<datalist id="materials">
				<option value="Aluminio y plastico">Aluminio y plastico</option>
				<option value="Cobre y bronce">Cobre y bronce</option>
				<option value="Brazado">Brazado</option>
			</datalist>
			{#if selectedType === 'Radiador' || selectedType === 'Panel'}
				<div class="flex flex-col gap-10">
					<input
						class="input input--large"
						placeholder="Material"
						list="materials"
						name="material"
						transition:slide
						required
					/>
					<div class="flex gap-5">
						<input class="input" placeholder="Alto" name="alto" type="number" />
						<input class="input" placeholder="Ancho" name="ancho" type="number" />
						<input class="input" placeholder="Espesor" name="espesor" type="number" />
					</div>
				</div>
			{/if}
			{#if selectedType === 'Panel'}
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
					/>
					<input
						class="input input--large"
						placeholder="Tipo de filas"
						name="tipo-filas"
						list="filas"
					/>
				</div>
			{:else if selectedType === 'Electroventilador'}
				<div class="flex gap-5" transition:slide>
					<input class="input input--large" placeholder="Diametro" name="diametro" type="number" />
					<input
						class="input input--large"
						placeholder="Numero de aspas"
						name="aspas"
						type="number"
					/>
				</div>
			{/if}
		</div>
		<button
			type="submit"
			class="font-normal text-sm px-10 py-2 border rounded-full self-end hover:animate-none animate-pulse"
			>Guardar</button
		>
	</form>
</div>
