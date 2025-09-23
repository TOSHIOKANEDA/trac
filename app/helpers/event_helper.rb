module EventHelper
  def event_edit_chat_hidden(chat)
    chat.other? && !chat.visible 
  end

  def event_list_edit_status_check_icon(event_doc_completed, status, event_step, event_schedule, event)
    case status
    when "booking"
      event.mbl.present? ? "complete" : "pending"
    when "docs"
      event_doc_completed == 1 ? "complete" : "pending"
    when "vanning", "quarantine", "custom"
      event_step.present? ? "complete" : "pending"
    when "etd"
      pol_atd = event_schedule.is_a?(Hash) ? event_schedule["pol_atd"] : event_schedule&.pol_atd
      pol_atd.present? && pol_atd < DateTime.current ? "complete" : "pending"
    when "eta"
      pod_ata = event_schedule.is_a?(Hash) ? event_schedule["pod_ata"] : event_schedule&.pod_ata
      pod_ata.present? && pod_ata < DateTime.current ? "complete" : "pending"
    when "delivery"
      delivery_date = event_schedule.is_a?(Hash) ? event_schedule["delivery_date"] : event_schedule&.delivery_date
      delivery_date.present? && delivery_date < DateTime.current ? "complete" : "pending"
    when "invoice"
      # TBD
    end
  end

  def event_list_edit_status_date(status, event_schedule)
    case status
    when "booking", "docs","vanning", "quarantine", "custom"
      nil
    when "etd"
      pol_atd = event_schedule.is_a?(Hash) ? event_schedule["pol_atd"] : event_schedule&.pol_atd
      pol_etd = event_schedule.is_a?(Hash) ? event_schedule["pol_etd"] : event_schedule&.pol_etd

      return date_only(pol_atd) if pol_atd.present? && pol_atd < DateTime.current
      date_only(pol_etd)

    when "eta"
      pod_ata = event_schedule.is_a?(Hash) ? event_schedule["pod_ata"] : event_schedule&.pod_ata
      pod_eta = event_schedule.is_a?(Hash) ? event_schedule["pod_eta"] : event_schedule&.pod_eta

      return date_only(pod_ata) if pod_ata.present? && pod_ata < DateTime.current
      date_only(pod_eta)

    when "delivery"
      delivery_date = event_schedule.is_a?(Hash) ? event_schedule["delivery_date"] : event_schedule&.delivery_date
      date_only(delivery_date)
    when "invoice"
      nil
      # TBD
    end
  end
end
