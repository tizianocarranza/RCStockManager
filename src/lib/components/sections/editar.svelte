<script>
	import { edit } from '$lib/icons';
	import { add } from '$lib/icons';
	import { currentDisplayed } from '$lib/shared/displayed.svelte';
	import { changeDisplay } from '$lib/logic/displayed';

	const handleClick = () => {
		changeDisplay('edit');
	};
</script>

<section class="section editar">
	<button type="button" onclick={handleClick} title="Editar producto.">
		<img src={edit} alt="Edit icon" class="section-button__icon" />
	</button>
</section>
