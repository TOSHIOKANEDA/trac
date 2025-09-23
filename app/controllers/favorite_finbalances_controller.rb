class FavoriteFinbalancesController < ApplicationController
  before_action :find_favorite
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

  def index
    @favorite_finbalances = Favorite.with_favorite_finbalances(current_user.company.id)
                              .where(favorites: { id: @favorite.id })
                              .select(event_list_columns)
                              .group('favorite_finbalance_id')
  end

  private

  def event_list_columns
    [
      "favorites.id",
      "COALESCE(favorite_finbalances.subject, '') AS subject",
      "COALESCE(favorite_finbalances.expense, 0) AS expense",
      "COALESCE(favorite_finbalances.income, 0) AS income",
      "COALESCE(favorite_finbalances.balance, 0) AS balance",
      "COALESCE(favorite_finbalances.small_total, 0) AS small_total",
      "COALESCE(favorite_finbalances.comumption_tax_total, 0) AS comumption_tax_total",
      "COALESCE(favorite_finbalances.total_amount, 0) AS total_amount",
      "COALESCE(clients.english_name, '') AS client",
      "COALESCE(shippers.english_name, '') AS shipper",
      "COALESCE(consignees.english_name, '') AS consignee",
      "COALESCE(favorite_finbalances.id, '') AS favorite_finbalance_id"
    ]
  end

  def find_favorite
    @favorite = Favorite.find(params[:favorite_id])
  end

  def set_attributes
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
