class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.references :forwarder, null: false, foreign_key: { to_table: :companies }
      # forwarder_id → companies.id を参照
      t.string :name, null: false
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.text :description
      t.text :remark
      t.datetime :discarded_at
      t.timestamps
    end

    add_index :favorites, :discarded_at
  end
end
