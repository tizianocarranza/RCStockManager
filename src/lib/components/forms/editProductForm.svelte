<script>
	import { changeDisplay } from '$lib/logic/displayed';
	import { selectedProduct } from '$lib/shared/products.svelte';
	import { slide } from 'svelte/transition';
	import { popup } from '$lib/stores/popup';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { selectProduct } from '$lib/logic/products';
	import { app } from '$lib/shared/app.svelte';

	let product = selectedProduct.product;
	let selectedType = $state(
		product.tipo === 'radiador'
			? 'Radiador'
			: product.tipo === 'panel'
				? 'Panel'
				: product.tipo === 'electroventilador'
					? 'Electroventilador'
					: product.tipo === 'calefactor'
						? 'Calefactor'
						: product.tipo === 'evaporador'
							? 'Evaporador'
							: product.tipo === 'condensador'
								? 'Condensador'
								: product.tipo === 'intercooler'
									? 'Intercooler'
									: product.tipo === 'encauzador'
										? 'Encauzador'
										: product.tipo === 'tanque-combustible'
											? 'Tanque de combustible'
											: product.tipo === 'compresor'
												? 'Compresor'
												: product.tipo === 'vaso-recuperador'
													? 'Vaso recuperador'
													: product.tipo === 'enfriador-aceite'
														? 'Enfriador de aceite'
														: 'Otro'
	);

	function handleSubmit() {
		app.loading = true;
		return async ({ result }) => {
			if (result.type === 'failure') {
				popup.showError(result.data?.message || 'Error al actualizar el producto');
			} else if (result.type === 'success') {
				popup.showSuccess(result.data?.message || 'Producto actualizado exitosamente');
				if (result.data?.producto) {
					selectProduct(result.data.producto);
					changeDisplay('product');
				}
				await invalidateAll();
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
					<option value="Radiador">Radiador</option>
					<option value="Panel">Panel</option>
					<option value="Electroventilador">Electroventilador</option>
					<option value="Calefactor">Calefactor</option>
					<option value="Evaporador">Evaporador</option>
					<option value="Condensador">Condensador</option>
					<option value="Intercooler">Intercooler</option>
					<option value="Encauzador">Encauzador</option>
					<option value="Tanque de combustible">Tanque de combustible</option>
					<option value="Compresor">Compresor</option>
					<option value="Vaso recuperador">Vaso recuperador</option>
					<option value="Enfriador de aceite">Enfriador de aceite</option>
					<option value="Otro">Otro</option>
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

			{#if selectedType === 'Radiador' || selectedType === 'Panel'}
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
			{:else if selectedType === 'Electroventilador'}
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
