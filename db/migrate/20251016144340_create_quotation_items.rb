class CreateQuotationItems < ActiveRecord::Migration[7.2]
  def change
    create_table :quotation_items do |t|
      t.references :finbalance_item, foreign_key: true
      t.references :quotation, null: false, foreign_key: true
      t.integer :item_type
      t.string  :item_name_note
      t.boolean :tax_flag, default: false
      t.float :unit
      t.integer :section
      t.string  :currency
      t.string  :item_remark
      t.float :exchange_rate
      t.decimal :quantity
      t.decimal :purchase_unit_price
      t.decimal :purchase_amount, default: 0
      t.decimal :sales_unit_price
      t.decimal :sales_amount, default: 0
      t.decimal :gross_profit, default: 0
      t.decimal :gross_profit_rate, default: 0
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :quotation_items, :discarded_at
  end
end