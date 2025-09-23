# app/controllers/concerns/event_display_data.rb
module EventDisplayData
  extend ActiveSupport::Concern

  private

  def prepare_event_display_data(event)
    @chats = event.chats
    @other_chat = @chats.where(chat_type: "other").first
    @chat_participatnts = chat_participants
    @chat_users = chat_users(event)
    @event_doc_completed = event.event_doc&.completed
    @event_steps = event.event_steps.group_by(&:status)
    @event_schedule = event.event_schedule&.slice(:pol_etd, :pol_atd, :pod_eta, :pod_ata, :delivery_date)
  end

  def chat_participants
    @other_chat.users.joins(:company)
      .select("users.id as id", "users.name as name", "companies.japanese_name as company_name")
  end

  def chat_users(event)
    EventCompany.where(event_id: event.id).joins(company: :users)
      .select(
        "users.id as user_id",
        "users.name as name",
        "companies.japanese_name as company_name",
        "CONCAT(users.name, '(', companies.japanese_name, ')') AS user_and_company"
      )
  end
end
