<script>
	import { slide } from 'svelte/transition';

	let selectedType = $state('');
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
	>
		<div class="flex flex-col gap-10 h-full flex-wrap">
			<div class="flex gap-5">
				<input class="input input--large" placeholder="Codigo" name="codigo" />
				<input
					class="input input--large"
					placeholder="Tipo"
					list="types"
					name="tipo"
					bind:value={selectedType}
				/>
				<datalist id="types">
					<option value="Radiador">Radiador</option>
					<option value="Panel">Panel</option>
					<option value="Electroventilador">Electroventilador</option>
					<option value="Otro">Otro</option>
				</datalist>
			</div>
			<input class="input input--large" placeholder="Detalle" name="detalle" />
			<div class="flex gap-5">
				<input class="input" placeholder="Cantidad" type="number" name="cantidad" />
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
