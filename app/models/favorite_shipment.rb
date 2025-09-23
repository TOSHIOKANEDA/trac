class FavoriteShipment < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  enum :shipment, {export: 0, import: 1, third_country: 2 }
  enum :mode, { lcl: 0, fcl: 1, air: 2 }
  enum :term, { exb: 0, fob: 1, fca: 2, cfr: 3, cif: 4, dap: 5, ddp: 6 }

  def self.ransackable_attributes(auth_object = nil)
    [ "port_of_discharge", "port_of_loading", "shipment"]
  end
end
