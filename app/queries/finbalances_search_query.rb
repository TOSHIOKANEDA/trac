# app/queries/finbalances_search_query.rb
class FinbalancesSearchQuery
  def initialize(forwarder_id, params)
    @forwarder_id = forwarder_id
    @params = params
  end

  def call
    q_params = prepare_search_params
    @q = Event.with_event_finbalances(@forwarder_id).ransack(q_params)
    
    search_result = @q.result(distinct: true)
    search_result = filter_by_client_name(search_result, q_params)
    
    [search_result, @q]
  end

  # イベントごとの集計データを取得
  def aggregated_finbalances(event_ids)
    return {} if event_ids.empty?

    Event
      .joins(:event_finbalances)
      .where(id: event_ids)
      .group("events.id")
      .select(
        "events.id",
        "SUM(event_finbalances.income) AS total_income",
        "SUM(event_finbalances.expense) AS total_expense",
        "SUM(event_finbalances.balance) AS total_balance"
      )
      .index_by(&:id)
  end

  def display_dates
    @date_converter&.display_dates || { gteq: nil, lteq: nil }
  end

  private

  def prepare_search_params
    return {} if @params[:q].blank?

    @date_converter = AccountingMonthConverter.new(@params[:q].dup)
    @date_converter.call
  end

  def filter_by_client_name(result, q_params)
    return result unless q_params[:client_name_cont].present?
    result.by_client_name(q_params[:client_name_cont])
  end
end
