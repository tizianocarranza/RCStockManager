<script>
	let { children } = $props();
	import '../app.css';
	import { InformationPopup } from '$lib/components';
	import { popup } from '$lib/stores/popup';
</script>

<InformationPopup
	message={$popup.message}
	type={$popup.type}
	show={$popup.show}
	on:close={() => popup.hide()}
/>

{@render children()}
