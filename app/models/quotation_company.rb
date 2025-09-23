class QuotationCompany < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  belongs_to :quotation
  belongs_to :company

  def company_category
    company.company_business_categories
         .joins(:business_category)
         .pluck("business_categories.category")
         .first
  end
end
