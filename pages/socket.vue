<script setup>
let ws
const messages = ref([])
// Fonction de connexion au serveur WebSocket
const connect = async () => {
    // En HTTP, le protocole ws:// est utilisé. En HTTPS, il est nécessaire
    // d'utiliser le protocole wss://.
    const isSecure = location.protocol === "https:";
    const url = (isSecure ? "wss://" : "ws://") + location.host +
        "/_ws";
    if (ws) {
        // Déjà connecté, on ferme la connexion existante
        ws.close();
    }
    // Connexion au serveur
    console.log("Connexion à", url, "...");
    ws = new WebSocket(url);
    // Ajout d'un listener pour être notifié lorsque le serveur
    // nous envoie un message
    ws.addEventListener("message", (event) => {
        const message = event.data
        console.log(message);
        messages.value.push(message)
    });
    // On attend d'être connecté. L'objet WebSocket natif n'utilise
    // pas les promesses, donc on triche un peu pour pouvoir utiliser
    // await sur l'étape de connexion.
    await new Promise((resolve) => ws.addEventListener("open",
        resolve));
    console.log("ws connecté!");
};
const ping = () => {
    console.log("ws envoi ping");
    ws.send("ping");
};
</script>
<template>
    <div>Messages: {{ messages }}</div>
    <button @click="connect">Connecter</button>
    <button @click="ping">Ping</button>
</template>