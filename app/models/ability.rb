class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user
    # Forwarder admin
    if user.company.is_forwarder? && user.admin?
      can :manage, :all
    else
      # Forwarder以外にはadmin権限を付与しない
      case user.role
      when "editor"
        can [:index, :show, :edit, :update, :list], :events_controller
        can [:manage], :event_files_controller
      when "viewer"
        can [:index, :show, :list], :events_controller
        can [:index, :show], :event_files_controller
      end
    end

    # 自分自身のユーザー情報は編集可能
    can [:read, :update], User, id: user.id
  end
end
