class CreateEventFinbalanceAssemblies < ActiveRecord::Migration[7.2]
  def change
    create_table :event_finbalance_assemblies do |t|
      t.references :event_finbalance, null: false, foreign_key: true
      t.references :finbalance_item, null: false, foreign_key: true
      t.string :unit
      t.boolean :tax_flag, default: false
      t.string :currency, default: "JPY"
      t.decimal :exchange_rate, precision: 10, scale: 4, default: 1.0
      t.decimal :quantity, precision: 10, scale: 4, default: 0
      t.integer :purchase_unit_price, default: 0
      t.integer :purchase_amount, default: 0
      t.integer :sales_unit_price, default: 0
      t.integer :sales_amount, default: 0
      t.integer :gross_profit, default: 0
      t.decimal :gross_profit_rate, precision: 5, scale: 2, default: 0
      t.text :item_remark
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :event_finbalance_assemblies, :discarded_at
  end
end
