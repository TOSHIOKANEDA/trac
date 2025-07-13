class ChatUser < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  validates :user_id, uniqueness: { scope: :chat_id }
end
