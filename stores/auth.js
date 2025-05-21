// stores/auth.js
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null);
    const currentUser = ref(null);

    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => currentUser.value?.is_admin === 1);

    async function fetchUser() {
        try {
            const res = await $fetch('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });
            currentUser.value = res?.user ?? null;
            return currentUser.value;
        } catch (e) {
            currentUser.value = null;
            return null;
        }
    }

    async function login(username, password) {
        try {
            const res = await $fetch('/api/auth/login', {
                method: 'POST',
                body: {username, password},
            });
            token.value = res.token;
            currentUser.value = res.user;
            return res;
        } catch (e) {
            throw new Error(e?.data?.message || 'Login failed');
        }
    }

    function logout() {
        token.value = null;
        currentUser.value = null;
    }

    return {
        token,
        currentUser,
        isAuthenticated,
        isAdmin,
        fetchUser,
        login,
        logout,
    };
}, {
    persist: true, // Active la persistance pour ce store
});