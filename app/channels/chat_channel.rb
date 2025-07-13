class ChatChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "chat_#{params[:chat_id]}"
    chat = Chat.find(params[:chat_id])
    stream_for chat
  end

  def unsubscribed
    # ここは不要
  end
end
