class Favorite < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  belongs_to :forwarder, -> { where(is_forwarder: true).kept }, class_name: "Company"
  has_many :favorite_files, -> { kept }, dependent: :destroy
  has_many :favorite_goods, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :favorite_goods, allow_destroy: true
  has_many :favorite_companies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :favorite_companies, allow_destroy: true, reject_if: ->(attrs) { attrs['company_id'].blank? }
  has_many :favorite_finbalances, -> { kept }, dependent: :destroy
  has_one :favorite_shipment, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :favorite_shipment, allow_destroy: true
  has_one :favorite_doc, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :favorite_doc, allow_destroy: true

  def self.ransackable_attributes(auth_object = nil)
    %w[name]
  end

  def self.ransackable_associations(auth_object = nil)
    ["favorite_companies", "favorite_shipment"]
  end

  scope :with_favorite_finbalances, ->(forwarder_id) {
    sql = <<~SQL
      LEFT JOIN favorite_companies client_ec
        ON client_ec.favorite_id = favorites.id
        AND client_ec.role = #{FavoriteCompany.roles[:client]}
      LEFT JOIN companies clients
        ON clients.id = client_ec.company_id

      LEFT JOIN favorite_companies shipper_ec
        ON shipper_ec.favorite_id = favorites.id
        AND shipper_ec.role = #{FavoriteCompany.roles[:shipper]}
      LEFT JOIN companies shippers
        ON shippers.id = shipper_ec.company_id

      LEFT JOIN favorite_companies consignee_ec
        ON consignee_ec.favorite_id = favorites.id
        AND consignee_ec.role = #{FavoriteCompany.roles[:consignee]}
      LEFT JOIN companies consignees
        ON consignees.id = consignee_ec.company_id
    SQL

    joins(:favorite_finbalances)
      .left_outer_joins(:favorite_shipment) 
      .joins(sql)
      .where(forwarder_id: forwarder_id)
  }

  scope :with_shipper_and_consignee, -> {
    sql = <<~SQL
      LEFT JOIN favorite_companies shipper_fc
        ON shipper_fc.favorite_id = favorites.id
        AND shipper_fc.role = #{FavoriteCompany.roles[:shipper]}
      LEFT JOIN companies shippers
        ON shippers.id = shipper_fc.company_id

      LEFT JOIN favorite_companies consignee_fc
        ON consignee_fc.favorite_id = favorites.id
        AND consignee_fc.role = #{FavoriteCompany.roles[:consignee]}
      LEFT JOIN companies consignees
        ON consignees.id = consignee_fc.company_id
    SQL

    left_outer_joins(:favorite_shipment, :favorite_doc)
      .joins(sql)
  }

  # 検索用スコープ
  scope :by_shipper_name, ->(name) {
    return all if name.blank?
    
    joins(favorite_companies: :company)
      .where(favorite_companies: { role: FavoriteCompany.roles[:shipper] })
      .where("companies.english_name LIKE ?", "%#{name}%")
  }

  scope :by_consignee_name, ->(name) {
    return all if name.blank?
    
    joins(favorite_companies: :company)
      .where(favorite_companies: { role: FavoriteCompany.roles[:consignee] })
      .where("companies.english_name LIKE ?", "%#{name}%")
  }
end
