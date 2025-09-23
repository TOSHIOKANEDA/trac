class Kpler < ApplicationRecord
  include Discard::Model
  default_scope -> { kept }
end
