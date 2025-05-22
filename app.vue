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
import {useAuthStore} from '~/stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  console.log('mounted');
  await authStore.fetchUser();
});
</script>