class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :authenticate_user!
  before_action :authorize_controller_action
  before_action :set_current_user
  before_action :configure_permitted_parameters, if: :devise_controller?

  private

  def set_current_user
    Current.user = current_user
  end

  def authorize_controller_action
    return if devise_controller? # Devise はスキップ

    # controller名とaction名をシンボルに変換
    ctrl = "#{controller_name}_controller".to_sym
    act  = action_name.to_sym

    # Ability で定義した権限をチェック
    authorize! act, ctrl
  end

  def configure_permitted_parameters
    # サインアップ時に追加カラムを許可
    devise_parameter_sanitizer.permit(:sign_up, keys: [:status, :delay_mail, :status_mail, :chat_mail, :delay_days])

    # アカウント更新時に追加カラムを許可
    devise_parameter_sanitizer.permit(:account_update, keys: [:status, :delay_mail, :status_mail, :chat_mail, :delay_days])
  end
end
