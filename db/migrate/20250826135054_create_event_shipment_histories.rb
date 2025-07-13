class CreateEventShipmentHistories < ActiveRecord::Migration[7.2]
  def change
    create_table :event_shipment_histories do |t|
      t.references :event, null: false, foreign_key: true
      t.integer :sequence_num, null: false
      t.string :vessel, null: false
      t.string :voyage, null: false
      t.string :port, null: false
      t.integer :local_time_offset, null: false
      t.datetime :arrival_date, null: false
      t.datetime :departure_date, null: false
      t.integer :status, null: false
      t.boolean :is_aborted, default: false
      t.datetime :kpler_aborted_at
      t.datetime :kpler_updated_at, null: false
      t.references :update, foreign_key: { to_table: :users }
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :event_shipment_histories, :discarded_at
  end
end
