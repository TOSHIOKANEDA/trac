class CreateFavoriteFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_files do |t|
      t.references :business_category, null: false, foreign_key: true
      t.references :favorite, null: false, foreign_key: true
      t.references :create, null: false, foreign_key: { to_table: :users }
      t.references :update, null: false, foreign_key: { to_table: :users }
      t.string :file_name
      t.string :file_type
      t.integer :file_size
      t.string :verified_doc
      t.string :verified_name
      t.boolean :is_estimate, default: false
      t.boolean :is_verified, default: false
      t.boolean :shipper_view, default: false
      t.boolean :consignee_view, default: false
      t.boolean :custom_view, default: false
      t.boolean :agent_view, default: false
      t.datetime :discarded_at
      t.timestamps
    end

    add_index :favorite_files, :is_verified
    add_index :favorite_files, :is_estimate
    add_index :favorite_files, :discarded_at
    add_index :favorite_files, :shipper_view
    add_index :favorite_files, :consignee_view
    add_index :favorite_files, :custom_view
    add_index :favorite_files, :agent_view
  end
end
