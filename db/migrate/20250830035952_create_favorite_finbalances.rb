class CreateFavoriteFinbalances < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_finbalances do |t|
      t.references :favorite, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :client_pic_name
      t.string :subject
      t.text :remark
      t.date :due_date
      t.integer :income, default: 0
      t.integer :expense, default: 0
      t.integer :balance, default: 0
      t.integer :small_total, default: 0
      t.integer :comumption_tax_total, default: 0
      t.integer :total_amount, default: 0
      t.integer :tax_percent, default: 10
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :favorite_finbalances, :discarded_at
  end
end
