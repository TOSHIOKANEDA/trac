class CreateFinbalanceIncomes < ActiveRecord::Migration[7.2]
  def change
    create_table :finbalance_incomes do |t|
      t.references :finbalance, null: false, foreign_key: true
      t.references :finbalance_item, null: false, foreign_key: true
      t.references :company, null: false, foreign_key: true
      t.integer :amount, null: false
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :finbalance_incomes, :discarded_at
  end
end
