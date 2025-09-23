class FinbalancesController < ApplicationController
  before_action :set_attributes, only: [:new, :edit, :update, :create]
  before_action :set_finbalance, only: [:edit, :update]
  before_action :sanitize_finbalance_amounts, only: [:create, :update]

  def index
    forwarder = current_user.company
    search_query = FinbalancesSearchQuery.new(forwarder.id, params)
    @events, @q = search_query.call
    
    # ビュー用（type="month"入力に再表示するため）
    display_dates = search_query.display_dates
    @month_gteq_display = display_dates[:gteq]
    @month_lteq_display = display_dates[:lteq]

    @events = @events.select(event_list_columns)
    @totals = calculate_totals(@events)
    
    @ports = PortList.pluck(:name)
    @containers = Container.where(event_id: @events.ids).group_by(&:event_id)
  end

  def new
    @event_company = EventCompany.shipper_and_consignee(@event).first
    @finbalance = Finbalance.new(event_id: @event.id)
    @finbalance.finbalance_assemblies.build
  end

  def edit
    @finbalance.finbalance_assemblies.build if @finbalance&.finbalance_assemblies.blank?
  end

  def update
    if @finbalance.update(finbalance_params)
      redirect_to edit_finbalance_path(@finbalance, event_id: @finbalance.event_id), 
                  notice: "更新しました"
    else
      flash.now[:error] = @finbalance.errors.full_messages.join(", ")
      render :edit
    end
  end

  def create
    @finbalance = Finbalance.new(finbalance_params)
    if @finbalance.save
      redirect_to edit_finbalance_path(@finbalance, event_id: @finbalance.event_id), 
                  notice: "登録しました"
    else
      flash.now[:error] = @finbalance.errors.full_messages.join(", ")
      render :edit
    end
  end

  private

  def event_list_columns
    [
      "finbalances.cost",
      "finbalances.income",
      "finbalances.balance",
      "events.id",
      "events.id_string",
      "events.mbl",
      "events.accounting_month",
      "event_shipments.shipment AS shipment",
      "event_shipments.mode",
      "event_shipments.port_of_loading AS pol",
      "event_shipments.port_of_discharge AS pod",
      "clients.english_name AS client",
      "event_schedules.pol_etd AS etd",
      "event_schedules.pod_eta AS eta",
      "event_schedules.pol_atd AS atd",
      "event_schedules.pod_ata AS ata"
    ]
  end

  def calculate_totals(search_result)
    search_result.select(
      "SUM(finbalances.cost) AS total_cost",
      "SUM(finbalances.income) AS total_income",
      "SUM(finbalances.balance) AS total_balance"
    ).take
  end

  def set_attributes
    @event = Event.includes(:event_schedule, :event_shipment, :event_files)
                  .find(params[:event_id] || finbalance_params[:event_id])
    @finbalance_items = current_user.company.finbalance_items
    @estimated_files = @event.event_files.where(is_estimate: true)
  end

  def set_finbalance
    @finbalance = Finbalance.find(params[:id])
  end

  def finbalance_params
    params.require(:finbalance).permit(
      :event_id, 
      :balance, 
      :income, 
      :cost,
      finbalance_assemblies_attributes: [
        :id, 
        :finbalance_item_id, 
        :income_amount, 
        :cost_amount, 
        :balance_amount, 
        :_destroy
      ]
    )
  end
end
