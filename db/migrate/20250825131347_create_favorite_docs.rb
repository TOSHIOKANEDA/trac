class CreateFavoriteDocs < ActiveRecord::Migration[7.2]
  def change
    create_table :favorite_docs do |t|
      t.references :favorite, null: false, foreign_key: true
      t.boolean :invoice, default: true
      t.boolean :msds, default: false
      t.boolean :packing_list, default: true
      t.boolean :coo, default: false
      t.boolean :l_c, default: false
      t.boolean :van_photo, default: false
      t.boolean :van_repo, default: false
      t.boolean :quarantine, default: false
      t.boolean :slip, default: false
      t.boolean :s_i, default: false
      t.boolean :hbl_awb, default: false
      t.boolean :dg_declaration, default: false
      t.boolean :insurance, default: false
      t.boolean :booking_confirmation, default: false
      t.boolean :mbl, default: false
      t.boolean :freight_memo, default: false
      t.boolean :weight_cert, default: false
      t.boolean :export_permit, default: false
      t.boolean :import_permit, default: false
      t.boolean :dock_receipt, default: false
      t.boolean :house_arrival_notice, default: false
      t.boolean :master_arrival_notice, default: false
      t.boolean :pod, default: false
      t.datetime :discarded_at
      t.references :create, foreign_key: { to_table: :users }
      t.references :update, foreign_key: { to_table: :users }
      t.timestamps
    end
    add_index :favorite_docs, :discarded_at
  end
end
