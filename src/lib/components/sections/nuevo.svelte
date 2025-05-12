<script>
        import { add } from "$lib/icons";
        import { currentDisplayed } from "$lib/shared/displayed.svelte";
        import { changeDisplay } from "$lib/logic/displayed";

        const handleClick = () => {
            changeDisplay("new");
        }
</script>

<section class="section nuevo">
    <button type="button" onclick={handleClick} class="section-button" title="Registrar nuevo producto.">
        <img src={add} alt="Add icon" class="section-button__icon" />
    </button>
</section>