class CompanyBusinessCategory < ApplicationRecord
  belongs_to :company
  belongs_to :business_category
  include Discard::Model
end
