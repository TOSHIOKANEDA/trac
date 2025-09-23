# app/queries/events_search_query.rb
class EventsSearchQuery
  def initialize(base_events, params)
    @base_events = base_events
    @params = params
  end

  def call
    @q = @base_events.with_shipper_and_consignee.ransack(@params[:q])
    search_result = @q.result(distinct: true)
    search_result = filter_by_shipper(search_result)
    search_result = filter_by_consignee(search_result)
    
    [search_result, @q]
  end

  private

  def filter_by_shipper(result)
    return result unless shipper_name_present?
    result.by_shipper_name(@params[:q][:shipper_name_cont])
  end

  def filter_by_consignee(result)
    return result unless consignee_name_present?
    result.by_consignee_name(@params[:q][:consignee_name_cont])
  end

  def shipper_name_present?
    @params[:q] && @params[:q][:shipper_name_cont].present?
  end

  def consignee_name_present?
    @params[:q] && @params[:q][:consignee_name_cont].present?
  end
end
