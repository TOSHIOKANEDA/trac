class CreateQuotations < ActiveRecord::Migration[7.2]
  def change
    create_table :quotations do |t|
      t.references :forwarder, null: false, foreign_key: { to_table: :companies }
      t.references :client, null: false, foreign_key: { to_table: :companies }
      t.references :user, null: false, foreign_key: true
      t.string :client_pic_name
      t.string  :place_of_receipt
      t.string  :port_of_loading
      t.string  :port_of_discharge
      t.string  :port_of_delivery
      t.integer :tax_percent
      t.string  :carrier
      t.datetime :issue_at
      t.string  :valid_at
      t.integer :shipment
      t.integer :mode
      t.integer :term
      t.string  :cargo
      t.integer :total_amount
      t.datetime :discarded_at
      t.string  :remark
      t.string  :condition
      t.boolean :issued_in_english, default: false
      t.boolean :issued_by_foreign_currency, default: false
      t.boolean :is_air, default: false
      t.string :currency
      t.float :exchange_rate
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :quotations, :discarded_at
  end
end
