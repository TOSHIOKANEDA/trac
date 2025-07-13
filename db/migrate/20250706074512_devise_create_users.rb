# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.references :company, null: false, foreign_key: true
      t.string :email, null: false, default: ""
      t.string :name, null: false, default: ""
      t.string :phone
      t.string :dept
      t.integer :role, default: 1
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :last_login_date
      t.boolean :status, default: true
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.boolean :delay_mail, default: true
      t.boolean :chat_mail, default: true
      t.boolean :status_mail, default: true
      t.integer :delay_days, default: 0
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :users, :discarded_at
    add_index :users, :confirmed_at
    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
