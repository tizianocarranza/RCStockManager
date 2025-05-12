import { selectedProduct } from "$lib/shared/products.svelte";

export const selectProduct = (product) => {
    selectedProduct.product = product;
};