class CreateEventCompanies < ActiveRecord::Migration[7.2]
  def change
    create_table :event_companies do |t|
      t.integer :role
      t.references :event, null: false, foreign_key: true
      t.references :company, null: false, foreign_key: true
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :event_companies, :discarded_at
  end
end
