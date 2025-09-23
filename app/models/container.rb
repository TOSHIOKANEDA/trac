class Container < ApplicationRecord
  belongs_to :event, counter_cache: :containers_count
  include Discard::Model
  default_scope -> { kept }
end
