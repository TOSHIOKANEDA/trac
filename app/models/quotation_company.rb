class QuotationCompany < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  belongs_to :quotation
  belongs_to :company
end
