<script setup>
const auth = useAuth();
const showMenu = ref(false);

const logout = async () => {
    await auth.logout();
    showMenu.value = false;
    navigateTo('/');
};
</script>

<template>
    <div>
        <v-app>
            <v-app-bar color="primary" dark>
                <v-app-bar-title>
                    <NuxtLink to="/" class="text-white text-decoration-none">Forum Nuxt.js</NuxtLink>
                </v-app-bar-title>

                <v-spacer></v-spacer>

                <template v-if="auth.isAuthenticated">
                    <v-btn icon @click="showMenu = !showMenu">
                        <v-icon>mdi-account</v-icon>
                    </v-btn>

                    <v-menu v-model="showMenu" :close-on-content-click="false" location="bottom end">
                        <v-card min-width="200">
                            <v-card-text>
                                <div class="text-h6">{{ auth.user.username }}</div>
                                <div v-if="auth.user.is_admin" class="text-caption mb-2">Administrateur</div>
                            </v-card-text>
                            <v-divider></v-divider>
                            <v-card-actions>
                                <v-btn block color="primary" @click="logout">
                                    Déconnexion
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                </template>

                <template v-else>
                    <v-btn to="/login" variant="text">
                        Connexion
                    </v-btn>
                    <v-btn to="/register" variant="text">
                        Inscription
                    </v-btn>
                </template>
            </v-app-bar>

            <v-main>
                <NuxtPage />
            </v-main>

            <v-footer app>
                <div class="text-center w-100">
                    © {{ new Date().getFullYear() }} - Forum Nuxt.js
                </div>
            </v-footer>
        </v-app>
    </div>
</template>