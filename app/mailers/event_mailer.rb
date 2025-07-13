class EventMailer < ApplicationMailer
  default from: "notifications@example.com"

  def reminder(event)
    @event = event
    @user = event.user
    mail(to: @user.email, subject: "リマインダー: 案件「#{@event.title}」がまもなく開始します")
  end
end
