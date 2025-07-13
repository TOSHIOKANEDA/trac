class CreateKplers < ActiveRecord::Migration[7.2]
  def change
    create_table :kplers do |t|
      t.references :event, null: false, foreign_key: true
      t.string :scac, null: false
      t.string :reference_number, null: false
      t.boolean :is_created, default: false
      t.integer :tracking_request_id, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :kplers, :discarded_at
    add_index :kplers, :is_created
    add_index :kplers, :tracking_request_id
  end
end
