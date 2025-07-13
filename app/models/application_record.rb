class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  include Stampable  # Stampable 内で create_id / update_id チェック済み

  def self.inherited(subclass)
    super
    return unless subclass.table_exists?

    # discard 用
    if subclass.column_names.include?("discarded_at")
      subclass.discard if subclass.respond_to?(:discard)
    end
  rescue ActiveRecord::StatementInvalid
    # マイグレーション中は無視
  end
end
