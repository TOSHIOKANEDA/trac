// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import Rails from "@rails/ujs"
import "@hotwired/turbo-rails"
import "controllers"
import jquery from "jquery";
window.$ = jquery; // グローバルに jQuery を設定
window.jQuery = jquery;
Rails.start()
