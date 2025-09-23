class CreateFavoriteFinbalanceAssemblies < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_finbalance_assemblies do |t|
      t.references :favorite_finbalance, null: false, foreign_key: true
      t.references :finbalance_item, null: false, foreign_key: true
      t.integer :cost_amount, null: false
      t.integer :income_amount, null: false
      t.integer :balance_amount, null: false
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :favorite_finbalance_assemblies, :discarded_at
  end
end
