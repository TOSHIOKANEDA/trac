class EventsController < ApplicationController
  before_action :set_attributes, only: [:edit, :new]
  before_action :find_event, only: [:edit, :update, :destroy]

  def index
  end

  def destroy
    if @event.destroy
      redirect_to list_events_path, notice: '船積みデータが正常に削除されました。'
    else
      render :edit, notice: '船積みデータの削除に失敗しました'
    end
  end

  def list
    company = current_user.company
    base_events = company.is_forwarder ? company.organized_events : company.participated_events
    
    # ransackを使用して検索条件を構築
    @q = base_events.with_shipper_and_consignee.ransack(params[:q])
    
    # 基本的な検索結果を取得
    search_result = @q.result(distinct: true)
    
    # Shipper名での絞り込み（ransackでは複雑な関連テーブル検索が難しいため）
    if params[:q] && params[:q][:shipper_name_cont].present?
      search_result = search_result.by_shipper_name(params[:q][:shipper_name_cont])
    end
    
    # Consignee名での絞り込み
    if params[:q] && params[:q][:consignee_name_cont].present?
      search_result = search_result.by_consignee_name(params[:q][:consignee_name_cont])
    end
    
    @events = search_result.select(
      "events.id",
      "events.id_string",
      "events.mbl",
      "event_shipments.shipment AS shipment",
      "event_shipments.port_of_loading AS pol",
      "event_shipments.port_of_discharge AS pod",
      "event_schedules.pol_etd AS etd",
      "event_schedules.pod_eta AS eta",
      "shippers.english_name AS shipper",
      "consignees.english_name AS consignee"
    )
  end

  def create
    @event = Event.new(event_params)
    @event.forwarder = current_user.company
    @event.year = Time.current.year
    @event.accounting_month = Event.generate_accounting_month(event_params[:ac_year], event_params[:ac_month])

    if @event.save
      redirect_to list_events_path, notice: '船積みデータが正常に作成されました。'
    else
      render :new, notice: '船積みデータの登録に失敗しました'
    end
  end

  def edit
    @id_string = @event.id_string
    @event.ac_year = @event.accounting_month&.year
    @event.ac_year = @event.accounting_month&.month
    @chat_users = EventCompany.where(event_id: @event.id).joins(company: :users).
                  select("users.id as user_id", "users.name as name", "companies.japanese_name as company", "CONCAT(users.name, '（', companies.japanese_name, '）') AS user_and_company")
  end

  def update
    event_hash = event_params.to_h
    event_hash[:accounting_month] = Event.generate_accounting_month(event_params[:ac_year], event_params[:ac_month])

    if @event.update(event_hash)
      redirect_to edit_event_path(@event.id), notice: '更新しました'
    else
      render :edit
    end
  end

  def new
    @event = Event.new
    %w[shipper consignee si_notifier master_notifier client agent custom].each do |role|
      @event.event_companies.build(role: role)
    end
    @event.containers.build
    @event.event_goods.build
    @event.event_steps.build
    @event.build_event_doc
    @event.build_event_shipment
    @event.build_event_schedule
    @id_string ||= @event.generate_id
  end

  private

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
        :med,
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
        :carrier
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

  def set_attributes
    @ports = PortList.pluck(:name)
    @users = current_user.company.users
    @company_groups = BusinessCategory.where(companies: {status: true}).joins(:companies).select("companies.id AS id", "companies.english_name AS name", "business_categories.category").group_by(&:category)
  end
end
