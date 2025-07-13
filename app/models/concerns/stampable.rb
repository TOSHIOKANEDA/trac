module Stampable
  extend ActiveSupport::Concern

  included do
    before_create do
      if respond_to?(:create_id) && Current.user
        self.create_id = Current.user.id
      end
    end

    before_save do
      if respond_to?(:update_id) && Current.user
        self.update_id = Current.user.id
      end
    end
  end
end
