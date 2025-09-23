class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :user
  
  validates :content, presence: true, length: { maximum: 1000 }
  include Discard::Model
  default_scope -> { kept }

  # メッセージ作成後にリアルタイム配信
  after_create_commit :broadcast_message
  
  private
  
  def broadcast_message
    ActionCable.server.broadcast("chat_#{chat.event.id}_#{chat.id}", {
      message: content,
      username: user.name,
      event_id: chat.event.id,
      chat_id: chat.id
    })
  end
end