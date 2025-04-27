<script setup>
const auth = useAuth();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const login = async () => {
  if (!username.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    await auth.login(username.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Connexion</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>
            
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Nom d'utilisateur"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Mot de passe"
                type="password"
                required
              ></v-text-field>
              
              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  Se connecter
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
        
        <div class="text-center mt-4">
          <p>Pas encore de compte ? <NuxtLink to="/register">S'inscrire</NuxtLink></p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>