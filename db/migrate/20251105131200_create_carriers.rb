class CreateCarriers < ActiveRecord::Migration[7.2]
  def change
    create_table :carriers do |t|
      t.references :company_business_category, null: false, foreign_key: true
      t.string :scac, null: false
      t.datetime :discarded_at
      t.boolean :is_air, default: false
      t.timestamps
    end

    add_index :carriers, :discarded_at
    add_index :carriers, :scac
    add_index :carriers, :is_air
  end
end
