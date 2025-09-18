class CreateKplerHistories < ActiveRecord::Migration[7.2]
  def change
    create_table :kpler_histories do |t|
      t.references :kepler_log, null: false, foreign_key: true
      t.integer :category, null: false
      t.string :from, null: false
      t.string :to, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :kpler_histories, :discarded_at
  end
end
