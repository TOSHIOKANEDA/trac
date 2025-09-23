class CreateFavoriteFinbalances < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_finbalances do |t|
      t.references :favorite, null: false, foreign_key: true
      t.integer :balance, default: 0
      t.integer :income, default: 0
      t.integer :cost, default: 0
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :favorite_finbalances, :discarded_at
  end
end
