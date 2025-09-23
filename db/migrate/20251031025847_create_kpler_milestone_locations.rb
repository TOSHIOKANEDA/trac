class CreateKplerMilestoneLocations < ActiveRecord::Migration[7.2]
  def change
    create_table :kpler_milestone_locations do |t|
      t.references :kpler_milestone_transportation, null: false, foreign_key: true
      t.string :kpler_location_id
      t.string :port_unicode
      t.string :name
      t.timestamps
    end
  end
end
