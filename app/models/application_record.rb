class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  include Auditable

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
