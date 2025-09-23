class FavoriteGood < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
end
