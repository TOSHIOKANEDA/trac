class ChatChannel < ApplicationCable::Channel
  def subscribed
    event_id = params['event_id']
    chat_id = params['chat_id']
    
    stream_from "chat_#{event_id}_#{chat_id}"
  end

  def unsubscribed
    # チャンネルから切断した時の処理
  end

  def receive(data)
    event_id = data['event_id']
    chat_id = data['chat_id']
    
    begin
      event = Event.find(event_id)
      chat = event.chats.find(chat_id)
      
      # チャット名の更新（Temporaryの場合のみ）
      if data['chat_name'] && chat.name == 'Temporary'
        chat.update(name: data['chat_name'])
      end
      
      message = chat.messages.build(
        content: data['message'],
        user: User.first
      )
      
      if message.save
        Rails.logger.info "Message saved successfully"
      else
        Rails.logger.error "Message save failed: #{message.errors.full_messages}"
      end
      
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Record not found: #{e.message}"
      Rails.logger.error "event_id: #{event_id}, chat_id: #{chat_id}"
    end
  end
  
  private
  
  def current_user
    # 仮実装：後でちゃんとした認証に変更
    User.first
  end
end