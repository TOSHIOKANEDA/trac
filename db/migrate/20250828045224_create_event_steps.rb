class CreateEventSteps < ActiveRecord::Migration[7.2]
  def change
    create_table :event_steps do |t|
      t.integer :status, null: false
      t.datetime :status_date, null: false
      t.references :event, null: false, foreign_key: true
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :event_steps, :discarded_at
  end
end
