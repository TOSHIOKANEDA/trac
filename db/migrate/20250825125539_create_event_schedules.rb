class CreateEventSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :event_schedules do |t|
      t.references :event, null: false, foreign_key: true
      t.datetime :container_pick_up
      t.datetime :vanning_date
      t.datetime :cut_off_date
      t.datetime :pol_etd
      t.datetime :pol_atd
      t.datetime :pod_eta
      t.datetime :pod_ata
      t.datetime :delivery_date
      t.datetime :kpler_updated_at
      t.integer :transportation_status
      t.datetime :discarded_at
      # create_id / update_id → users.id
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :event_schedules, :discarded_at
  end
end
