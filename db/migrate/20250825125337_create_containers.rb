class CreateContainers < ActiveRecord::Migration[7.2]
  def change
    create_table :containers do |t|
      t.references :event, null: false, foreign_key: true
      t.string :cntr_num
      t.string :cntr_type
      t.string :cntr_size
      t.string :cntr_seal
      t.string :cntr_remark
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :containers, :discarded_at
  end
end
