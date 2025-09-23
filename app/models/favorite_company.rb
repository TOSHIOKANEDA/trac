class FavoriteCompany < ApplicationRecord
  belongs_to :favorite
  belongs_to :company
  include Discard::Model
  default_scope -> { kept }
  enum :role, { shipper: 0, consignee: 1, custom: 2, agent: 3, client: 4, si_notifier: 5, master_notifier: 6 }

  # shipperとconsigneeを呼ぶスコープ
  scope :shipper_and_consignee, ->(favorite) {
    joins(:company)
      .where(favorite_id: favorite.id, role: [:shipper, :consignee])
      .select(
        "MAX(CASE WHEN favorite_companies.role = #{FavoriteCompany.roles[:shipper]} THEN companies.japanese_name END) AS shipper",
        "MAX(CASE WHEN favorite_companies.role = #{FavoriteCompany.roles[:consignee]} THEN companies.japanese_name END) AS consignee"
      )
      .group("favorite_companies.favorite_id")
  }

  def self.ransackable_attributes(auth_object = nil)
    %w[role]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[company]
  end
end
