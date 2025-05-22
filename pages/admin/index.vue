<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const forums = ref([]);
const newForumName = ref('');
const selectedForum = ref(null);
const newAdminUsername = ref('');
const newAdminPassword = ref('');
const error = ref('');
const loading = ref(false);

// Vérifier si l'utilisateur est admin
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/');
  } else {
    fetchForums();
  }
});

const fetchForums = async () => {
  const { data } = await useFetch('/api/forums', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  });
  forums.value = data.value || [];
};

const createForum = async () => {
  if (!newForumName.value) {
    error.value = 'Le nom du forum est requis';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await useFetch('/api/forums', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { name: newForumName.value },
    });
    newForumName.value = '';
    await fetchForums();
  } catch (e) {
    error.value = 'Erreur lors de la création du forum';
  } finally {
    loading.value = false;
  }
};

const renameForum = async (forumId, newName) => {
  if (!newName) {
    error.value = 'Le nouveau nom est requis';
    return;
  }

  try {
    await useFetch(`/api/forums/${forumId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { name: newName },
    });
    await fetchForums();
  } catch (e) {
    error.value = 'Erreur lors du renommage du forum';
  }
};

const deleteForum = async (forumId) => {
  try {
    await useFetch(`/api/forums/${forumId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await fetchForums();
  } catch (e) {
    error.value = 'Erreur lors de la suppression du forum';
  }
};

const createAdmin = async () => {
  if (!newAdminUsername.value || !newAdminPassword.value) {
    error.value = 'Nom d\'utilisateur et mot de passe requis';
    return;
  }

  try {
    await useFetch('/api/admins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        username: newAdminUsername.value,
        password: newAdminPassword.value,
      },
    });
    newAdminUsername.value = '';
    newAdminPassword.value = '';
  } catch (e) {
    error.value = 'Erreur lors de la création de l\'administrateur';
  }
};
</script>

<template>
  <v-container>
    <h1>Espace Administrateur</h1>

    <v-card class="mt-4">
      <v-card-title>Créer un nouveau forum</v-card-title>
      <v-card-text>
        <v-text-field v-model="newForumName" label="Nom du forum" required></v-text-field>
        <v-btn color="primary" @click="createForum" :loading="loading">Créer</v-btn>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title>Gérer les forums</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="forum in forums" :key="forum.id">
            <v-list-item-content>
              <v-text-field
                v-model="forum.name"
                label="Nom du forum"
                @change="renameForum(forum.id, forum.name)"
              ></v-text-field>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn color="error" @click="deleteForum(forum.id)">Supprimer</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title>Créer un compte administrateur</v-card-title>
      <v-card-text>
        <v-text-field v-model="newAdminUsername" label="Nom d'utilisateur" required></v-text-field>
        <v-text-field v-model="newAdminPassword" label="Mot de passe" type="password" required></v-text-field>
        <v-btn color="primary" @click="createAdmin">Créer</v-btn>
      </v-card-text>
    </v-card>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>