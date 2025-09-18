# config/initializers/audited.rb
Audited.config do |config|
  config.current_user_method = :current_user
end
