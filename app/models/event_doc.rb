class EventDoc < ApplicationRecord
  belongs_to :event
  include Discard::Model
  default_scope -> { kept }

  DOC_COLUMNS = %i[
    invoice msds packing_list coo l_c van_photo van_repo quarantine slip
    quotation s_i hbl_awb dg_declaration insurance booking_confirmation
    mbl freight_memo weight_cert export_permit import_permit dock_receipt
    house_arrival_notice master_arrival_notice pod
  ].freeze

  def true_count
    DOC_COLUMNS.count { |col| self[col] }
  end

  def self.get_required_docs_by_category(event_doc, category)
    doc_definitions = {
      shipper: [
        ["Commercial Invoice", "invoice"], 
        ["Packing List", "packing_list"], 
        ["MSDS", "msds"], 
        ["COO（原産地証明書）", "coo"],
        ["検疫書類", "quarantine"], 
        ["L/C（荷主バンの場合）", "l_c"],
        ["バン画像", "van_photo"], 
        ["バンレポ", "van_repo"],
        ["搬入票", "slip"]
      ],
      forwarder: [
        ["見積書", "quotation"], 
        ["S/I", "s_i"], 
        ["HBL / AWB", "hbl_awb"], 
        ["DG Declaration", "dg_declaration"],
        ["保険証券", "insurance"], 
        ["Booking Confirmation", "booking_confirmation"], 
        ["MBL", "mbl"], 
        ["フレートメモ", "freight_memo"],
        ["House Arrival Notice", "house_arrival_notice"],
        ["Master Arrival Notice", "master_arrival_notice"],
        ["POD", "pod"]
      ],
      custom: [
        ["検量証明書", "weight_cert"], 
        ["輸出許可書", "export_permit"], 
        ["輸入許可書", "import_permit"], 
        ["D/R（Dock Receipt）", "dock_receipt"]
      ]
    }
    
    # event_docでtrueになっているもののみフィルタリング
    doc_definitions[category]&.select do |display_name, field_name|
      event_doc&.send(field_name) == true
    end || []
  end
end
