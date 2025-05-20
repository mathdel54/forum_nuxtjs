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
import { useAuth } from '~/composables/useAuth';

const auth = useAuth();

onMounted(async () => {
  console.log('mounted');
  await auth.fetchUser();
});
</script>