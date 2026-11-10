<script>
	import { slide } from 'svelte/transition';
	import { Chart } from '$lib/components';
	import { RANGES, bucketLabel } from '$lib/logic/statsRange';
	import { pluralOf, singularOf } from '$lib/logic/productTypes';
	import { loadProductsByType } from '$lib/logic/lazyLoading';
	import { selectProduct } from '$lib/logic/products';
	import { changeDisplay } from '$lib/logic/displayed';
	import { products } from '$lib/shared/products.svelte';
	import { statsState } from '$lib/shared/stats.svelte';
	import { popup } from '$lib/stores/popup';

	// Paleta validada (dataviz) para superficie oscura
	const COLORS = {
		ingreso: '#3987e5',
		egreso: '#d95926',
		text: '#f0efec',
		textMuted: '#c3c2b7',
		grid: 'rgba(240, 239, 236, 0.08)',
		surface: '#1a1a19'
	};

	let stats = $state(null);
	let loading = $state(false);
	let error = $state('');

	$effect(() => {
		const range = statsState.range;
		statsState.version; // dependencia: el botón de refrescar incrementa esto
		const controller = new AbortController();
		loading = true;
		error = '';
		fetch(`/api/stats?range=${range}`, { signal: controller.signal })
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
				stats = await res.json();
			})
			.catch((e) => {
				if (e.name !== 'AbortError') error = 'No se pudieron cargar las estadísticas.';
			})
			.finally(() => {
				if (!controller.signal.aborted) loading = false;
			});
		return () => controller.abort();
	});

	const fmt = (n) => (n ?? 0).toLocaleString('es-AR');
	const BUCKET_NAMES = { hour: 'hora', day: 'día', week: 'semana', month: 'mes' };
	const currentRange = $derived(RANGES.find((r) => r.key === statsState.range));
	const rangeLabel = $derived(currentRange?.label ?? '');
	const hayMovimientos = $derived((stats?.totales.movimientos ?? 0) > 0);

	const chartData = $derived(
		stats && {
			labels: stats.serie.map((p) => bucketLabel(p.key, stats.range.bucket)),
			datasets: [
				{ label: 'Ingresos', data: stats.serie.map((p) => p.ingreso), backgroundColor: COLORS.ingreso },
				{ label: 'Egresos', data: stats.serie.map((p) => p.egreso), backgroundColor: COLORS.egreso }
			].map((d) => ({
				...d,
				borderRadius: 4,
				borderSkipped: 'start',
				maxBarThickness: 18,
				categoryPercentage: 0.8,
				barPercentage: 0.9
			}))
		}
	);

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 250 },
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: COLORS.surface,
				borderColor: 'rgba(240, 239, 236, 0.2)',
				borderWidth: 1,
				titleColor: COLORS.text,
				bodyColor: COLORS.text,
				padding: 10,
				boxPadding: 4,
				callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)} u.` }
			}
		},
		scales: {
			x: {
				grid: { display: false },
				border: { color: COLORS.grid },
				ticks: { color: COLORS.textMuted, maxRotation: 0, autoSkipPadding: 12 }
			},
			y: {
				beginAtZero: true,
				border: { display: false },
				grid: { color: COLORS.grid },
				ticks: { color: COLORS.textMuted, precision: 0 }
			}
		}
	};

	async function openProduct(ref) {
		const label = pluralOf(ref.tipo);
		try {
			await loadProductsByType(label);
			const product = products.allProducts[label]?.find((p) => p._id === ref._id);
			if (!product) {
				popup.showError('El producto ya no existe o cambió de tipo.');
				return;
			}
			selectProduct(product);
			changeDisplay('product');
		} catch {
			popup.showError('No se pudo abrir el producto.');
		}
	}
</script>

{#snippet tile(label, value, sub)}
	<div class="flex flex-col gap-1 rounded-xl bg-white/5 p-4">
		<p class="text-xs font-normal text-[#c3c2b7]">{label}</p>
		<p class="text-2xl font-bold tabular-nums lg:text-3xl">{value}</p>
		{#if sub}<p class="text-xs font-normal text-[#c3c2b7]">{sub}</p>{/if}
	</div>
{/snippet}

{#snippet rankList(title, items, color, unit)}
	<div class="flex flex-col gap-3 rounded-xl bg-white/5 p-4">
		<h3 class="text-sm font-semibold">{title}</h3>
		{#if items.length === 0}
			<p class="text-xs font-normal text-[#c3c2b7]">Sin movimientos en este período.</p>
		{:else}
			{@const max = Math.max(...items.map((i) => i.unidades))}
			<ol class="flex flex-col gap-1">
				{#each items as item, i (item._id)}
					<li>
						<button
							type="button"
							class="group grid w-full grid-cols-[1.25rem_minmax(0,1fr)_3rem] items-center gap-x-2 rounded-md px-1 py-1 text-left hover:bg-white/10"
							onclick={() => openProduct(item)}
							title="{item.codigo} · {item.detalle}"
						>
							<span class="text-xs font-normal text-[#c3c2b7] tabular-nums">{i + 1}</span>
							<span class="flex min-w-0 flex-col gap-1">
								<span class="truncate text-xs font-normal">
									<span class="font-semibold">{item.codigo}</span>
									<span class="text-[#c3c2b7]"> {item.detalle}</span>
								</span>
								<span class="block h-1.5 w-full rounded-full bg-white/5">
									<span
										class="block h-full rounded-full"
										style="width: {(item.unidades / max) * 100}%; background: {color}"
									></span>
								</span>
							</span>
							<span class="text-right text-sm tabular-nums">{fmt(item.unidades)}{unit}</span>
						</button>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
{/snippet}

{#snippet productList(title, subtitle, items, valueOf)}
	<div class="flex flex-col gap-3 rounded-xl bg-white/5 p-4">
		<div>
			<h3 class="text-sm font-semibold">{title}</h3>
			{#if subtitle}<p class="text-xs font-normal text-[#c3c2b7]">{subtitle}</p>{/if}
		</div>
		{#if items.length === 0}
			<p class="text-xs font-normal text-[#c3c2b7]">Nada para mostrar.</p>
		{:else}
			<ul class="flex flex-col gap-1">
				{#each items as item (item._id)}
					<li>
						<button
							type="button"
							class="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-white/10"
							onclick={() => openProduct(item)}
						>
							<span class="min-w-0 flex-1 truncate text-xs font-normal">
								<span class="font-semibold">{item.codigo}</span>
								<span class="text-[#c3c2b7]"> {item.detalle}</span>
							</span>
							<span class="shrink-0 text-xs font-normal text-[#c3c2b7]">{singularOf(item.tipo)}</span>
							<span class="w-10 shrink-0 text-right text-sm tabular-nums">{valueOf(item)}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}

<div class="flex h-full w-full flex-col gap-5 overflow-y-auto p-2 lg:p-5" in:slide>
	<!-- Filtros de tiempo -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl lg:text-3xl">Estadísticas</h1>
		<div class="flex flex-wrap gap-0.5 rounded-full bg-white/5 p-1" role="group" aria-label="Período">
			{#each RANGES as r (r.key)}
				<button
					type="button"
					class="rounded-full px-2.5 py-1 text-xs whitespace-nowrap lg:px-3 font-normal transition-colors lg:text-sm {statsState.range ===
					r.key
						? 'bg-white/20 text-white'
						: 'text-[#c3c2b7] hover:bg-white/10'}"
					aria-pressed={statsState.range === r.key}
					onclick={() => (statsState.range = r.key)}
				>
					{r.label}
				</button>
			{/each}
		</div>
	</div>

	{#if error}
		<p class="rounded-xl bg-white/5 p-4 text-sm font-normal">{error}</p>
	{:else if !stats}
		<p class="animate-pulse text-sm font-normal text-[#c3c2b7]">Cargando estadísticas…</p>
	{:else}
		<div class="flex flex-col gap-5 transition-opacity" class:opacity-50={loading}>
			<!-- Indicadores -->
			<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
				{@render tile('Unidades vendidas', fmt(stats.totales.egreso), `Egresos · ${rangeLabel}`)}
				{@render tile('Unidades ingresadas', fmt(stats.totales.ingreso), `Ingresos · ${rangeLabel}`)}
				{@render tile(
					'Stock actual',
					fmt(stats.stock.unidades),
					`${fmt(stats.stock.productos)} productos`
				)}
				{@render tile(
					'Sin stock',
					fmt(stats.stock.sinStock),
					stats.stock.sinStock === 1 ? 'producto con 0 unidades' : 'productos con 0 unidades'
				)}
			</div>

			<!-- Serie temporal -->
			<div class="flex flex-col gap-3 rounded-xl bg-white/5 p-4">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<h3 class="text-sm font-semibold">
						Ingresos y egresos por {BUCKET_NAMES[stats.range.bucket]}
					</h3>
					<div class="flex gap-4 text-xs font-normal">
						<span class="flex items-center gap-1.5">
							<span class="size-2.5 rounded-sm" style="background: {COLORS.ingreso}"></span>Ingresos
						</span>
						<span class="flex items-center gap-1.5">
							<span class="size-2.5 rounded-sm" style="background: {COLORS.egreso}"></span>Egresos
						</span>
					</div>
				</div>
				{#if hayMovimientos}
					<div class="relative h-56 lg:h-64">
						<Chart
							data={chartData}
							options={chartOptions}
							label="Gráfico de barras de ingresos y egresos por período"
						/>
					</div>
					<details class="text-xs font-normal">
						<summary class="cursor-pointer text-[#c3c2b7] hover:text-white">Ver como tabla</summary>
						<div class="mt-2 max-h-60 overflow-y-auto">
							<table class="w-full tabular-nums">
								<thead class="sticky top-0 bg-[#1a1a19] text-[#c3c2b7]">
									<tr>
										<th class="py-1 text-left font-normal">Período</th>
										<th class="py-1 text-right font-normal">Ingresos</th>
										<th class="py-1 text-right font-normal">Egresos</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.serie as p (p.key)}
										<tr class="border-t border-white/5">
											<td class="py-1">{bucketLabel(p.key, stats.range.bucket)}</td>
											<td class="py-1 text-right">{fmt(p.ingreso)}</td>
											<td class="py-1 text-right">{fmt(p.egreso)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</details>
				{:else}
					<p class="py-10 text-center text-sm font-normal text-[#c3c2b7]">
						Todavía no hay movimientos en este período.
					</p>
				{/if}
			</div>

			<!-- Rankings -->
			<div class="grid gap-3 lg:grid-cols-2">
				{@render rankList('Más vendidos', stats.masVendidos, COLORS.egreso, ' u.')}
				{@render rankList('Más ingresados', stats.masIngresados, COLORS.ingreso, ' u.')}
			</div>

			<!-- Por tipo + alertas de stock -->
			<div class="grid gap-3 lg:grid-cols-3">
				<div class="flex flex-col gap-3 rounded-xl bg-white/5 p-4">
					<h3 class="text-sm font-semibold">Movimientos por tipo</h3>
					{#if stats.porTipo.length === 0}
						<p class="text-xs font-normal text-[#c3c2b7]">Sin movimientos en este período.</p>
					{:else}
						{@const max = Math.max(...stats.porTipo.flatMap((t) => [t.ingreso, t.egreso]))}
						<ul class="flex flex-col gap-2">
							{#each stats.porTipo as t (t.tipo)}
								<li class="flex flex-col gap-1">
									<span class="text-xs font-normal">{t.label}</span>
									{#each [['ingreso', 'Ingresos'], ['egreso', 'Egresos']] as [k, name] (k)}
										<span class="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-2" title="{name}: {fmt(t[k])}">
											<span class="block h-1.5 rounded-full bg-white/5">
												<span
													class="block h-full rounded-full"
													style="width: {(t[k] / max) * 100}%; background: {COLORS[k]}"
												></span>
											</span>
											<span class="text-right text-xs tabular-nums">{fmt(t[k])}</span>
										</span>
									{/each}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				{@render productList(
					'Stock bajo',
					'Productos con 0 o 1 unidad',
					stats.stock.stockBajo,
					(p) => fmt(p.cantidad)
				)}
				{@render productList(
					'Sin rotación',
					`${fmt(stats.stock.sinRotacion.total)} productos con stock y sin egresos ${currentRange?.phrase ?? ''}`,
					stats.stock.sinRotacion.items,
					(p) => fmt(p.cantidad)
				)}
			</div>
		</div>
	{/if}
</div>
