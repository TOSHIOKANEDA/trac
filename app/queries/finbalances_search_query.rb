# app/queries/finbalances_search_query.rb
class FinbalancesSearchQuery
  def initialize(forwarder_id, params)
    @forwarder_id = forwarder_id
    @params = params
  end

  def call
    q_params = prepare_search_params
    @q = Event.with_finbalances(@forwarder_id).ransack(q_params)
    
    search_result = @q.result(distinct: true)
    search_result = filter_by_client_name(search_result, q_params)
    
    [search_result, @q]
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
