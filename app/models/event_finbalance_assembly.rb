class EventFinbalanceAssembly < ApplicationRecord
  belongs_to :event_finbalance
  belongs_to :finbalance_item
  include Discard::Model
  default_scope -> { kept }

  before_validation :sanitize_amounts

  private

  def sanitize_amounts
    # 金額フィールドのカンマを削除し、小数点を処理
    %i[purchase_amount sales_amount gross_profit purchase_unit_price sales_unit_price].each do |attr|
      value = send(attr)
      if value.present?
        # カンマを削除して数値に変換
        cleaned = value.to_s.delete(",")
        # 小数点以下を切り捨て（日本の商慣習）
        send("#{attr}=", cleaned.to_i)
      end
    end

    # gross_profit_rateは小数型なので別途処理
    if gross_profit_rate.present?
      cleaned = gross_profit_rate.to_s.delete(",")
      send("gross_profit_rate=", cleaned.to_f)
    end
  end
end
