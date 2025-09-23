class CreateChatUsers < ActiveRecord::Migration[7.2]
  def change
    create_table "chat_users", force: :cascade do |t|
      t.integer "chat_id", null: false
      t.integer "user_id", null: false
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
      t.index ["chat_id", "user_id"], unique: true
    end
    add_index :chat_users, :discarded_at
  end
end
