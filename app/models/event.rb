class Event < ApplicationRecord
  belongs_to :forwarder, -> { where(is_forwarder: true) }, class_name: "Company"
  has_many :containers, dependent: :destroy
  accepts_nested_attributes_for :containers, allow_destroy: true
  has_many :event_files, dependent: :destroy
  has_many :event_goods, dependent: :destroy
  accepts_nested_attributes_for :event_goods, allow_destroy: true
  has_one :event_schedule, dependent: :destroy
  accepts_nested_attributes_for :event_schedule, allow_destroy: true
  has_many :event_shipment_histories, dependent: :destroy
  has_many :event_steps, dependent: :destroy
  has_many :chats, dependent: :destroy
  has_many :event_companies, dependent: :destroy
  accepts_nested_attributes_for :event_companies, allow_destroy: true, reject_if: ->(attrs) { attrs['company_id'].blank? }
  has_one :finbalance, dependent: :destroy
  has_one :event_shipment, dependent: :destroy
  accepts_nested_attributes_for :event_shipment, allow_destroy: true
  has_one :event_doc, dependent: :destroy
  accepts_nested_attributes_for :event_doc, allow_destroy: true
  has_one :user

  attr_accessor :ac_month, :ac_year

  after_create :create_default_chats

  # Ransack設定
  def self.ransackable_attributes(auth_object = nil)
    %w[id_string mbl]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[event_shipment event_schedule event_companies forwarder]
  end

  scope :with_shipper_and_consignee, -> {
    sql = <<~SQL
      LEFT JOIN event_companies shipper_ec
        ON shipper_ec.event_id = events.id
        AND shipper_ec.role = #{EventCompany.roles[:shipper]}
      LEFT JOIN companies shippers
        ON shippers.id = shipper_ec.company_id

      LEFT JOIN event_companies consignee_ec
        ON consignee_ec.event_id = events.id
        AND consignee_ec.role = #{EventCompany.roles[:consignee]}
      LEFT JOIN companies consignees
        ON consignees.id = consignee_ec.company_id
    SQL

    left_outer_joins(:event_shipment, :event_schedule)
      .joins(sql)
  }

  # 検索用スコープ
  scope :by_shipper_name, ->(name) {
    return all if name.blank?
    
    joins(event_companies: :company)
      .where(event_companies: { role: EventCompany.roles[:shipper] })
      .where("companies.english_name LIKE ?", "%#{name}%")
  }

  scope :by_consignee_name, ->(name) {
    return all if name.blank?
    
    joins(event_companies: :company)
      .where(event_companies: { role: EventCompany.roles[:consignee] })
      .where("companies.english_name LIKE ?", "%#{name}%")
  }

  def generate_id
    current_year = Time.current.year.to_s[-2, 2]
    
    loop do
      timestamp_part = ((Time.current.to_i * 7919) % 99999).to_s.rjust(5, '0')
      candidate_id = "HPS#{current_year}#{timestamp_part}"
      
      break candidate_id unless Event.exists?(id_string: candidate_id, year: Time.current.year.to_s)
      
      # マイクロ秒を加えてユニーク性を高める
      sleep(0.001)
    end
  end

  def self.generate_accounting_month(year, month)
    return if month.blank?
    "#{year}/#{month}/01"
  end

  private

  def create_default_chats
    chats.create!(chat_type: :customer, name: "取引先連絡")
    chats.create!(chat_type: :internal, name: "社内連絡")
  end
end