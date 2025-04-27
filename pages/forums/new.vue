<script setup>
const auth = useAuth();
const router = useRouter();

// Rediriger si l'utilisateur n'est pas admin
onMounted(async () => {
  if (!auth.user?.is_admin) {
    router.push('/');
  }
});

const name = ref('');
const error = ref('');
const loading = ref(false);

const createForum = async () => {
  if (!name.value) {
    error.value = 'Le nom du forum est requis';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const { data, error: fetchError } = await useFetch('/api/forums', {
      method: 'POST',
      body: { name: name.value }
    });
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message);
    }
    
    if (data.value?.error) {
      throw new Error(data.value.error);
    }
    
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
    <h1>Nouveau forum</h1>
    
    <v-card class="mt-4">
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <v-form @submit.prevent="createForum">
          <v-text-field
            v-model="name"
            label="Nom du forum"
            required
          ></v-text-field>
          
          <div class="d-flex justify-end mt-4">
            <v-btn 
              color="secondary" 
              class="me-4" 
              to="/"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
            >
              Créer le forum
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>