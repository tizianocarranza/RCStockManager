<script>
	import {
		ProductCard,
		NewProductForm,
		EditProductForm,
		SearchDisplay,
		ProductDisplay
	} from '$lib/components';
	import { formatTime } from '$lib/logic/utils';
	import { app } from '$lib/shared/app.svelte';
	import { currentDisplayed } from '$lib/shared/displayed.svelte';
</script>

<section class="section display">
	<div class="absolute inset-0 px-1 flex items-end justify-end pointer-events-none select-none z-0">
		<p class="last-updated-watermark text-8xl md:text-[200px]">
			{formatTime(app.lastUpdated)}
		</p>
	</div>
	<div class="h-full w-full z-10">
		{#if currentDisplayed.search}
			<SearchDisplay />
		{:else if currentDisplayed.product}
			<ProductDisplay />
		{:else if currentDisplayed.new}
			<NewProductForm />
		{:else if currentDisplayed.edit}
			<EditProductForm />
		{:else if currentDisplayed.stats}
			<p>stats</p>
		{/if}
	</div>
</section>