# app/services/accounting_month_converter.rb
class AccountingMonthConverter
  def initialize(params)
    @params = params
  end

  def call
    return @params if @params.blank?

    converted_params = @params.dup
    gteq_str = converted_params[:accounting_month_gteq].presence
    lteq_str = converted_params[:accounting_month_lteq].presence

    converted_params[:accounting_month_gteq] = convert_start_date(gteq_str) if gteq_str.present?
    converted_params[:accounting_month_lteq] = convert_end_date(lteq_str) if lteq_str.present?

    converted_params
  end

  def display_dates
    {
      gteq: @params[:accounting_month_gteq],
      lteq: @params[:accounting_month_lteq]
    }
  end

  private

  def convert_start_date(date_str)
    "#{date_str}-01"
  end

  def convert_end_date(date_str)
    year, month = date_str.split('-').map(&:to_i)
    last_day = Date.civil(year, month, -1).day
    "#{date_str}-#{last_day}"
  end
end
