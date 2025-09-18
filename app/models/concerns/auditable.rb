# app/models/concerns/auditable.rb
module Auditable
  extend ActiveSupport::Concern

  included do
    before_validation :set_create_id, on: :create
    before_validation :set_update_id

    private

    def set_create_id
      if respond_to?(:create_id) && create_id.blank?
        self.create_id = Current.user&.id
      end
    end

    def set_update_id
      if respond_to?(:update_id)
        self.update_id = Current.user&.id
      end
    end
  end
end
