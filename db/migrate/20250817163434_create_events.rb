class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.references :forwarder, null: false, foreign_key: { to_table: :companies }
      t.references :user, null: true
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.string :id_string, null: false
      t.string :year, null: false
      t.string :mbl
      t.string :hbl
      t.datetime :soa
      t.boolean :charge
      t.text :description
      t.text :remark
      t.datetime :accounting_month
      t.datetime :discarded_at
      # Event は必ず Forwarder に属する
      t.timestamps
    end
    add_index :events, :id_string
    add_index :events, :year
    add_index :events, :discarded_at
    add_index :events, :mbl
    add_index :events, :hbl
    add_index :events, :accounting_month
  end
end
