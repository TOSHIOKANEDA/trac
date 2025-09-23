class FavoriteFinbalance < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
  belongs_to :favorite
  has_many :favorite_finbalance_assemblies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :favorite_finbalance_assemblies, allow_destroy: true
end
