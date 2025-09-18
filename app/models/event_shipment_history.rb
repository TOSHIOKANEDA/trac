class EventShipmentHistory < ApplicationRecord
  belongs_to :event
  include Discard::Model
end
