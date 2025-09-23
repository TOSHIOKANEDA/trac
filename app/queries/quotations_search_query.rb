class QuotationsSearchQuery
  def initialize(forwarder_id, params)
    @forwarder_id = forwarder_id
    @params = params
  end

  def call
    @q = Quotation.where(forwarder_id: @forwarder_id).includes(:client).ransack(@params[:q])
    search_result = @q.result(distinct: true)
    [search_result, @q]
  end
end
