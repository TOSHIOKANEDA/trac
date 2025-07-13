class EventReminderJob < ApplicationJob
  queue_as :default

  def perform(event_id)
    event = Event.find_by(id: event_id)
    return unless event

    # メールを送信し、送信日時を記録
    EventMailer.reminder(event).deliver_now
    event.update(reminder_sent_at: Time.current)
  end
end
