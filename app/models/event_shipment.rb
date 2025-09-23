class EventShipment < ApplicationRecord
  belongs_to :event
  enum :shipment, {export: 0, import: 1, third_country: 2 }
  enum :mode, { lcl: 0, fcl: 1, air: 2 }
  enum :term, { exb: 0, fob: 1, fca: 2, cfr: 3, cif: 4, dap: 5, ddp: 6 }
  include Discard::Model

  before_save :save_port_code
  default_scope -> { kept }

  def self.ransackable_attributes(auth_object = nil)
    %w[shipment port_of_loading port_of_discharge mode]
  end

  def save_port_code
    self.pol_code = PortList.find_by(name: self.port_of_loading)&.port_code
    self.pod_code = PortList.find_by(name: self.port_of_discharge)&.port_code
  end

end
