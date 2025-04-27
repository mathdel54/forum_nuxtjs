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
    const user = useState<UserState>('user', () => null);
    const isAuthenticated = computed(() => !!user.value);

    const fetchUser = async () => {
        const { data } = await useFetch<AuthResponse>('/api/auth/me');
        if (data.value?.authenticated) {
            user.value = data.value.user;
        } else {
            user.value = null;
        }

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

        // Initialiser l'authentification
        onMounted(async () => {
            if (!user.value) {
                await fetchUser();
            }
        });

        return {
            user,
            isAuthenticated,
            login,
            logout,
            fetchUser
        };
    }
}