class CreateBusinessCategories < ActiveRecord::Migration[7.2]
  def change
    create_table :business_categories do |t|
      t.integer :category, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :business_categories, :category
    add_index :business_categories, :discarded_at
  end
end
