class BusinessCategory < ApplicationRecord
  has_many :company_business_categories
  has_many :companies, through: :company_business_categories
  enum :category, { shipper: 0, consignee: 1, client: 2, notifier: 3, agent: 4, custom: 5 }
end
