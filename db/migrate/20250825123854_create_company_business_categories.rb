class CreateCompanyBusinessCategories < ActiveRecord::Migration[7.2]
  def change
    create_table :company_business_categories do |t|
      t.datetime :discarded_at
      t.references :company, null: false, foreign_key: true
      t.references :business_category, null: false, foreign_key: true
      t.timestamps
    end
    add_index :company_business_categories, :discarded_at
  end
end
