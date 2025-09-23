class QuotationsController < ApplicationController
  before_action :set_attributes, only: [:new, :create, :edit, :update, :copy]
  before_action :load_attributes, only: [:index, :search]
  before_action :find_quotation, only: [:update, :edit, :copy, :show]

  def copy
    begin
      @quotation = @quotation.copy_with_associations
      redirect_to edit_quotation_path(@quotation), notice: '見積りをコピーしました。'
    rescue => e
      redirect_to quotations_path, alert: "コピーに失敗しました: #{e.message}"
    end
  end

  def index
  end

  def search
    render :index
  end

  def show    
    respond_to do |format|
      format.html
      format.pdf do
        pdf_service = QuotationPdfService.new(@quotation)
        send_data pdf_service.generate,
                  filename: "invoice_#{@quotation.id}_#{Date.today.strftime('%Y%m%d')}.pdf",
                  type: 'application/pdf',
                  disposition: 'inline'  # ブラウザで表示
      end
    end
  end

  def new
    @quotation = Quotation.new
    @quotation.quotation_items.build(section: :export)
    @quotation.quotation_items.build(section: :freight)
    @quotation.quotation_items.build(section: :import)
  end

  def create
    @quotation = Quotation.new(quotation_params)
    @quotation.user_id = current_user.id
    @quotation.forwarder = current_user.company
    @quotation.issue_at = Time.current  # 請求日を設定

    if @quotation.save
      redirect_to quotations_path, notice: '見積りデータが正常に作成されました。'
    else
      render :new, notice: '見積りデータの登録に失敗しました'
    end
  end

  def update
    if @quotation.update(quotation_params)
      redirect_to edit_quotation_path(@quotation.id), notice: '更新しました'
    else
      render :edit
    end
  end

  def edit
  end

  private

  def find_quotation
    @quotation = Quotation.includes(:companies, :quotation_items).find(params[:id])
  end

  def set_attributes
    @units = ["件","20'","40'","台","コンテナ","個","KG","M3","箱","欄","Page","葉"]
    @client_companies = current_user.company.customers.joins(:company).select(:company_id, "companies.japanese_name AS name").distinct
    @sections = [
      { key: 'export', title: '輸出に関する費用' },
      { key: 'freight', title: '運賃' },
      { key: 'import', title: '輸入に関する費用' }
    ]
    @finbalance_items = current_user.company.finbalance_items
    @display_copy = ["edit", "update", "edit", "copy"].include? action_name
    all_companies = current_user.company.customers.joins(:company, :business_category).select(
      "companies.id AS id",
      "companies.japanese_name AS name",
      "business_categories.category"
    )

    # category でグループ分け
    @company_options_map = all_companies.group_by(&:category)

    # 各タイプ別に変数も作成（hidden div 用）
    @carriers = @company_options_map[BusinessCategory.categories['carrier']] || []
    @customs = @company_options_map[BusinessCategory.categories['custom']] || []
    @agents = @company_options_map[BusinessCategory.categories['agent']] || []
    @others = @company_options_map[BusinessCategory.categories['other']] || []
  end

  def load_attributes
    forwarder = current_user.company
    search_query = QuotationsSearchQuery.new(forwarder.id, params)
    @quotations, @q = search_query.call
    @ports = PortList.pluck(:name)
  end

  def quotation_params
    params.require(:quotation).permit(
      :client_id,
      :client_pic_name,
      :quotation_scope,
      :condition,
      :cargo,
      :place_of_receipt,
      :port_of_loading,
      :port_of_discharge,
      :port_of_delivery,
      :carrier,
      :valid_at,
      :total_amount,
      :mode,
      :term,
      :condition,
      :is_air,
      :shipment,
      :issued_in_english,
      :issued_by_foreign_currency,
      :currency,
      :exchange_rate,
      quotation_companies_attributes: [:id, :company_id, :_destroy],
      quotation_items_attributes: [
        :id,
        :finbalance_item_id,
        :unit,
        :tax_flag,
        :currency,
        :exchange_rate,
        :cost_unit,
        :selling_unit,
        :item_remark,
        :section,
        :quantity,
        :purchase_unit_price,
        :purchase_amount,
        :sales_unit_price,
        :sales_amount,
        :gross_profit,
        :gross_profit_rate,
        :_destroy
      ]
    )
  end
end
