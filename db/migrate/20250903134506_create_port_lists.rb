class CreatePortLists < ActiveRecord::Migration[7.2]
  def change
    create_table :port_lists do |t|
      t.string :name, null: false
      t.string :port_code, null: false
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :port_lists, :discarded_at
  end
end
