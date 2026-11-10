<script>
	import {
		Chart,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip
	} from 'chart.js';

	Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

	/** Envoltorio mínimo de Chart.js: crea el gráfico, lo actualiza y lo destruye. */
	let { type = 'bar', data, options = {}, label = 'Gráfico' } = $props();

	let canvas = $state();
	let chart;

	$effect(() => {
		// $state.snapshot: Chart.js muta los objetos, no le pasamos proxies reactivos
		const config = {
			type,
			data: $state.snapshot(data),
			options: $state.snapshot(options)
		};
		if (!chart) {
			chart = new Chart(canvas, config);
		} else {
			chart.data = config.data;
			chart.options = config.options;
			chart.update();
		}
	});

	$effect(() => () => {
		chart?.destroy();
		chart = undefined;
	});
</script>

<canvas bind:this={canvas} aria-label={label}></canvas>
