class EventFile < ApplicationRecord
  # アソシエーション
  belongs_to :event
  belongs_to :business_category
  belongs_to :creator, class_name: 'User', foreign_key: 'create_id'
  belongs_to :updater, class_name: 'User', foreign_key: 'update_id'
  
  # Active Storage
  has_one_attached :file

  before_validation :set_file_info, if: :file_attached?

  # 基本バリデーション
  validates :business_category_id, presence: true
  validates :event_id, presence: true
   
  # カスタムバリデーション
  validate :file_name_length
  validate :validate_email_file_extension

  include Discard::Model
  private

  def file_attached?
    file.attached?
  end

  def set_file_info
    return unless file.attached?
    
    blob = file.blob
    
    # ファイル名の設定
    self.file_name = blob.filename.to_s if file_name.blank?
    
    # ファイルタイプの設定
    self.file_type = blob.content_type if file_type.blank?
    
    # ファイルサイズの設定（バイト単位）
    self.file_size = blob.byte_size if file_size.blank?
  end

  # ファイル名の長さ制限
  def file_name_length
    if file_name.present? && file_name.length > 255
      errors.add(:file_name, 'ファイル名は255文字以内で入力してください')
    end
  end
  
  # メールファイルの拡張子チェック
  def validate_email_file_extension
    return unless file.attached?
    
    filename = file.blob.filename.to_s.downcase
    content_type = file.blob.content_type

    # .emlまたは.msgファイルの場合の特別な検証
    if filename.end_with?('.eml', '.msg')
      allowed_email_types = [
        'message/rfc822',
        'application/vnd.ms-outlook',
        'application/octet-stream',
        'application/x-ole-storage',
        'text/plain'  # .emlファイルはテキストとして認識される場合もある
      ]
      
      unless allowed_email_types.include?(content_type)
        errors.add(:file, "メールファイル（#{File.extname(filename)}）として認識できません")
      end
    end
  end
end
