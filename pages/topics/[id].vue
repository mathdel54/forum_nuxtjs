<script setup>
import {useAuthStore} from '~/stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const topicId = route.params.id;

const { data: topic, refresh } = await useFetch(`/api/topics/${topicId}`);

console.log('refresh', refresh);

const editingMessageId = ref(null);
const editedMessageContent = ref('');
const sendingMessage = ref(false);
const error = ref('');

const deleteMessage = async (messageId) => {
  try {
    await useFetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    await refresh();
  } catch (e) {
    console.error('Error deleting message:', e);
  }
};

const deleteTopic = async () => {
  try {
    await useFetch(`/api/topics/${topicId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    navigateTo('/');
  } catch (e) {
    console.error('Error deleting topic:', e);
  }
};

const startEditing = (message) => {
  editingMessageId.value = message.id;
  editedMessageContent.value = message.content;
};

const saveEditedMessage = async () => {
  try {
    await useFetch(`/api/messages/${editingMessageId.value}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: { content: editedMessageContent.value },
    });
    editingMessageId.value = null;
    editedMessageContent.value = '';
    await refresh();
  } catch (e) {
    console.error('Error editing message:', e);
  }
};

const newMessage = ref('');

const currentPage = ref(1);
const messagesPerPage = 20;

// Computed property for paginated messages
const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * messagesPerPage;
  const end = start + messagesPerPage;
  return topic.value?.messages.slice(start, end) || [];
});

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil((topic.value?.messages.length || 0) / messagesPerPage);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

let ws;

// WebSocket connection
const connectWebSocket = () => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";

  ws = new WebSocket(url);

  ws.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "new_message" && data.topic_id === topicId) {
        refresh();
      } else if (data.type === "topic_deleted" && data.topic_id === topicId) {
        navigateTo('/');
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  });
};

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

const sendMessage = async () => {
  if (!newMessage.value) {
    error.value = 'Le message ne peut pas être vide';
    return;
  }

  sendingMessage.value = true;
  error.value = '';

  try {
    const { data, error: fetchError } = await useFetch('/api/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        topic_id: topicId,
        content: newMessage.value
      }
    });

    if (fetchError.value) {
      throw new Error(fetchError.value.message);
    }

    if (data.value?.error) {
      throw new Error(data.value.error);
    }

    newMessage.value = '';
    await refresh();
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue';
  } finally {
    sendingMessage.value = false;
  }
};
</script>

<template>
  <v-container v-if="topic">
    <div class="d-flex align-center">
      <v-btn icon :to="`/forums/${topic.forum_id}`" class="mr-4">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h1>{{ topic.title }}</h1>
        <div class="text-subtitle-1">
          Dans <NuxtLink :to="`/forums/${topic.forum_id}`">{{ topic.forum_name }}</NuxtLink>
        </div>
      </div>
      <v-btn v-if="authStore.isAdmin" color="error" class="ml-auto" @click="deleteTopic">
        Supprimer le sujet
      </v-btn>
    </div>

    <v-card-text>
      <div v-for="message in paginatedMessages" :key="message.id" class="mb-5">
        <div class="d-flex justify-space-between align-center">
          <div class="font-weight-bold">
            {{ message.author_username }}
          </div>
          <div class="text-caption">
            {{ new Date(message.created_at).toLocaleString() }}
          </div>
        </div>
        <div class="mt-2">
          <div v-if="editingMessageId === message.id">
            <v-textarea
                v-model="editedMessageContent"
                label="Modifier le message"
                rows="4"
            ></v-textarea>
            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" @click="saveEditedMessage">Enregistrer</v-btn>
              <v-btn class="ml-2" @click="editingMessageId = null">Annuler</v-btn>
            </div>
          </div>
          <div v-else>
            {{ message.content }}
          </div>
        </div>
        <div class="d-flex justify-end mt-2">
          <v-btn
              v-if="authStore.isAdmin || (authStore.currentUser && message.author_username === authStore.currentUser.username)"              small
              color="primary"
              @click="startEditing(message)"
          >
            Modifier
          </v-btn>
          <v-btn
              v-if="authStore.isAdmin"
              small
              color="error"
              class="ml-2"
              @click="deleteMessage(message.id)"
          >
            Supprimer
          </v-btn>
        </div>
        <v-divider class="my-3"></v-divider>
      </div>
    </v-card-text>
    <!-- Pagination Controls -->
    <v-pagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :length="totalPages"
      :total-visible="5"
      class="mt-4"
      @input="goToPage(currentPage)"
    ></v-pagination>
    <v-card v-if="authStore.isAuthenticated" class="mt-4">
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="sendMessage">
          <v-textarea v-model="newMessage" label="Votre message" rows="4" required></v-textarea>

          <div class="d-flex justify-end mt-4">
            <v-btn color="primary" type="submit" :loading="sendingMessage">
              Envoyer
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <div v-else class="text-center mt-4">
      <p>Vous devez être connecté pour répondre</p>
      <v-btn color="primary" to="/login">Se connecter</v-btn>
    </div>
  </v-container>
</template>