Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  resources :systems
  resources :finbalances
  resources :profiles
  resources :contractors
  resources :event_files
  resources :favorites

  resources :events do
    collection do
      get "list"
    end
    resources :chats, only: [:show] do
      resources :messages, only: [:create]
    end
  end

  authenticated :user do
    root "events#index", as: :authenticated_root
  end

  root to: redirect("/users/sign_in")
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
  mount ActionCable.server => '/cable'
end
