class CreateKplerMilestoneVessels < ActiveRecord::Migration[7.2]
  def change
    create_table :kpler_milestone_vessels do |t|
      t.references :kpler_milestone_transportation, null: false, foreign_key: true
      t.string :kpler_vessel_id
      t.string :voyage_number
      t.string :name
      t.timestamps
    end
  end
end
