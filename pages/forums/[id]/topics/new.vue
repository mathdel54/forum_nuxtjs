<script setup>
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const forumId = route.params.id;

// Rediriger si l'utilisateur n'est pas connecté
onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login');
  }
});

const { data: forum } = await useFetch(`/api/forums/${forumId}`);

const title = ref('');
const content = ref('');
const error = ref('');
const loading = ref(false);

const createTopic = async () => {
  if (!title.value || !content.value) {
    error.value = 'Le titre et le contenu sont requis';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const { data, error: fetchError } = await useFetch('/api/topics', {
      method: 'POST',
      body: {
        forum_id: forumId,
        title: title.value,
        content: content.value
      }
    });
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message);
    }
    
    if (data.value?.error) {
      throw new Error(data.value.error);
    }
    
    router.push(`/topics/${data.value.id}`);
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container v-if="forum">
    <h1>Nouveau sujet dans {{ forum.name }}</h1>
    
    <v-card class="mt-4">
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <v-form @submit.prevent="createTopic">
          <v-text-field
            v-model="title"
            label="Titre du sujet"
            required
          ></v-text-field>
          
          <v-textarea
            v-model="content"
            label="Message"
            required
            rows="8"
          ></v-textarea>
          
          <div class="d-flex justify-end mt-4">
            <v-btn 
              color="secondary" 
              class="me-4" 
              :to="`/forums/${forumId}`"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
            >
              Créer le sujet
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>