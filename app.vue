<template>
  <div>
    <v-app>
      <NuxtLayout>
        <NuxtPage/>
      </NuxtLayout>
    </v-app>
  </div>
</template>

<script setup>
import { fetchUser } from '~/services/auth';

onMounted(async () => {
  console.log('mounted');
  await fetchUser();
});
</script>