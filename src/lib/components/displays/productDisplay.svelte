<script>
    import { slide } from "svelte/transition";
    import { ProductCard } from "$lib/components"
</script>

<div class="h-full w-full flex flex-wrap gap-20 p-5 items-center justify-center" in:slide>
    <ProductCard />
</div>