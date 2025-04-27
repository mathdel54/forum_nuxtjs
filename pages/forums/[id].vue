<script setup>
const auth = useAuth();
const route = useRoute();
const forumId = route.params.id;

const { data: forum } = await useFetch(`/api/forums/${forumId}`);
</script>

<template>
  <v-container v-if="forum">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1>{{ forum.name }}</h1>
      </div>
      <div>
        <v-btn v-if="auth.isAuthenticated" color="primary" :to="`/forums/${forumId}/topics/new`">
          Nouveau sujet
        </v-btn>
      </div>
    </div>
    
    <v-card v-if="forum.topics && forum.topics.length > 0">
      <v-list>
        <template v-for="topic in forum.topics" :key="topic.id">
          <v-divider v-if="!topic.id === forum.topics[0].id"></v-divider>
          <v-list-item :to="`/topics/${topic.id}`">
            <v-list-item-title class="text-h6">
              {{ topic.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Par {{ topic.author_username }} le {{ new Date(topic.created_at).toLocaleString() }}
              <div v-if="topic.last_message_username">
                Dernier message par {{ topic.last_message_username }} 
                le {{ new Date(topic.last_message_at).toLocaleString() }}
              </div>
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
        v-if="auth.isAuthenticated" 
        color="primary" 
        :to="`/forums/${forumId}/topics/new`"
        class="mt-3"
      >
        Créer le premier sujet
      </v-btn>
    </div>
  </v-container>
</template>