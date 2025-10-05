export let products = $state({
    allProducts: {},
    filteredProducts: {}
})
export let selectedProduct = $state({
    product: {}
})
export let filters = $state({
    showFilters: false,
    selectedFilter: null,
})
