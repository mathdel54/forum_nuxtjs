<script setup>
import {ref} from 'vue';
import {useAuthStore} from '~/stores/auth';

const authStore = useAuthStore();

const showMenu = ref(false);

const logout = async () => {
  authStore.logout();
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

        <template v-if="authStore.isAuthenticated">
          <v-btn icon @click="showMenu = !showMenu">
            <v-icon>mdi-account</v-icon>
          </v-btn>

          <v-menu v-if="showMenu" v-model="showMenu" :close-on-content-click="false" location="bottom end">
            <v-card style="max-height: 300px; overflow-y: auto;">
              <v-card-text>
                <div class="text-h6">{{ authStore.currentUser?.username }}</div>
                <div v-if="authStore.isAdmin" class="text-subtitle-2">
                  Administrateur
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn block color="primary" to="/account/change-password">
                  Changer le mot de passe
                </v-btn>
                <v-btn block color="primary" @click="logout">
                  Déconnexion
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>
        <template v-else>
          <v-btn tag="a" to="/login" variant="text">
            Connexion
          </v-btn>
          <v-btn tag="a" to="/register" variant="text">
            Inscription
          </v-btn>
        </template>
      </v-app-bar>

      <v-main>
        <slot/>
      </v-main>

      <v-footer app>
        <div class="text-center w-100">
          © {{ new Date().getFullYear() }} - Forum Nuxt.js
        </div>
      </v-footer>
    </v-app>
  </div>
</template>