export let products = $state({
    allProducts: {},
    filteredProducts: {},
    loadedTypes: new Set(['radiadores']), // Track which types are loaded
    loadingTypes: new Set() // Track which types are currently loading
})
export let selectedProduct = $state({
    product: {}
})
export let filters = $state({
    showFilters: false,
    selectedFilter: 'Radiadores',
})
