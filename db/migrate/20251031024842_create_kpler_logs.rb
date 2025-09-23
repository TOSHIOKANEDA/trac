class CreateKplerLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :kpler_logs do |t|
      t.references :kpler, null: false, foreign_key: true
      t.integer :type
      t.string :status
      t.string :fail_reason
      t.string :error_description
      t.string :error_code
      t.timestamps
    end
  end
end
