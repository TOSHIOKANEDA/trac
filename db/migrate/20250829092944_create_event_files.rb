class CreateEventFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :event_files do |t|
      # event_id → events.id
      t.references :business_category, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.references :create, null: false, foreign_key: { to_table: :users }
      t.references :update, null: false, foreign_key: { to_table: :users }
      t.string :file_name
      t.string :file_type
      t.integer :file_size
      t.string :verified_name
      t.boolean :is_estimate, default: false
      t.boolean :is_verified, default: false
      t.boolean :shipper_view, null: false
      t.boolean :consignee_view, null: false
      t.boolean :custom_view, null: false
      t.boolean :agent_view, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :event_files, :is_verified
    add_index :event_files, :is_estimate
    add_index :event_files, :discarded_at
    add_index :event_files, :shipper_view
    add_index :event_files, :consignee_view
    add_index :event_files, :custom_view
    add_index :event_files, :agent_view
  end
end
