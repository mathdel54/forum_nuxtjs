import { WebSocketServer } from 'ws'

// Maintenir une liste des connexions actives
const connections = new Set<WebSocket>()

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] Connection opened")
    connections.add(peer as unknown as WebSocket)
  },
  
  message(peer, message) {
    const data = JSON.parse(message.text())
    console.log("[ws] Message received:", data)
    
    if (data.type) {
      broadcastToAll(data)
    }
  },
  
  close(peer) {
    console.log("[ws] Connection closed")
    connections.delete(peer as unknown as WebSocket)
  },
  
  error(peer, error) {
    console.log("[ws] Error:", error)
    connections.delete(peer as unknown as WebSocket)
  }
})

// Fonction pour envoyer un message à tous les clients connectés
export function broadcastToAll(data: any) {
  const message = JSON.stringify(data)
  connections.forEach((client: WebSocket) => {
    client.send(message)
  })
}