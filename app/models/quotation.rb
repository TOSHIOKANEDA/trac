class Quotation < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  belongs_to :forwarder, class_name: "Company"
  belongs_to :client, class_name: "Company"
  belongs_to :user
  has_many :quotation_companies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :quotation_companies, allow_destroy: true, reject_if: ->(attrs) { attrs['company_id'].blank? }
  has_many :companies, -> { kept }, through: :quotation_companies
  has_many :quotation_items, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :quotation_items, allow_destroy: true

  enum :shipment, {export: 0, import: 1, third_country: 2 }
  enum :mode, { lcl: 0, fcl: 1, air: 2 }
  enum :term, { exb: 0, fob: 1, fca: 2, cfr: 3, cif: 4, dap: 5, ddp: 6 }

  validates :client_id, :forwarder_id, :user_id, presence: true

  def self.ransackable_attributes(auth_object = nil)
    [ "term", "issued_date", "cargo", "port_of_discharge", "port_of_loading", "shipment", "mode"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["client"]  
  end

  # i18n メソッド
  def mode_i18n
    I18n.t("activerecord.attributes.quotation.mode.#{mode}") if mode.present?
  end

  def term_i18n
    I18n.t("activerecord.attributes.quotation.term.#{term}") if term.present?
  end

  def shipment_i18n
    I18n.t("activerecord.attributes.quotation.shipment.#{shipment}") if shipment.present?
  end

  def copy_with_associations
    transaction do
      # Quotationをコピー
      new_quotation = self.dup
      new_quotation.valid_at = nil  # 有効期限をリセット
      new_quotation.issued_in_english = false
      new_quotation.issued_by_foreign_currency = false
      new_quotation.save!
      
      # quotation_itemsをコピー
      quotation_items.each do |item|
        new_item = item.dup
        new_item.quotation_id = new_quotation.id
        new_item.save!
      end
      
      # quotation_companiesをコピー
      quotation_companies.each do |company|
        new_company = company.dup
        new_company.quotation_id = new_quotation.id
        new_company.save!
      end
      
      new_quotation
    end
  end
end
