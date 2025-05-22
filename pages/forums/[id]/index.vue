<script setup>
import {useAuthStore} from '~/stores/auth';
const authStore = useAuthStore();

const route = useRoute();
const forumId = route.params.id;

const currentPage = ref(1);
const topicsPerPage = 20;

const { data: forum } = await useFetch(`/api/forums/${forumId}`, {
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  },
});

const allTopics = computed(() => {
  return forum.value.topics || [];
});

const totalPages = computed(() => {
  return Math.ceil(allTopics.value.length / topicsPerPage);
});

const paginatedTopics = computed(() => {
  const start = (currentPage.value - 1) * topicsPerPage;
  const end = start + topicsPerPage;
  return allTopics.value.slice(start, end);
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

</script>

<template>
  <v-container v-if="forum">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1>{{ forum.name }}</h1>
      </div>
      <div>
        <v-btn v-if="authStore.isAuthenticated" color="primary" :to="`/forums/${forumId}/topics/new`">
          Nouveau sujet
        </v-btn>
      </div>
    </div>

    <v-card v-if="forum.topics && forum.topics.length > 0">
      <v-list>
        <template v-for="topic in paginatedTopics.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))" :key="topic.id">
          <v-divider v-if="topic.id !== forum.topics[0].id"></v-divider>
          <v-list-item :to="`/topics/${topic.id}`">
            <v-list-item-title class="text-h6">
              {{ topic.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Par {{ topic.author_username }} le {{ new Date(topic.created_at).toLocaleString() }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="topic.last_message_at">
              Dernier message par {{ topic.last_message_username }}
              le {{ new Date(topic.last_message_at).toLocaleString() }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-chip color="primary">
                {{ topic.message_count }} messages
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
    <div v-else class="text-center py-5">
      <p>Aucun sujet dans ce forum pour le moment.</p>
      <v-btn
          v-if="authStore.isAuthenticated"
        color="primary"
        :to="`/forums/${forumId}/topics/new`"
        class="mt-3"
      >
        Créer le premier sujet
      </v-btn>
    </div>
    <!-- Pagination Controls -->
    <v-pagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :length="totalPages"
      :total-visible="5"
      class="mt-4"
      @input="goToPage(currentPage)"
    ></v-pagination>
  </v-container>
</template>