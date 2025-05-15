<script>
	import { dollar } from '$lib/icons';
	import { slide } from 'svelte/transition';
	import { selectedProduct } from '$lib/shared/products.svelte';

	let product = selectedProduct.product;
</script>

<div class="flex h-full w-full gap-20">
	<div
		class="flex flex-col flex-wrap justify-between w-full lg:w-1/2 p-8 gap-10 bg-gray-500/20 rounded-lg shadow-lg border border-gray-300 hover:bg-gray-500/30 transition-all duration-300 h-auto text-gray-200 overflow-hidden"
	>
		<div class="relative flex flex-col gap-1 justify-center items-center w-full border-b pb-5">
			<div class="absolute top-0 left-0 bold self-start {product.cantidad < 2 ? "text-red-300 animate-pulse" : product.cantidad < 3 ? "text-yellow-200" : "text-green-200"}">
				{product.cantidad}
			</div>
			<p class="text-lg font-semibold text-red-200">{product.codigo}</p>
			<p class="text-sm italic text-gray-900 py-1 px-4 rounded-full bg-gray-200/20 font-light">
				{product.tipo.toUpperCase()}
			</p>
		</div>

		<div class="flex gap-1 flex-col">
			<p class="font-light">{product.detalle}</p>
			{#if product.marca}
				<p class="flex text-sm font-light p-1 rounded bg-gray-200/20">{product.marca}</p>
			{/if}
		</div>

		<div class="flex justify-between">
			<div
				class="flex flex-col gap-2 flex-wrap justify-between w-full h-auto text-xs overflow-hidden"
			>
				{#if product.material}
					<p
						class="text-sm font-semibold"
						class:text-yellow-800={product.material === 'Cobre y bronce'}
						class:text-gray-400={product.material === 'Aluminio y plastico'}
						class:text-blue-200={product.material === 'Brazado'}
					>
						{product.material}
					</p>
				{/if}
				{#if product.filas}
					<p class="text-sm font-normal">
						{product.filas.numero}
						{product.filas.numero > 1 ? 'filas' : 'fila'}
						<span class="italic">{product.filas.tipo}</span>
					</p>
				{/if}

				{#if product.tipo === 'electroventilador'}
					<p class="text-sm">{product.aspas || 'N/A'} Aspas</p>
					<p class="text-sm">Diámetro: {product.diametro || 'N/A'} cm</p>
				{/if}
			</div>
		</div>

		{#if product.notas}
			<p class="text-sm italic">{product.notas}</p>
		{/if}
	</div>

	<!-- Product Dimensions -->
	<div class="hidden lg:block relative h-full w-1/2 p-2 text-xs">
		{#if product.dimensiones}
			<div
				class="relative pl-5 pb-5 font-light border-l border-b border-dashed h-full w-full overflow-hidden"
			>
				<!-- Graphic -->
				<div
					class="flex items-center justify-center absolute top-1/2 left-1/2 -translate-1/2 rounded border-l border-y border-gray-500/20 bg-gray-500/20 max-h-full max-w-full"
					style="
					border-right: {product.dimensiones.espesor * 3}px solid rgba(106, 114, 130, 0.2);
					transform: perspective(200px) rotateY(-20deg);
					height: {product.dimensiones.alto * 2}px;
					width: {product.dimensiones.ancho * 2}px;
					"
				>
					<!-- Height -->
					<p
						class="absolute top-1/2 left-0 -translate-y-1/2 origin-bottom-left -rotate-90 text-sm pb-1"
					>
						{product.dimensiones.alto}cm
					</p>

					<!-- Width -->
					<p class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-1">
						{product.dimensiones.ancho}cm
					</p>
					<div
						class="text-gray-300 border-b border-dashed pl-1 pr-3"
						style="transform: perspective(200px) rotateY(50deg);"
					>
						{product.dimensiones.espesor}cm
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- 
	



-->
