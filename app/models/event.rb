class Event < ApplicationRecord
  belongs_to :user
  has_many_attached :files
  has_many :messages, dependent: :destroy

  validates :title, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true

  # ↓↓↓ このenum定義を追加します ↓↓↓
  enum status: {
    active: "active",
    in_progress: "in_progress",
    completed: "completed",
    canceled: "canceled"
  }

  # ransackが検索対象として許可するカラムを指定
  def self.ransackable_attributes(auth_object = nil)
    [ "title", "start_time", "end_time", "status" ]
  end
end
