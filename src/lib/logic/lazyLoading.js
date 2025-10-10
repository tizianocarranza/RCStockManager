import { products } from '$lib/shared/products.svelte';

// Map UI labels to API keys
const filterLabelToApiKey = {
    'Radiadores': 'radiadores',
    'Paneles': 'paneles',
    'Electroventiladores': 'electroventiladores',
    'Calefactores': 'calefactores',
    'Evaporadores': 'evaporadores',
    'Condensadores': 'condensadores',
    'Intercoolers': 'intercoolers',
    'Encauzadores': 'encauzadores',
    'Tanques de combustible': 'tanquescombustible',
    'Compresores': 'compresores',
    'Vasos recuperadores': 'vasosrecuperadores',
    'Enfriadores de aceite': 'enfriadoresaceite'
};

// Map API keys to product collection keys
const apiKeyToCollectionKey = {
    'radiadores': 'radiadores',
    'paneles': 'paneles',
    'electroventiladores': 'electroventiladores',
    'calefactores': 'calefactores',
    'evaporadores': 'evaporadores',
    'condensadores': 'condensadores',
    'intercoolers': 'intercoolers',
    'encauzadores': 'encauzadores',
    'tanquescombustible': 'tanquesCombustible',
    'compresores': 'compresores',
    'vasosrecuperadores': 'vasosRecuperadores',
    'enfriadoresaceite': 'enfriadoresAceite'
};

/**
 * Loads products of a specific type if not already loaded
 * @param {string} filterLabel - The UI label for the product type
 * @returns {Promise<boolean>} - Returns true if products were loaded, false if already loaded
 */
export async function loadProductsByType(filterLabel) {
    const apiKey = filterLabelToApiKey[filterLabel];
    const collectionKey = apiKeyToCollectionKey[apiKey];
    
    if (!apiKey || !collectionKey) {
        console.error(`Unknown product type: ${filterLabel}`);
        return false;
    }

    // Check if already loaded
    if (products.loadedTypes.has(apiKey)) {
        return false;
    }

    // Check if currently loading
    if (products.loadingTypes.has(apiKey)) {
        return false;
    }

    try {
        // Mark as loading
        products.loadingTypes.add(apiKey);
        
        // Fetch products from API
        const response = await fetch(`/api/products/${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.products) {
            // Add products to the collection
            products.allProducts[collectionKey] = data.products;
            products.filteredProducts[collectionKey] = data.products;
            
            // Mark as loaded
            products.loadedTypes.add(apiKey);
            
            console.log(`Loaded ${data.products.length} products of type: ${filterLabel}`);
            return true;
        } else {
            throw new Error(data.error || 'Failed to load products');
        }
    } catch (error) {
        console.error(`Error loading products for ${filterLabel}:`, error);
        throw error;
    } finally {
        // Remove from loading set
        products.loadingTypes.delete(apiKey);
    }
}

/**
 * Checks if a product type is loaded
 * @param {string} filterLabel - The UI label for the product type
 * @returns {boolean}
 */
export function isProductTypeLoaded(filterLabel) {
    const apiKey = filterLabelToApiKey[filterLabel];
    return products.loadedTypes.has(apiKey);
}

/**
 * Checks if a product type is currently loading
 * @param {string} filterLabel - The UI label for the product type
 * @returns {boolean}
 */
export function isProductTypeLoading(filterLabel) {
    const apiKey = filterLabelToApiKey[filterLabel];
    return products.loadingTypes.has(apiKey);
}
