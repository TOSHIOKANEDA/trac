class CreateFinbalances < ActiveRecord::Migration[7.2]
  def change
    create_table :finbalances do |t|
      t.references :event, null: false, foreign_key: true
      t.references :finbalance_item, null: false, foreign_key: true
      t.integer :balance, default: 0
      t.integer :income, default: 0
      t.integer :cost, default: 0
      t.datetime :discarded_at
      # create_id / update_id → users.id
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :finbalances, :discarded_at
  end
end
