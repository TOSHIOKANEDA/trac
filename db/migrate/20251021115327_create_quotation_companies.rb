class CreateQuotationCompanies < ActiveRecord::Migration[7.2]
  def change
    create_table :quotation_companies do |t|
      t.references :company, null: false, foreign_key: true
      t.references :quotation, null: false, foreign_key: true
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :quotation_companies, :discarded_at
  end
end
