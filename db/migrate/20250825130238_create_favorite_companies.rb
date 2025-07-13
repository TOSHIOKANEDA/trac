class CreateFavoriteCompanies < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_companies do |t|
      # favorite_id → favorites.id
      t.references :favorite, null: false, foreign_key: true

      # company_id → companies.id
      t.references :company, null: false, foreign_key: true

      t.integer :role, null: false
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :favorite_companies, :discarded_at
  end
end
