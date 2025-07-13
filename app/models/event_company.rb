class EventCompany < ApplicationRecord
  belongs_to :event
  belongs_to :company
  enum :role, { shipper: 0, consignee: 1, custom: 2, agent: 3, client: 4, si_notifier: 5, master_notifier: 6 }

  def self.ransackable_attributes(auth_object = nil)
    %w[role]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[company]
  end
end
