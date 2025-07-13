class CreateFinbalanceItems < ActiveRecord::Migration[7.2]
  def change
    create_table :finbalance_items do |t|
      t.references :forwarder, null: false, foreign_key: { to_table: :companies }
      t.string :item_name, null: false
      t.datetime :discarded_at
      # create_id / update_id → users.id
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :finbalance_items, :discarded_at
  end
end
