import { products } from "$lib/shared/products.svelte";

/**
 * Load products by UI label (singular or plural)
 * @param {string} filterLabel - The UI label for the product type
 * @returns {Promise<boolean>}
 */
export async function loadProductsByType(filterLabel) {
    console.log('%c[loadProductsByType]', 'color: cyan; font-weight: bold;', `Called with filterLabel: "${filterLabel}"`);

    try {
        if (products.loadedTypes.has(filterLabel)) {
            console.log('⚠️ Already loaded:', filterLabel);
            return false;
        }

        if (products.loadingTypes.has(filterLabel)) {
            console.log('⏳ Already loading:', filterLabel);
            return false;
        }

        console.log('🚀 Starting fetch for:', filterLabel);
        products.loadingTypes.add(filterLabel);

        const response = await fetch(`/api/products/${encodeURIComponent(filterLabel)}`);
        console.log('📡 Fetch complete. Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Received data:', data);

        if (data.success && data.products) {
            const collectionKey = filterLabel; // Use label as collection key on frontend
            products.allProducts[collectionKey] = data.products;
            products.filteredProducts[collectionKey] = data.products;

            products.loadedTypes.add(filterLabel);
            console.log('✅ Loaded products for:', filterLabel);
            return true;
        } else {
            console.error('❌ Invalid data structure or empty products list:', data);
            throw new Error(data.error || 'Failed to load products');
        }
    } catch (error) {
        console.error(`🔥 Error loading products for "${filterLabel}":`, error);
        throw error;
    } finally {
        products.loadingTypes.delete(filterLabel);
        console.log('🧹 Removed from loadingTypes:', Array.from(products.loadingTypes));
    }
}

/**
 * Checks if a product type is loaded by label
 */
export function isProductTypeLoaded(filterLabel) {
    const result = products.loadedTypes.has(filterLabel);
    if(products.loadedTypes.has(filterLabel))  console.log('%c[isProductTypeLoaded]', 'color: lime; font-weight: bold;', filterLabel, 'Products:', products.filteredProducts.filterLabel);
    console.log('%c[isProductTypeLoaded]', 'color: lime; font-weight: bold;', filterLabel, 'loaded:', result);
    return result;
}

/**
 * Checks if a product type is currently loading by label
 */
export function isProductTypeLoading(filterLabel) {
    const result = products.loadingTypes.has(filterLabel);
    console.log('%c[isProductTypeLoading]', 'color: orange; font-weight: bold;', filterLabel, 'loading:', result);
    return result;
}
