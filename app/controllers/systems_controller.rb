class SystemsController < ApplicationController
  
  # indexビューを描画する全てのアクションの前にこれを実行
  before_action :load_index_data, only: [:index, :port_search, :finbalance_item_search, :industry_search, :port_create, :finbalance_item_create, :industry_create]

  def index
    # URLパラメータ (例: /systems?tab=port-tab) があれば、それを優先する
    if params[:tab].present? && ['finbalance-tab', 'port-tab', 'industry-tab'].include?(params[:tab])
      @active_tab = params[:tab]
    end
    # load_index_dataで設定された@active_tab (デフォルト) がそのまま使われる
  end

  # --- 登録アクション ---

  def port_create
    @port = PortList.new(port_params)
    if @port.save
      # 成功時: 港タブを指定してリダイレクト
      redirect_to systems_path(tab: 'port-tab'), notice: "港名を登録しました。"
    else
      # 失敗時: 港タブをアクティブにするよう設定
      @active_tab = 'port-tab'
      flash.now[:alert] = @port.errors.full_messages.join(', ')
      render :index, status: :unprocessable_entity
    end
  end
  
  def finbalance_item_create
    @finbalance_item = FinbalanceItem.new(finbalance_item_params)
    if @finbalance_item.save
      # 成功時: 支払いタブを指定してリダイレクト
      redirect_to systems_path(tab: 'finbalance-tab'), notice: "支払い・請求項目を登録しました。"
    else
      # 失敗時: 支払いタブをアクティブにするよう設定
      @active_tab = 'finbalance-tab'
      flash.now[:alert] = @finbalance_item.errors.full_messages.join(', ')
      render :index, status: :unprocessable_entity
    end
  end

  def industry_create
    @industry = Industry.new(industry_params)
    if @industry.save
      # 成功時: 業種タブを指定してリダイレクト
      redirect_to systems_path(tab: 'industry-tab'), notice: "業種を登録しました。"
    else
      # 失敗時: 業種タブをアクティブにするよう設定
      @active_tab = 'industry-tab'
      flash.now[:alert] = @industry.errors.full_messages.join(', ')
      render :index, status: :unprocessable_entity
    end
  end

  # --- 検索アクション ---

  def port_search
    # 検索実行時に、港タブをアクティブにするよう設定
    @active_tab = 'port-tab'
    query = params[:query]
    if query.present?
      @port_results = PortList.where("name LIKE ? OR port_code LIKE ?", "%#{query}%", "%#{query}%")
    end
    @port_search_query = query 
    
    render :index
  end
  
  def finbalance_item_search
    # 検索実行時に、支払いタブをアクティブにするよう設定
    @active_tab = 'finbalance-tab'
    query = params[:query]
    if query.present?
      @finbalance_item_results = FinbalanceItem.where("item_name LIKE ?", "%#{query}%")
    end
    @finbalance_search_query = query
    
    render :index
  end

  def industry_search
    # 検索実行時に、業種タブをアクティブにするよう設定
    @active_tab = 'industry-tab'
    query = params[:query]
    if query.present?
      @industry_results = Industry.where("industry_name LIKE ?", "%#{query}%")
    end
    @industry_search_query = query
    
    render :index
  end
  
  private

  def port_params
    params.require(:port_list).permit(:name, :port_code)
  end
  
  def finbalance_item_params
    params.require(:finbalance_item).permit(:item_name)
  end
  
  def industry_params
    params.require(:industry).permit(:industry_name)
  end

  def load_index_data
    # 1. 登録フォーム用のオブジェクト
    @port ||= PortList.new
    @finbalance_item ||= FinbalanceItem.new
    @industry ||= Industry.new
    
    # 2. 検索結果表示用の空のコレクション
    @port_results ||= PortList.none
    @finbalance_item_results ||= FinbalanceItem.none
    @industry_results ||= Industry.none

    # 3. 検索クエリ用の変数
    @port_search_query ||= nil
    @finbalance_search_query ||= nil
    @industry_search_query ||= nil
    
    # 4. デフォルトのアクティブタブを設定 (||= で、他のアクションで設定済みなら上書きしない)
    @active_tab ||= 'finbalance-tab'
  end
  
  # ... (Strong Parametersは省略) ...
end