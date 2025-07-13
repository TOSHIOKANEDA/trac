class CreateCompanies < ActiveRecord::Migration[7.2]
  def change
    create_table :companies do |t|
      t.string :japanese_name, null: false
      t.string :english_name, null: false
      t.string :address, null: false
      t.string :deal_memo
      t.string :company_memo
      t.boolean :status, default: true
      t.boolean :is_forwarder, default: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :companies, :discarded_at
  end
end
