import { WebSocketServer } from 'ws'

const connections = new Set<WebSocket>()

const topicSubscriptions = new Map<string, Set<WebSocket>>()

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] Connection opened")
    connections.add(peer as unknown as WebSocket)
  },
  
  message(peer, message) {
    const data = JSON.parse(message.text())
    console.log("[ws] Message received:", data)
    
    const client = peer as unknown as WebSocket
    
    if (data.action === 'subscribe' && data.topic_id) {
      const topicId = data.topic_id.toString()
      
      if (!topicSubscriptions.has(topicId)) {
        topicSubscriptions.set(topicId, new Set())
      }
      
      topicSubscriptions.get(topicId)?.add(client)
      console.log(`[ws] Client subscribed to topic ${topicId}`)
    }
    
    if (data.action === 'unsubscribe' && data.topic_id) {
      const topicId = data.topic_id.toString()
      topicSubscriptions.get(topicId)?.delete(client)
      console.log(`[ws] Client unsubscribed from topic ${topicId}`)
    }
    
    if (data.type === 'new_message' && data.topic_id) {
      broadcastToTopic(data.topic_id.toString(), data)
    }
  },
  
  close(peer) {
    console.log("[ws] Connection closed")
    const client = peer as unknown as WebSocket
    connections.delete(client)
    
    for (const subscribers of topicSubscriptions.values()) {
      subscribers.delete(client)
    }
  },
  
  error(peer, error) {
    console.log("[ws] Error:", error)
    connections.delete(peer as unknown as WebSocket)
  }
})

export function broadcastToAll(data: any) {
  const message = JSON.stringify(data)
  connections.forEach((client: WebSocket) => {
    client.send(message)
  })
}

export function broadcastToTopic(topicId: string, data: any) {
  const message = JSON.stringify(data)
  const subscribers = topicSubscriptions.get(topicId)
  
  if (subscribers) {
    subscribers.forEach((client: WebSocket) => {
      client.send(message)
    })
  }
  
  broadcastToAll({
    type: 'notification',
    topic_id: topicId,
    message: data
  })
}