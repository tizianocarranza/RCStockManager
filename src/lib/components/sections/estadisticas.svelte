<script>
	import { chart } from '$lib/icons';
	import { changeDisplay } from '$lib/logic/displayed';
	import { currentDisplayed } from '$lib/shared/displayed.svelte';
</script>

<section class="section estadisticas" class:estadisticas--active={currentDisplayed.stats}>
	<button
		type="button"
		onclick={() => changeDisplay('stats')}
		class="section-button"
		title="Ver estadísticas."
		aria-label="Ver estadísticas"
	>
		<img src={chart} alt="" class="section-button__icon" />
	</button>
</section>
