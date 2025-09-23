Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  resources :systems
  resources :finbalances
  resources :profiles
  resources :contractors
  resources :favorites, except: [:show] do
    collection do
      post "paste"
    end
    resources :favorite_files do
      member do
        get :download
      end
    end
    collection do
      post "search"
    end
  end
  resources :favorite_finbalances

  resources :quotations do
    collection do
      post "search"
    end
    member do
      post :copy
    end
  end

  resources :events do
    resources :event_files do
      member do
        get :download
      end
    end
    collection do
      post "paste"
      match "list", via: [:get, :post]
    end
    resources :chats, only: [:show, :update] do
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
