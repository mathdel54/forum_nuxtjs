import {computed, ref} from 'vue';

const token = ref(localStorage.getItem('token') || null);
const currentUser = ref(null);

export const isAuthenticated = computed(() => !!token.value);
export const isAdmin = computed(() => currentUser.value?.is_admin === 1);

export async function fetchUser() {
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

export async function login(username, password) {
    try {
        const res = await $fetch('/api/auth/login', {
            method: 'POST',
            body: {username, password},
        });
        token.value = res.token;
        localStorage.setItem('token', res.token);
        currentUser.value = res.user;
        return res;
    } catch (e) {
        throw new Error(e?.data?.message || 'Login failed');
    }
}


export async function logout() {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem('token');
}

export function useUser() {
    return currentUser;
}