require "sidekiq/web"

Rails.application.routes.draw do
  devise_for :users

  resources :events do
    resources :messages, only: :create
    member do
      delete :purge_file
    end
    collection do
      get "list"
      get "expense_list"
      get "expense_new"
    end
  end

  authenticated :user do
    root "events#index", as: :authenticated_root
  end

  root to: redirect("/users/sign_in")
  mount Sidekiq::Web => "/sidekiq" if Rails.env.development?
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
end
