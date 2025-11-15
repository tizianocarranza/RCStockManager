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
	<div class="absolute inset-0 flex items-end justify-end pointer-events-none select-none z-0">
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

<style>
.last-updated-watermark {
    position: relative;
    overflow: hidden;
    color: transparent;
    background-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.25) 0%,
        rgba(255, 255, 255, 1) 10%,
        rgba(255, 255, 255, 0.25) 20%
    );
    background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    opacity: 0.08;
    /* opacity: 0.08; */
    font-weight: 900;
    font-style: italic;
    letter-spacing: 4px;
    filter: brightness(0.75) blur(1px);
    pointer-events: none;
    user-select: none;
    background-size: 250%;
    background-position: -100% 0;
    animation: shine 4s linear infinite;
    transform-origin: center;
}



/* Breathing effect */
@keyframes shine {
    0% {
        background-position: 100% 0;
        opacity: 0.15;

    }
    30% {
        background-position: -100% 0;
        opacity: 0.25;

    }
    70% {
        background-position: -100% 0;
        opacity: 0.25;

    }
    100% {
        background-position: -100% 0;
        opacity: 0.15;

    }
}
</style>