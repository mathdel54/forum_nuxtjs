<script setup>
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useRouter } from 'vue-router';

const auth = useAuth();
const router = useRouter();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const changePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Tous les champs sont requis';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les nouveaux mots de passe ne correspondent pas';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const { data, error: fetchError } = await useFetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    });

    if (fetchError.value) {
      throw new Error(fetchError.value.message);
    }

    if (data.value?.error) {
      throw new Error(data.value.error);
    }

    success.value = 'Mot de passe changé avec succès';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (e) {
    error.value = e.message || 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container>
    <h1>Changer de mot de passe</h1>

    <v-card class="mt-4">
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-alert v-if="success" type="success" class="mb-4">
          {{ success }}
        </v-alert>

        <v-form @submit.prevent="changePassword">
          <v-text-field
            v-model="currentPassword"
            label="Mot de passe actuel"
            type="password"
            required
          ></v-text-field>

          <v-text-field
            v-model="newPassword"
            label="Nouveau mot de passe"
            type="password"
            required
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            type="password"
            required
          ></v-text-field>

          <div class="d-flex justify-end mt-4">
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
            >
              Changer le mot de passe
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>