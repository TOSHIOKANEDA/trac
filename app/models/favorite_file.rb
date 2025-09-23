class FavoriteFile < ApplicationRecord
  include Discard::Model
  include AttachableFileCleanup
  include AttachableFileManagement

  belongs_to :business_category
  belongs_to :creator, class_name: 'User', foreign_key: 'create_id'
  belongs_to :updater, class_name: 'User', foreign_key: 'update_id'

  # Active Storage
  has_one_attached :file, service: :local_favorite

  before_validation :set_file_info, if: :file_attached?

  # 基本バリデーション
  validates :business_category_id, presence: true
  validates :favorite_id, presence: true
   
  # カスタムバリデーション
  validate :file_name_length
  validate :validate_email_file_extension
  default_scope -> { kept }

  scope :verified_count, ->(favorite_files) {
    if favorite_files.blank?
      0 # 空のRelationを返す
    else
      favorite_files.where(is_verified: true).count
    end
  }
end
