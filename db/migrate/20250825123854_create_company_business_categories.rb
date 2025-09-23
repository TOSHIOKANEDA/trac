class CreateCompanyBusinessCategories < ActiveRecord::Migration[7.2]
  def change
    create_table :company_business_categories do |t|
      t.datetime :discarded_at
      t.references :industry, foreign_key: { name: "fk_company_business_categories_industry" }
      t.references :forwarder, null: false, foreign_key: { to_table: :companies, name: "fk_company_business_categories_forwarder" }
      t.references :company, null: false, foreign_key: { name: "fk_company_business_categories_company" }
      t.references :business_category, null: false, foreign_key: { name: "fk_company_business_categories_business_category" }

      t.timestamps
    end

    add_index :company_business_categories, :discarded_at
  end
end
