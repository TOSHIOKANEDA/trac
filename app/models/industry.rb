class Industry < ApplicationRecord
  has_many :company_business_categories, -> { kept }
  include Discard::Model
  default_scope -> { kept }

  validates :industry_name, presence: true
end
