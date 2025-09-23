class QuotationItem < ApplicationRecord
  belongs_to :quotation
  belongs_to :finbalance_item
  include Discard::Model
  default_scope -> { kept }
  enum :section, { export: 0, freight: 1, import: 2 }
end
