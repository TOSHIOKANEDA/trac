class CreateQuotationFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :quotation_files do |t|
      t.timestamps
    end
  end
end
