class Finbalance < ApplicationRecord
  belongs_to :event
  include Discard::Model
  default_scope -> { kept }
  has_many :finbalance_assemblies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :finbalance_assemblies, allow_destroy: true

  before_save :sum_income_and_cost

  validate :no_duplicate_items

  private

  def sum_income_and_cost
    self.income  = finbalance_assemblies&.sum { |a| a.income_amount.to_i } || 0
    self.cost    = finbalance_assemblies&.sum { |a| a.cost_amount.to_i } || 0
    self.balance = finbalance_assemblies&.sum { |a| a.balance_amount.to_i } || 0
  end

  def no_duplicate_items
    # 削除予定でない行だけを対象
    valid_assemblies = finbalance_assemblies.reject(&:marked_for_destruction?)

    counts = valid_assemblies.map(&:finbalance_item_id).tally
    duplicates = counts.select { |_, v| v > 1 }.keys

    return if duplicates.empty?

    # 重複しているitem_nameを取得
    names = FinbalanceItem.where(id: duplicates).pluck(:item_name)
    errors.add(:base, "#{names.join(', ')} はすでに追加されています")
  end
end
