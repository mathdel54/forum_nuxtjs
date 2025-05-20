import { useStorage } from '@vueuse/core';

interface AuthResponse {
    authenticated?: boolean;
    user?: any;
}

interface LoginResponse {
    error?: string;

    [key: string]: any;
}

// Define a type for the user state
type UserState = LoginResponse | any | null;

export const useAuth = () => {
    const user = useStorage<UserState>('user', null); // Utilise localStorage pour persister l'état
    const isAuthenticated = computed(() => !!user.value);

    //is admin
    const isAdmin = computed(() => {
        return user?.value?.is_admin === 1;
    });

    const fetchUser = async () => {
        console.log('Fetching user...');
        try {
            const { data } = await useFetch<AuthResponse>('/api/auth/me');
            console.log('User data:', data.value);
            if (data.value?.authenticated) {
                console.log('User is authenticated:', data.value.user);
                user.value = data.value.user;
            } else {
                user.value = null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const login = async (username: string, password: string) => {
        const { data, error } = await useFetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: { username, password }
        });

        if (error.value) {
            throw new Error(error.value.message);
        }

        if (data.value?.error) {
            throw new Error(data.value.error);
        }

        user.value = data.value;
        return user.value;
    };

    const logout = async () => {
        await useFetch('/api/auth/logout');
        user.value = null;
    };

    return {
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        fetchUser
    };
};