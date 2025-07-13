namespace :reminders do
  desc "Send event reminders"
  task send_events: :environment do
    # 24時間後から25時間後の間に開始する案件を取得
    # (Rakeタスクが1時間ごとに実行されることを想定)
    time_range = (Time.current + 24.hours)..(Time.current + 25.hours)

    events_to_remind = Event.where(start_time: time_range, reminder_sent_at: nil)

    puts "#{Time.current}: Found #{events_to_remind.count} events to remind."

    events_to_remind.each do |event|
      EventReminderJob.perform_later(event.id)
      puts "  - Queued reminder for Event ##{event.id}: #{event.title}"
    end
  end
end
