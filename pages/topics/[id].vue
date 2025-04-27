<script setup>
const auth = useAuth();
const route = useRoute();
const topicId = route.params.id;

const { data: topic, refresh } = await useFetch(`/api/topics/${topicId}`);

const newMessage = ref('');
const sendingMessage = ref(false);
const error = ref('');

let ws;

// Fonction pour se connecter au WebSocket
const connectWebSocket = () => {
    const isSecure = location.protocol === "https:";
    const url = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";

    ws = new WebSocket(url);

    ws.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.topic_id === parseInt(topicId)) {
                refresh();
            }
        } catch (e) {
            console.error("Error parsing WebSocket message:", e);
        }
    });
};

// Se connecter au WebSocket à l'initialisation
onMounted(() => {
    connectWebSocket();
});

// Se déconnecter du WebSocket à la destruction
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
        </div>

        <v-card class="mt-4">
            <v-card-text>
                <div v-for="message in topic.messages" :key="message.id" class="mb-5">
                    <div class="d-flex justify-space-between align-center">
                        <div class="font-weight-bold">
                            {{ message.author_username }}
                        </div>
                        <div class="text-caption">
                            {{ new Date(message.created_at).toLocaleString() }}
                        </div>
                    </div>
                    <div class="mt-2">
                        {{ message.content }}
                    </div>
                    <v-divider class="my-3"></v-divider>
                </div>
            </v-card-text>
        </v-card>

        <v-card v-if="auth.isAuthenticated" class="mt-4">
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