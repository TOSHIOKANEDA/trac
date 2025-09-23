class FinbalanceAssembly < ApplicationRecord
  belongs_to :finbalance
  belongs_to :finbalance_item
  include Discard::Model
  default_scope -> { kept }

  before_validation :sanitize_amounts

  private

  def sanitize_amounts
    %i[income_amount cost_amount balance_amount].each do |attr|
      value = send(attr)
      send("#{attr}=", value.to_s.delete(",")) if value.present?
    end
  end
end
