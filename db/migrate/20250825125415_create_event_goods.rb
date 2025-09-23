class CreateEventGoods < ActiveRecord::Migration[7.2]
  def change
    create_table :event_goods do |t|
      t.references :event, null: false, foreign_key: true
      t.string :pkg
      t.string :type_of_pkg
      t.string :n_w
      t.string :g_w
      t.string :three_m
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :event_goods, :discarded_at
  end
end
