class FinbalanceItem < ApplicationRecord
  belongs_to :forwarder, class_name: "Company", foreign_key: :forwarder_id
  include Discard::Model
  default_scope -> { kept }
end
