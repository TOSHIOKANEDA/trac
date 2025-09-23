class CreateEventShipments < ActiveRecord::Migration[7.2]
  def change
    create_table :event_shipments do |t|
      t.references :event, null: false, foreign_key: true
      t.references :carrier, null: true
      t.integer :shipment
      t.integer :mode
      t.integer :term
      t.string :pol_code
      t.string :pod_code
      t.string :place_of_receipt
      t.string :port_of_loading
      t.string :port_of_discharge
      t.string :port_of_delivery
      t.string :pick_up
      t.string :delivery
      t.string :vessel
      t.string :voyage
      t.string :booking_no
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :event_shipments, :discarded_at
  end
end
