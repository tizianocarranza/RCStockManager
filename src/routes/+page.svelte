<script>
	import { slide } from 'svelte/transition';

	import {
		CloseButton,
		Buscar,
		Nuevo,
		Editar,
		Eliminar,
		Ingreso,
		Egreso,
		Display
	} from '$lib/components';
	import { search, add, packageExport, packageImport, fileSearch, dollar } from '$lib/icons';
	import { products } from '$lib/shared/products.svelte';
	import { currentDisplayed } from '$lib/shared/displayed.svelte.js';
	import { app } from '$lib/shared/app.svelte.js';
	import { formatTime } from '$lib/logic/utils.js';

	let { data } = $props();

	$effect(() => {
		if (data.allProducts) {
			console.log('\n\n\nLoading products\n\n\n', formatTime(new Date()));
			products.allProducts = data.allProducts;
			products.filteredProducts = data.allProducts;
		}
	});
</script>

<main class="relative h-screen w-screen overflow-hidden p-5 text-white">
	<!-- Background Layer with Animated Lights -->
	<div class="bg-animated-lights absolute inset-0"></div>

	<!-- Top Layer Grid (Asymmetrical Layout) -->
	<!-- Ingreso Section -->
	<div
		class="sections-container relative h-full w-full gap-2 {currentDisplayed.product
			? 'sections-container--product-display'
			: ''}"
		class:sections-container--loading={app.loading}
	>
		<!-- Buscar Section -->
		<Buscar />

		<!-- Nuevo Section -->
		<Nuevo />

		<Display />

		{#if currentDisplayed.product}
			<Eliminar />

			<Editar />

			<Ingreso />

			<Egreso />
		{/if}

		<!-- <section class="section estadisticas"></section> -->
	</div>
</main>
