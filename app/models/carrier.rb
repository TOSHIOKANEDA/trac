class Carrier < ApplicationRecord
  belongs_to :company_business_category
  has_one :company, through: :company_business_category
  include Discard::Model
  default_scope -> { kept }

  validates :scac, presence: true, uniqueness: true
  validate :validate_scac_or_is_air

  private

  # SCACまたはis_airのいずれかが必須
  def validate_scac_or_is_air
    # Airの場合、SCACを自動的に"AIR"に設定
    if is_air == true
      self.scac = 'AIR'
    elsif scac.blank?
      errors.add(:scac, 'SCAC is required for Ship')
    end
  end
end