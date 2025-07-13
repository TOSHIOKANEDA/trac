class AddReminderSentAtToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :reminder_sent_at, :datetime
  end
end
