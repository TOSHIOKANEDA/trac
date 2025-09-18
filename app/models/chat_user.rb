# app/models/chat_user.rb
class ChatUser < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  validates :user_id, uniqueness: { scope: :chat_id }
  include Discard::Model
  def self.sanitize_attributes_for_chat(chat, chat_users_attributes)
    return {} unless chat_users_attributes
    
    existing_chat_user_ids = chat.chat_users.pluck(:id)
    sanitized_attributes = {}
    
    chat_users_attributes.each do |key, attrs|
      next unless should_include_attributes?(attrs, existing_chat_user_ids)
      sanitized_attributes[key] = attrs
    end
    
    sanitized_attributes
  end

  private

  def self.should_include_attributes?(attrs, existing_chat_user_ids)
    return valid_existing_record?(attrs, existing_chat_user_ids) if attrs[:id].present?
    valid_new_record?(attrs)
  end

  def self.valid_existing_record?(attrs, existing_chat_user_ids)
    existing_chat_user_ids.include?(attrs[:id].to_i)
  end

  def self.valid_new_record?(attrs)
    attrs[:user_id].present?
  end
end
