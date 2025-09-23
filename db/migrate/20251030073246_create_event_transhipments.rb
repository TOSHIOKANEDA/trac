class CreateEventTranshipments < ActiveRecord::Migration[7.2]
  def change
    create_table :event_transhipments do |t|
      t.references :event_schedule, null: false, foreign_key: true
	    t.string :arrival_or_departure
      t.string :event_status
      t.string :event_date_time
      t.string :mode_of_transport
      t.string :voyage_number
      t.string :vessel_name
      t.string :port_unicode
      t.string :port_name
      t.string :location_action
      t.string :kpler_location_id
      t.string :kpler_vessel_id
      t.timestamps
    end
  end
end
