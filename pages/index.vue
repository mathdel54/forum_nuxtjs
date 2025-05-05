<script setup>
import {ref} from 'vue'

const auth = useAuth()
const forums = ref([])


try {
  const {data} = await useFetch('/api/forums')
  forums.value = data.value
} catch (error) {
  console.error('Error fetching forums:', error)
}
</script>

<template>
  <v-container>
    <v-row align="center" justify="space-between">
      <v-col>
        <h1>Forums</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn v-if="auth?.user?.is_admin" color="primary" to="/forums/new">
          Nouveau Forum
        </v-btn>
      </v-col>
    </v-row>

    <v-list>
      <v-list-item
          v-for="forum in forums"
          :key="forum.id"
          :to="`/forums/${forum.id}`"
          class="mb-2"
      >
        <v-list-item-title>{{ forum.name }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ forum.topic_count }} sujets
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-container>
</template>