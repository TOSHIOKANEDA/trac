class CreateFavoriteGoods < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_goods do |t|
      t.references :favorite, null: false, foreign_key: true
      t.string :pkgs
      t.string :type_of_pkg
      t.string :n_w
      t.string :g_w
      t.string :m3
      t.text :description
      t.text :remark
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.datetime :discarded_at
      t.timestamps
    end
    add_index :favorite_goods, :discarded_at
  end
end
