module EventHelper
  def event_new_company_fields(role)
    if ["si_notifier", "master_notifier"].include? role
      "notifier"
    else
      role
    end
  end

  def event_list_shipment(event)
    return "" if event&.shipment.blank?
    "type-#{EventShipment.shipments.keys[event.shipment]}"
  end

  def event_list_item(item)
    return "N/A" if item.blank?
    item
  end

  def event_edit_chat_hidden(chat)
    chat.other? && !chat.visible 
  end

  def event_new_shipper_docs 
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

  def event_new_forwarder_docs
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

  def event_new_custom_docs
    [
      ["検量証明書", "weight_cert"], 
      ["輸出許可書", "export_permit"], 
      ["D/R（Dock Receipt）", "dock_receipt"]
    ]
  end
end
