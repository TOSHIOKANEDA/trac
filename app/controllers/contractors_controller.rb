class ContractorsController < ApplicationController
  before_action :set_attributes, only: [:new, :edit, :update]
  before_action :find_company, only: [:destroy, :edit, :update]
  before_action :has_events, only: [:destroy, :edit]

  def index
    @companies = Company.with_categories(current_user.company_id)
  end

  def new
    @company = Company.new
    @company.users.build
    prepare_form_data
  end

  def destroy
    if @company.destroy
      redirect_to contractors_path, notice: '取引先データが正常に削除されました。'
    else
      render :edit, notice: '取引先データの削除に失敗しました'
    end
  end

  def search
  end

  def create
    @company = Company.new(company_params.except(:business_category_ids, :category_attributes))
    @company.users.each do |user|
      user.password = "password"
    end

    if @company.save
      forwarder_id = current_user.company.id
      category_ids = company_params[:business_category_ids]
      category_attributes = company_params[:category_attributes] || {}

      if category_ids.present?
        @company.create_business_category(category_ids, forwarder_id, category_attributes)
      end

      redirect_to contractors_path, notice: '取引先が正常に作成されました。'
    else
      @company.users.build if @company.users.empty?
      set_attributes
      prepare_form_data
      messages = []
      messages += @company.users.flat_map do |u|
        u.errors.details.flat_map { |attr, ds|
          ds.map { |d| "ユーザー #{u.name.presence || u.email} の #{u.class.human_attribute_name(attr)} #{User.new.errors.generate_message(attr, d[:error])}" } 
        }
      end

      flash[:alert] = messages.join(',')
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    prepare_form_data
  end

  def update
    category_ids = params[:company].delete(:business_category_ids)
    category_attributes = params[:company].delete(:category_attributes) || {}
    forwarder_id = current_user.company.id

    if @company.update(company_params)
      if category_ids.present?
        @company.create_business_category(category_ids, forwarder_id, category_attributes)
      end
      redirect_to edit_contractor_path(@company.id), notice: '更新しました'
    else
      prepare_form_data
      render :edit
    end
  end

  private

  def company_params
    params.require(:company).permit(
      :english_name, :japanese_name, :address, :company_memo, :status, :deal_memo,
      business_category_ids: [],
      category_attributes: [:scac, :industry_id],
      users_attributes: [:id, :name, :role, :dept, :email, :phone, :_destroy, :password, :password_confirmation]
    )
  end

  def has_events
    @has_events = @company.participated_events.limit(1).present?
  end

  def set_attributes
    @business_categories = BusinessCategory.where.not(category: 0)
    @industries = Industry.order(:industry_name)
  end

  def find_company
    @company = Company.find(params[:id])
  end

  # ビューで使用するデータを事前に計算（SQLを避ける）
  def prepare_form_data
    # ビジネスカテゴリのマッピング（キャッシング用）
    @carrier_business_category_id = @business_categories.find { |bc| bc.category == "carrier" }&.id
    @other_business_category_id = @business_categories.find { |bc| bc.category == "other" }&.id

    # 既存データの取得（edit時用）
    if @company.persisted?
      @selected_category_ids = @company.category_ids
      
      # CARRIER情報
      @carrier_info = @company.carrier_company_business_category&.carrier
      
      # OTHER情報
      @other_info = @company.other_company_business_category
    else
      @selected_category_ids = []
      @carrier_info = nil
      @other_info = nil
    end
  end
end
