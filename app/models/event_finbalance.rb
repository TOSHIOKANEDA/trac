class EventFinbalance < ApplicationRecord
  belongs_to :event
  include Discard::Model
  default_scope -> { kept }
  has_many :event_finbalance_assemblies, -> { kept }, dependent: :destroy
  accepts_nested_attributes_for :event_finbalance_assemblies, allow_destroy: true

  before_validation :sanitize_amounts

  private

  def sanitize_amounts
    # 金額フィールドのカンマを削除し、小数点を処理
    %i[income expense balance small_total comumption_tax_total total_amount].each do |attr|
      value = send(attr)

      if value.present?
        # カンマを削除して数値に変換
        cleaned = value.to_s.delete(",")
        # 小数点以下を切り捨て（日本の商慣習）
        send("#{attr}=", cleaned.to_i)
      end
    end
  end
end
