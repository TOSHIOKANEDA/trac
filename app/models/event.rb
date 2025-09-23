class Event < ApplicationRecord
  include Discard::Model

  belongs_to :forwarder, -> { where(is_forwarder: true).kept }, class_name: "Company"
  has_many :containers, -> { kept }, dependent: :destroy, counter_cache: :containers_count
  accepts_nested_attributes_for :containers, allow_destroy: true
  has_many :event_files, -> { kept }, dependent: :destroy
  has_many :event_goods, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_goods, allow_destroy: true
  has_one :event_schedule, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_schedule, allow_destroy: true
  has_many :event_shipment_histories, -> { kept }, dependent: :destroy
  has_many :event_steps, -> { kept }, dependent: :destroy
  has_many :chats, -> { kept }, dependent: :destroy
  has_many :event_companies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_companies, allow_destroy: true, reject_if: ->(attrs) { attrs['company_id'].blank? }
  has_many :event_finbalances, -> { kept }, dependent: :destroy
  has_one :event_shipment, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_shipment, allow_destroy: true
  has_one :event_doc, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_doc, allow_destroy: true
  has_one :user, -> { kept }

  attr_accessor :ac_month, :ac_year

  after_create :create_default_chats
  default_scope -> { kept }

  def self.ransackable_attributes(auth_object = nil)
    %w[id_string mbl accounting_month]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[event_shipment event_schedule event_companies forwarder]
  end

  scope :aggregate_finbalances_for_ids, ->(event_ids) {
    return {} if event_ids.blank?
    
    joins(:event_finbalances)
      .where(id: event_ids)
      .group("events.id")
      .select(
        "events.id",
        "SUM(event_finbalances.income) AS aggregated_income",
        "SUM(event_finbalances.expense) AS aggregated_expense",
        "SUM(event_finbalances.balance) AS aggregated_balance"
      )
      .index_by(&:id)
  }

  scope :with_event_finbalances, ->(forwarder_id) {
    sql = <<~SQL
      LEFT JOIN event_companies client_ec
        ON client_ec.event_id = events.id
        AND client_ec.role = #{EventCompany.roles[:client]}
      LEFT JOIN companies clients
        ON clients.id = client_ec.company_id

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

    joins(:event_finbalances)
      .left_outer_joins(:event_shipment, :event_schedule) 
      .joins(sql)
      .where(forwarder_id: forwarder_id)
  }

  scope :with_shipper_and_consignee, -> {
    sql = <<~SQL
      LEFT JOIN event_companies client_ec
        ON client_ec.event_id = events.id
        AND client_ec.role = #{EventCompany.roles[:client]}
        AND client_ec.discarded_at IS NULL
      LEFT JOIN companies clients
        ON clients.id = client_ec.company_id

      LEFT JOIN event_companies shipper_ec
        ON shipper_ec.event_id = events.id
        AND shipper_ec.role = #{EventCompany.roles[:shipper]}
        AND shipper_ec.discarded_at IS NULL
      LEFT JOIN companies shippers
        ON shippers.id = shipper_ec.company_id

      LEFT JOIN event_companies consignee_ec
        ON consignee_ec.event_id = events.id
        AND consignee_ec.role = #{EventCompany.roles[:consignee]}
        AND consignee_ec.discarded_at IS NULL
      LEFT JOIN companies consignees
        ON consignees.id = consignee_ec.company_id
    SQL

    left_outer_joins(:event_shipment, :event_schedule, :event_doc)
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

  scope :by_client_name, ->(name) {
    return all if name.blank?
    
    joins(event_companies: :company)
      .where(event_companies: { role: EventCompany.roles[:client] })
      .where("companies.english_name LIKE ?", "%#{name}%")
  }

  scope :for_calendar, ->(forwarder_id) {
    joins(:event_shipment, :event_schedule)
      .joins("LEFT JOIN event_companies shipper_ec ON shipper_ec.event_id = events.id AND shipper_ec.role = #{EventCompany.roles[:shipper]} AND shipper_ec.discarded_at IS NULL")
      .joins("LEFT JOIN companies shippers ON shippers.id = shipper_ec.company_id")
      .joins("LEFT JOIN event_companies consignee_ec ON consignee_ec.event_id = events.id AND consignee_ec.role = #{EventCompany.roles[:consignee]} AND consignee_ec.discarded_at IS NULL")
      .joins("LEFT JOIN companies consignees ON consignees.id = consignee_ec.company_id")
      .joins("LEFT JOIN users ON users.id = events.user_id")
      .where(forwarder_id: forwarder_id)
      .where("event_schedules.pol_etd IS NOT NULL AND event_schedules.pod_eta IS NOT NULL")
      .select(
        "events.id",
        "events.id_string",
        "events.mbl",
        "events.hbl",
        "event_shipments.port_of_loading",
        "event_shipments.port_of_discharge",
        "event_shipments.pol_code",
        "event_shipments.pod_code",
        "event_shipments.mode",
        "event_schedules.pol_etd",
        "event_schedules.pod_eta",
        "shippers.english_name AS shipper_name",
        "consignees.english_name AS consignee_name",
        "users.name AS assignee"
      )
      .distinct
  }

    # インスタンスメソッド：Event をカレンダー用 JSON に変換
  def as_calendar_json
    {
      id: id_string,
      event_id: id,
      assignee: assignee || 'N/A',
      etd: event_schedule&.pol_etd&.iso8601,
      eta: event_schedule&.pod_eta&.iso8601,
      shipper: read_attribute(:shipper_name) || 'N/A',
      cnee: read_attribute(:consignee_name) || 'N/A',
      origin: event_shipment&.port_of_loading || 'N/A',
      destination: event_shipment&.port_of_discharge || 'N/A',
      origin_code: event_shipment&.pol_code || 'N/A',
      destination_code: event_shipment&.pod_code || 'N/A',
      mode: get_shipment_label('mode', event_shipment&.mode ),
      term: get_shipment_label('term', event_shipment&.term ),
      container_summary: get_container_label(containers),
      mbl: mbl || 'N/A',
      hbl: hbl || 'N/A',
      vessel1: event_shipment&.vessel || 'N/A',
      voyage1: event_shipment&.voyage || 'N/A'
    }
  end

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
    chats.create!(chat_type: :other, visible: false, name: "Temporary")
  end

  def get_shipment_label(col, name)
    return 'N/A' if event_shipment.blank?
    return 'N/A' unless event_shipment.respond_to?(col)

    value = event_shipment.send(col)
    return 'N/A' if value.blank?

    I18n.t("activerecord.attributes.event_shipment.#{col}.#{name}", default: value)
  end

  def get_container_label(containers)
    return if containers.blank?

    type_map = {
      "Dry"    => "GP",
      "Reefer" => "RF",
      "OT"     => "OT",
      "FR"     => "FR"
    }

    result = containers.group_by do |c|
      size = c.cntr_size.delete("'") # 例: "20'" → "20", "40'HC" → "40HC"
      type = type_map[c.cntr_type] || c.cntr_type

      # Reefer の場合、"40'HC" も "40RF" に統一する
      if c.cntr_type == "Reefer"
        size = size.start_with?("40") ? "40" : size # "40HC" → "40"
      end

      "#{size}#{type}"
    end.transform_values(&:count)

    result
  end

end
