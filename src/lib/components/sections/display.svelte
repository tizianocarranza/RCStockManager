<script>
    import { ProductCard, NewProductForm, EditProductForm, SearchDisplay, ProductDisplay } from "$lib/components"
    import { currentDisplayed } from "$lib/shared/displayed.svelte";
</script>

<section class="section display">
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
</section>