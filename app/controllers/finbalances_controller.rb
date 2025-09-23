class FinbalancesController < ApplicationController
  before_action :load_attributes, only: [:index, :search]
  def index
  end

  def search
    render :index
  end

  private

  def load_attributes
    forwarder = current_user.company
    if params[:q].present?
      # 検索実行
      search_query = FinbalancesSearchQuery.new(forwarder.id, params)
      search_result, @q = search_query.call
      display_dates = search_query.display_dates
    else
      # 初期表示：全てのイベントを取得
      @q = Event.with_event_finbalances(forwarder.id).ransack(nil)
      search_result = @q.result(distinct: true)
      display_dates = { gteq: nil, lteq: nil }
    end
    
    # ビュー用（type="month"入力に再表示するため）
    @month_gteq_display = display_dates[:gteq]
    @month_lteq_display = display_dates[:lteq]

    # イベントの表示用カラムを取得（重複排除）
    @events = search_result.select(event_list_columns).distinct

    # イベントごとの集計データを取得
    event_ids = @events.map(&:id)
    aggregated_finbalances = Event.aggregate_finbalances_for_ids(event_ids)
    
    # イベントオブジェクトに集計データを付与
    @events = @events.map do |event|
      aggregated = aggregated_finbalances[event.id]

      event.attributes.merge(
        "income"=>aggregated&.aggregated_income || 0,
        "cost"=>aggregated&.aggregated_expense || 0,
        "balance"=>aggregated&.aggregated_balance || 0
      ).symbolize_keys
    end
    
    # 全体のサマリー（ページ全体の合計）を計算
    @totals = calculate_page_totals(@events)
    
    @ports = PortList.pluck(:name)
    @containers = Container.where(event_id: event_ids).group_by(&:event_id)
  end

  def event_list_columns
    [
      "events.id",
      "events.id_string",
      "events.mbl",
      "events.accounting_month",
      "event_shipments.shipment",
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

  def calculate_page_totals(events)
    total_income = events.sum { |e| e[:income].to_i }
    total_cost = events.sum { |e| e[:cost].to_i }
    total_balance = events.sum { |e| e[:balance].to_i }

    {
      total_income: total_income,
      total_cost: total_cost,
      total_balance: total_balance
    }
  end
end
