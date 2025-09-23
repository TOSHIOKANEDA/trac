module ApplicationHelper
  def stimulus_controller
    # 例: controller_name = "events", action_name = "new" → "event-new"
    # ただし、editとnewは共通化しているので処理を加えた
    the_action_name = action_name == 'edit' ? 'new' : action_name
    "#{controller_name.chomp('s')}-#{the_action_name}"
  end

  def get_method_badge_class(mode)
    return '' if mode.blank?
    method_classes = {fcl: 'method-fcl', lcl: 'method-lcl', air: 'method-air'}
    key = EventShipment.modes.keys[mode].downcase.to_sym
    method_classes[key] || ''
  end

  def get_shipment_badge_class(shipment)
    return '' if shipment.blank?
    shipment_classes = {export: 'type-export', import: 'type-import'}
    key = EventShipment.shipments.keys[shipment].to_sym
    shipment_classes[key] || ''
  end

  def list_item_with_na(item)
    return "N/A" if item.blank?
    item
  end

  def profit_margin(income, cost)
    return '0%' if income.blank? || cost.blank? || income.to_f.zero?

    margin = ((income.to_f - cost.to_f) / income.to_f * 100).round(1)
    "#{margin}%"
  end


  def active_sidebar_class(names)
    targets = Array(names).map(&:to_s)
    page = "#{controller_name}/#{action_name}"

    "active" if targets.include?(page)
  end

  def site_title
    "トラフィックカレンダー"
  end

  def page_title(title = nil)
    if title.present?
      "#{title} | #{site_title}"
    else
      site_title
    end
  end

  def date_with_time(date_time)
    return "N/A" if date_time.blank?
    
    begin
      time = date_time.is_a?(String) ? Time.zone.parse(date_time) : date_time
      return "N/A" if time.nil?
      time.strftime("%Y年%-m月%-d日 %H:%M")
    rescue ArgumentError, TypeError
      "N/A"
    end
  end

  def date_only(date_time)
    return "N/A" if date_time.blank?
    
    begin
      time = date_time.is_a?(String) ? Time.zone.parse(date_time) : date_time
      return "N/A" if time.nil?
      time.strftime("%Y年%-m月%-d日")
    rescue ArgumentError, TypeError
      "N/A"
    end
  end

  def year_month_only(date_time)
    return "N/A" if date_time.blank?
    
    begin
      time = date_time.is_a?(String) ? Time.zone.parse(date_time) : date_time
      return "N/A" if time.nil?
      time.strftime("%Y年%-m月")
    rescue ArgumentError, TypeError
      "N/A"
    end
  end

  def shipper_docs_select
    [
      ["Commercial Invoice", "invoice"], 
      ["Packing List", "packing_list"], 
      ["MSDS", "msds"], 
      ["COO（原産地証明書）", "coo"],
      ["検疫書類", "quarantine"], 
      ["L/C（荷主バンの場合）", "l_c"],
      ["バン画像", "van_photo"], 
      ["バンレポ", "van_repo"],
      ["搬入票", "slip"]
    ]
  end

  def forwarder_docs_select
    [
      ["見積書", "quotation"], 
      ["S/I", "s_i"], 
      ["HBL / AWB", "hbl_awb"], 
      ["DG Declaration", "dg_declaration"],
      ["保険証券", "insurance"], 
      ["Booking Confirmation", "booking_confirmation"], 
      ["MBL", "mbl"], 
      ["フレートメモ", "freight_memo"],
      ["House Arrival Notice","house_arrival_notice" ],
      ["Master Arrival Notice","master_arrival_notice"],
      ["POD","pod"]
    ] 
  end

  def custom_docs_select
    [
      ["検量証明書", "weight_cert"], 
      ["輸出許可書", "export_permit"], 
      ["D/R（Dock Receipt）", "dock_receipt"]
    ]
  end

  def new_company_fields(role)
    if ["si_notifier", "master_notifier"].include? role
      "notifier"
    else
      role
    end
  end

  def shipment_css_class(item, call_from)
    return "" if item&.shipment.blank?
    if call_from == "events"
      "type-#{EventShipment.shipments.keys[item.shipment]}"
    elsif call_from == "favorites"
      "type-#{FavoriteShipment.shipments.keys[item.shipment]}"
    end
  end
end
