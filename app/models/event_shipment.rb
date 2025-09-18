class EventShipment < ApplicationRecord
  belongs_to :event
  enum :shipment, {export: 0, import: 1, third_country: 2 }
  enum :med, { lcl: 0, fcl: 1, air: 2 }
  enum :term, { exb: 0, fob: 1, fca: 2, cfr: 3, cif: 4, dap: 5, ddp: 6 }
  include Discard::Model
  def self.ransackable_attributes(auth_object = nil)
    %w[shipment port_of_loading port_of_discharge]
  end
end
