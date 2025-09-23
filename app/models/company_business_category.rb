class CompanyBusinessCategory < ApplicationRecord
  belongs_to :company
  belongs_to :business_category
  belongs_to :industry, optional: true
  has_one :carrier, dependent: :destroy
  include Discard::Model
  default_scope -> { kept }
  scope :clients, -> { joins(:business_category, :company).where(business_categories: { category: :client }) }
  scope :customs, -> { joins(:business_category, :company).where(business_categories: { category: :custom }) }
  scope :carriers, -> { joins(:business_category, :company).where(business_categories: { category: :carrier }) }
  scope :others, -> { joins(:business_category, :company).where(business_categories: { category: :other }) }
  scope :agents, -> { joins(:business_category, :company).where(business_categories: { category: :agent }) }
end
