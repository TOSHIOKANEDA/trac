class EventCompany < ApplicationRecord
  belongs_to :event
  belongs_to :company
  enum :role, { shipper: 0, consignee: 1, custom: 2, agent: 3, client: 4, si_notifier: 5, master_notifier: 6 }
  include Discard::Model
  default_scope -> { kept }

  # shipperとconsigneeを呼ぶスコープ
  scope :shipper_and_consignee, ->(event) {
    joins(:company)
      .where(event_id: event.id, role: [:shipper, :consignee])
      .select(
        "MAX(CASE WHEN event_companies.role = #{EventCompany.roles[:shipper]} THEN companies.japanese_name END) AS shipper",
        "MAX(CASE WHEN event_companies.role = #{EventCompany.roles[:consignee]} THEN companies.japanese_name END) AS consignee"
      )
      .group("event_companies.event_id")
  }

  def self.ransackable_attributes(auth_object = nil)
    %w[role]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[company]
  end
end
