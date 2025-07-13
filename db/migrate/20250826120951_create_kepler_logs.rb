class CreateKeplerLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :kepler_logs do |t|
      t.references :kepler, null: false, foreign_key: true
      t.string :response, null: false
      t.datetime :requested_at, null: false
      t.string :error
      t.string :requested_api, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :kepler_logs, :discarded_at
  end
end
