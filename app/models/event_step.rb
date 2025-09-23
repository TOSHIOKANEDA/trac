class EventStep < ApplicationRecord
  belongs_to :event
  include Discard::Model
end
