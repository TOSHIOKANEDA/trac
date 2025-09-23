class EventsController < ApplicationController
  include CompanyAttributes
  include EventDisplayData
  
  before_action :set_attributes, only: [:edit, :new, :paste]
  before_action :find_event, only: [:edit, :update, :destroy]
  before_action :display_header, only: [:edit, :new, :paste]

  def index
    respond_to do |format|
      format.json do
        # カレンダー用 API エンドポイント
        forwarder_id = current_user.company_id
        events = Event.for_calendar(forwarder_id)&.to_a
        
        render json: {
          success: true,
          data: events.map(&:as_calendar_json),
          total: events.count
        }, status: :ok
      end
      
      format.html do
        # HTML は空のテンプレートを返す（既存の index.html.erb）
      end
    end
  end

  # 以下、既存のコードは変更なし
  
  def destroy
    if @event.destroy
      redirect_to list_events_path, notice: '船積みデータが正常に削除されました。'
    else
      render :edit, notice: '船積みデータの削除に失敗しました'
    end
  end

  def list
    base_events = base_events_for_current_company
    @events, @q = EventsSearchQuery.new(base_events, params).call
    
    @events = @events.select(event_list_columns)
    @event_steps = EventStep.where(
      event_id: @events.ids,
      status: [:vanning, :quarantine, :custom]
    ).group_by(&:event_id)
  end

  def create
    @event = Event.new(event_params)
    @event.forwarder = current_user.company
    @event.year = Time.current.year
    @event.accounting_month = Event.generate_accounting_month(
      event_params[:ac_year],
      event_params[:ac_month]
    )

    if @event.save
      redirect_to list_events_path, notice: '船積みデータが正常に作成されました。'
    else
      render :new, notice: '船積みデータの登録に失敗しました'
    end
  end

  def edit
    @id_string = @event.id_string
    @event.ac_year = @event.accounting_month&.year
    @event.ac_month = @event.accounting_month&.month

    build_new_event_associations
    prepare_event_display_data(@event)
  end

  def update
    event_hash = event_params.to_h
    event_hash[:accounting_month] = Event.generate_accounting_month(
      event_params[:ac_year],
      event_params[:ac_month]
    )
    if @event.update(event_hash)
      redirect_to edit_event_path(@event.id), notice: '更新しました'
    else
      render :edit
    end
  end

  def paste
    if params[:favorite_id]
      @favorite = Favorite.includes(:favorite_doc).find(params[:favorite_id])
      @event = EventFromFavoriteCreator.new(@favorite, Time.current.year, current_user).call
    elsif params[:quotation_id]
      @quotation = Quotation.find(params[:quotation_id])
      @event = EventFromQuotationCreator.new(@quotation, Time.current.year, current_user).call
    else
      redirect_to root_path, alert: 'パラメータが不正です'
      return
    end
    
    @id_string = @event.id_string
    prepare_event_display_data(@event)
    redirect_to edit_event_path(@event.id), notice: '案件登録しました'
  end

  def new
    @event = Event.new
    @id_string = @event.generate_id
    
    build_new_event_associations
  end

  private

  def base_events_for_current_company
    company = current_user.company
    company.is_forwarder ? company.organized_events : company.participated_events
  end

  def event_list_columns
    [
      "events.id",
      "events.id_string",
      "events.mbl",
      "event_shipments.shipment AS shipment",
      "event_shipments.port_of_loading AS pol",
      "event_shipments.port_of_discharge AS pod",
      "event_schedules.pol_etd AS etd",
      "event_schedules.pod_eta AS eta",
      "shippers.english_name AS shipper",
      "consignees.english_name AS consignee",
      "event_schedules.pol_etd",
      "event_schedules.pol_atd",
      "event_schedules.pod_eta",
      "event_schedules.pod_ata",
      "event_schedules.delivery_date",
      "event_docs.completed"
    ]
  end

  def ensure_all_event_companies
    EventCompany.roles.keys.each do |role|
      @event.event_companies.find_or_initialize_by(role: role)
    end
  end

  def build_new_event_associations
    ensure_all_event_companies
    @event.containers.build if @event.containers.blank?
    @event.event_goods.build if @event.event_goods.blank?
    @event.event_steps.build if @event.event_steps.blank?
    @event.build_event_doc if @event.event_doc.blank?
    @event.build_event_shipment if @event.event_shipment.blank?
    @event.build_event_schedule if @event.event_schedule.blank?
  end

  def display_header
    @display_header = ["edit", "paste"].include?(action_name)
  end

  def find_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(
      # Event 基本情報
      :id_string,
      :mbl,
      :hbl,
      :user_id,
      :charge,
      :soa,
      :description,
      :remark,
      :ac_year,
      :ac_month,
      
      # event_shipment 輸送情報
      event_shipment_attributes: [
        :id,
        :shipment,
        :mode,
        :term,
        :place_of_receipt,
        :port_of_loading,
        :port_of_discharge,
        :port_of_delivery,
        :pick_up,
        :delivery,
        :vessel,
        :voyage,
        :booking_no,
        :carrier_id
      ],
      
      # containers コンテナ情報（複数）
      containers_attributes: [
        :id,
        :cntr_num,
        :cntr_type,
        :cntr_size,
        :cntr_seal,
        :cntr_remark,
        :_destroy
      ],
      
      # event_schedule スケジュール
      event_companies_attributes: [ 
        :id,
        :role,
        :company_id
      ],

      # event_schedule スケジュール
      event_schedule_attributes: [
        :id,
        :container_pick_up,
        :vanning_date,
        :cut_off_date,
        :pol_etd,
        :pol_atd,
        :pod_eta,
        :pod_ata,
        :delivery_date
      ],
      
      # event_goods 貨物情報
      event_goods_attributes: [
        :id,
        :pkg,
        :type_of_pkg,
        :n_w,
        :g_w,
        :three_m,
        :_destroy
      ],
      
      # event_doc 必要書類
      event_doc_attributes: [
        :id,
        # 荷主提出書類 (shipper_docs)
        :invoice,
        :packing_list,
        :msds,
        :coo,
        :quarantine,
        :l_c,
        :van_photo,
        :van_repo,
        :slip,
        
        # フォワーダー提出書類 (forwarder_docs)
        :quotation,
        :s_i,
        :hbl_awb,
        :dg_declaration,
        :insurance,
        :booking_confirmation,
        :mbl,
        :freight_memo,
        :house_arrival_notice,
        :master_arrival_notice,
        :pod,
        
        # 通関業者提出書類 (custom_docs)
        :weight_cert,
        :export_permit,
        :dock_receipt
      ]
    )
  end
end
