class CreateIndustries < ActiveRecord::Migration[7.2]
  def change
    create_table :industries do |t|
      t.string :industry_name, null: false
      t.integer :inumber
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :industries, :industry_name
    add_index :industries, :discarded_at
  end
end
