class FavoriteFinbalancesController < ApplicationController
  before_action :set_attributes, only: [:new, :edit, :update, :create]
  before_action :set_favorite_finbalance, only: [:edit, :update]
  before_action :sanitize_amounts, only: [:create, :update]

  def new
    @favorite_company = FavoriteCompany.shipper_and_consignee(@favorite).first
    @favorite_finbalance = FavoriteFinbalance.new(favorite_id: @favorite.id)
    @favorite_finbalance.favorite_finbalance_assemblies.build
  end

  def edit
    @favorite_finbalance.favorite_finbalance_assemblies.build if @favorite_finbalance&.favorite_finbalance_assemblies.blank?
  end

  def update
    if @favorite_finbalance.update(finbalance_params)
      redirect_to edit_favorite_finbalance_path(@favorite_finbalance, favorite_id: @favorite_finbalance.favorite_id), notice: "更新しました"
    else
      flash.now[:error] = @favorite_finbalance.errors.full_messages.join(", ")
      render :edit
    end
  end

  def create
    @favorite_finbalance = FavoriteFinbalance.new(favorite_finbalance_params)
    if @favorite_finbalance.save
      redirect_to edit_favorite_finbalance_path(@favorite_finbalance, favorite_id: @favorite_finbalance.favorite_id), notice: "登録しました"
    else
      flash.now[:error] = @@favorite_finbalance.errors.full_messages.join(", ")
      render :edit
    end
  end

  private

  def set_attributes
    @favorite = Favorite.includes(:favorite_shipment, :favorite_files).find(params[:favorite_id] || favorite_finbalance_params[:favorite_id])
    @finbalance_items = current_user.company.finbalance_items
    @estimated_files = @favorite.favorite_files.where(is_estimate: true)
  end

  def set_favorite_finbalance
    @favorite_finbalance = FavoriteFinbalance.find(params[:id])
  end

  def favorite_finbalance_params
    params.require(:favorite_finbalance).permit(
      :favorite_id, :balance, :income, :cost,
      favorite_finbalance_assemblies_attributes: [:id, :finbalance_item_id, :income_amount, :cost_amount, :balance_amount, :_destroy]
    )
  end
end
