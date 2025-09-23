class CompanyBusinessCategory < ApplicationRecord
  belongs_to :company
  belongs_to :business_category
  include Discard::Model
  default_scope -> { kept }
  scope :clients, -> { joins(:business_category, :company).where(business_categories: { category: :client }) }
  scope :customs, -> { joins(:business_category, :company).where(business_categories: { category: :custom }) }
end
