class ProfilesController < ApplicationController
  before_action :find_user, only: [:show, :edit]

  def index
    @q = User.joins(:company)
             .select("users.id, users.status, users.name, users.email, users.role, users.last_login_date, users.created_at, companies.japanese_name AS company_name")
             .ransack(params[:q])
    
    @users = @q.result
    @companies = Company.all
  end

  def edit
  end

  def show
    @show_password = current_user.id == @user.id
  end

  private

  def find_user
    @user = User.find(params[:id])
  end
end
