class Chat < ApplicationRecord
  belongs_to :event
  has_many :messages, dependent: :destroy
  has_many :chat_users, dependent: :destroy
  has_many :users, through: :chat_users

  validate :max_three_per_event
  enum :chat_type, { customer: 0, internal: 1, other: 2}

  private

  def max_three_per_event
    if event.chats.count >= 3 && new_record?
      errors.add(:base, "1つのイベントに作成できるチャットは最大3つまでです")
    end
  end

end
