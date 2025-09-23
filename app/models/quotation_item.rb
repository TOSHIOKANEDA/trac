class QuotationItem < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  enum :section, { export: 0, freight: 1, import: 2 }
end
