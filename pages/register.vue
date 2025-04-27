<script setup>
const auth = useAuth();
const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const register = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    error.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const { data, error: fetchError } = await useFetch('/api/users', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    });
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message);
    }
    
    if (data.value?.error) {
      throw new Error(data.value.error);
    }
    
    // Connecter l'utilisateur après l'inscription
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
          <v-card-title>Inscription</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error" class="mb-4">
              {{ error }}
            </v-alert>
            
            <v-form @submit.prevent="register">
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
              
              <v-text-field
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                required
              ></v-text-field>
              
              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="loading"
                >
                  S'inscrire
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
        
        <div class="text-center mt-4">
          <p>Déjà inscrit ? <NuxtLink to="/login">Se connecter</NuxtLink></p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>