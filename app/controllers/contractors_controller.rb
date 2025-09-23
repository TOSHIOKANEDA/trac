class ContractorsController < ApplicationController
  before_action :set_attributes, only: [:new, :edit, :update]
  before_action :find_company, only: [:destroy, :edit, :update]
  before_action :has_events, only: [:destroy, :edit]

  def index
    @companies = Company.with_categories(current_user.company.id)
  end

  def new
    @company = Company.new
    @company.users.build
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
    @company = Company.new(company_params.except(:category_ids))
    @company.users.each do |user|
      user.password = "password"
    end

    if @company.save
      # 保存後にカテゴリを設定
      forwarder_id = current_user.company.id
      if company_params[:category_ids]
        @company.send(:create_business_category, company_params[:category_ids], forwarder_id)
      end

      redirect_to contractors_path, notice: '取引先が正常に作成されました。'
    else
      @company.users.build if @company.users.empty?
      set_attributes
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
  end

  def update
    category_ids = params[:company].delete(:business_category_ids)
    forwarder_id = current_user.company.id
    if @company.update(company_params)
        @company.create_business_category(category_ids, forwarder_id) if category_ids.present?
        redirect_to edit_contractor_path(@company.id), notice: '更新しました'
    else
      render :edit
    end
  end

  private

  def company_params
    params.require(:company).permit(
      :english_name, :japanese_name, :address, :company_memo, :status, :deal_memo,
      business_category_ids: [],
      users_attributes: [:id, :name, :role, :dept, :email, :phone, :_destroy, :password, :password_confirmation]
    )
  end

  def has_events
    @has_events = @company.participated_events.limit(1).present?
  end

  def set_attributes
    @business_categories = BusinessCategory.where.not(category: 0)
  end

  def find_company
    @company = Company.find(params[:id])
  end
end
