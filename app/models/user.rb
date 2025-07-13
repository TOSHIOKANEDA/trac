class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  belongs_to :company
  has_many :messages, dependent: :destroy
  has_many :chat_users, dependent: :destroy
  has_many :chats, through: :chat_users
  enum :role, { admin: 0, editor: 1, viewer: 2}

  # ransack用の検索可能属性を定義
  def self.ransackable_attributes(auth_object = nil)
    %w[name email role status last_login_date created_at]
  end

  # ransack用の検索可能な関連を定義
  def self.ransackable_associations(auth_object = nil)
    %w[company]
  end
end
