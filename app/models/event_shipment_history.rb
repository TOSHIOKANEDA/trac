class EventShipmentHistory < ApplicationRecord
  belongs_to :event
  include Discard::Model
  default_scope -> { kept }
end
