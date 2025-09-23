class BusinessCategory < ApplicationRecord
  has_many :company_business_categories, -> { kept }
  has_many :companies, -> { kept }, through: :company_business_categories
  enum :category, { forwarder: 0, shipper: 1, consignee: 2, client: 3, notifier: 4, agent: 5, custom: 6, carrier: 7, other: 8 }
  include Discard::Model
  default_scope -> { kept }
end
