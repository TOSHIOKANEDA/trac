class Chat < ApplicationRecord
  belongs_to :event
  has_many :messages, -> { kept }, dependent: :destroy
  has_many :chat_users, -> { kept }, dependent: :destroy
  has_many :users, -> { kept }, through: :chat_users

  accepts_nested_attributes_for :chat_users, allow_destroy: true
  validate :max_three_per_event
  enum :chat_type, { customer: 0, internal: 1, other: 2}
  include Discard::Model
  private

  def max_three_per_event
    if event.chats.count >= 3 && new_record?
      errors.add(:base, "1つのイベントに作成できるチャットは最大3つまでです")
    end
  end

end
