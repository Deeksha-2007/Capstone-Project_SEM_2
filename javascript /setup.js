// Overriding global fetch for mock API
const originalFetch = globalThis.fetch;
globalThis.fetch = async function (url) {
    if (url.includes("test.api.com/products")) {
        return originalFetch("./data.json");
    }
    return originalFetch(url);
};

export const app = {
    menuData: null,
    cart: [],
    savedMeals: [],
    builderState: {
        category: '', type: '', subType: '',
        config: [], currentStep: 0, selections: {},
    }
};