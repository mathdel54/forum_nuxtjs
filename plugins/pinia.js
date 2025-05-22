import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
    const pinia = createPinia();

    // Use the plugin only on the client side
    if (process.client) {
        pinia.use(piniaPluginPersistedstate);
    }

    nuxtApp.vueApp.use(pinia);
});