class FavoritesController < ApplicationController
  include CompanyAttributes
  
  before_action :set_attributes, only: [:new, :edit]
  before_action :find_favorite, only: [:edit, :update, :destroy]
  before_action :load_favorites, only: [:index, :search]

  def index
  end

  def search
    render :index
  end

  def new
    @favorite = Favorite.new
    build_new_favorite_associations
  end

  def edit
    ensure_all_favorite_companies
  end

  def update
    if @favorite.update(favorite_params)
      redirect_to edit_favorite_path(@favorite.id), notice: '更新しました'
    else
      render :edit
    end
  end

  def destroy
    if @favorite.destroy
      redirect_to favorites_path, notice: 'お気に入りが正常に削除されました。'
    else
      render :edit, notice: 'お気に入りが正常に削除されました。'
    end
  end

  def create
    @favorite = Favorite.new(favorite_params)
    @favorite.forwarder = current_user.company

    if @favorite.save
      redirect_to favorites_path, notice: 'お気に入りデータが正常に作成されました。'
    else
      render :new, notice: 'お気に入りデータの登録に失敗しました'
    end
  end

  def paste
    @event = Event.find(params[:event_id])
    @favorite = FavoriteFromEventCreator.new(@event, Time.current.year).call
    
    redirect_to edit_favorite_path(@favorite.id), notice: 'お気に入りを作成しました'
  rescue StandardError => e
    redirect_to event_path(@event.id), alert: "お気に入り作成に失敗しました: #{e.message}"
  end

  private

  def load_favorites
    base_favorites = current_user.company.own_favorites
    @favorites, @q = FavoritesSearchQuery.new(base_favorites, params).call
    @favorites = @favorites.select(favorite_list_columns)
  end

  def favorite_list_columns
    [
      "favorites.id",
      "favorites.name",
      "favorite_shipments.shipment AS shipment",
      "favorite_shipments.port_of_loading AS pol",
      "favorite_shipments.port_of_discharge AS pod",
      "shippers.english_name AS shipper",
      "consignees.english_name AS consignee"
    ]
  end

  def build_new_favorite_associations
    FavoriteCompany.roles.keys.each do |role|
      @favorite.favorite_companies.build(role: role)
    end
    @favorite.favorite_goods.build
    @favorite.build_favorite_doc
    @favorite.build_favorite_shipment
  end

  def ensure_all_favorite_companies
    EventCompany.roles.keys.each do |role|
      @favorite.favorite_companies.find_or_initialize_by(role: role)
    end
  end

  def find_favorite
    @favorite = Favorite.find(params[:id])
  end

  def favorite_params
    params.require(:favorite).permit(
      # 基本情報
      :name,
      :description,
      :remark,

      # 輸送情報
      favorite_shipment_attributes: [
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
        :carrier
      ],
            
      # event_schedule スケジュール
      favorite_companies_attributes: [ 
        :id,
        :role,
        :company_id
      ],
      
      # event_goods 貨物情報
      favorite_goods_attributes: [
        :id,
        :pkg,
        :type_of_pkg,
        :n_w,
        :g_w,
        :three_m,
        :_destroy
      ],
      
      # event_doc 必要書類
      favorite_doc_attributes: [
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
