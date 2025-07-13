// app/javascript/channels/chat_channel.js
import consumer from "./consumer"

const subscribeToChat = (chatId, callback) => {
  return consumer.subscriptions.create(
    { channel: "ChatChannel", chat_id: chatId },
    {
      connected() {},
      disconnected() {},
      received(data) {
        callback(data)
      }
    }
  )
}

// **ここで named export**
export { subscribeToChat }
