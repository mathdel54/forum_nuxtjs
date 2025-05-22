const peers = new Set();

export function broadcastToAll(message: object) {
  const messageString = JSON.stringify(message);
  for (const peer of peers) {
    peer.send(messageString);
  }
}

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer);
    console.log("[ws] open", peer);
  },
  message(peer, message) {
    console.log("[ws] message", peer, message);

    try {
      const data = message.json();
      if (data.type === "ping") {
        peer.send(JSON.stringify({type: "pong"}));
      }
    } catch (error) {
      console.error("[ws] Error parsing message:", error);
    }
  },
  close(peer, event) {
    peers.delete(peer);
    console.log("[ws] close", peer, event);
  },
  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});