class Message < ApplicationRecord
  belongs_to :event
  belongs_to :user
  validates :content, presence: true

  # after_create_commitコールバックを修正します
  after_create_commit do
    # 案件(event)に紐づく全てのユーザーに対して、メッセージを追加するTurbo Streamを配信します。
    # 配信先は `event` レコード自身、ターゲットとなるHTML要素は `messages` です。
    broadcast_append_to self.event, target: :messages, partial: "messages/message", locals: { message: self }
  end
end
