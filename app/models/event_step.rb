class EventStep < ApplicationRecord
  belongs_to :event
  include Discard::Model
  default_scope -> { kept }
  enum :status, { booking: 0, docs: 1, vanning: 2, quarantine: 3, custom: 4, etd: 5, eta: 6, delivery: 7, invoice: 8 }
end
