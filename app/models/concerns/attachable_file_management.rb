# frozen_string_literal: true
module AttachableFileManagement
  extend ActiveSupport::Concern

  included do
    validate :file_name_length
    validate :validate_email_file_extension

    before_validation :set_file_info, if: :file_attached?
  end

  def file_attached?
    file.attached?
  end

  # --- ファイル情報を設定 ---
  def set_file_info(file_attached_name = :file)
    attached = send(file_attached_name)
    return unless attached.attached?

    blob = attached.blob

    # ファイル名の設定
    self.file_name = blob.filename.to_s if file_name.blank?

    # ファイルタイプの設定
    self.file_type = blob.content_type if file_type.blank?

    # ファイルサイズの設定（バイト単位）
    self.file_size = blob.byte_size if file_size.blank?
  end

  # --- ファイル名の長さ制限 ---
  def file_name_length
    return unless file_name.present?

    if file_name.length > 255
      errors.add(:file_name, 'ファイル名は255文字以内で入力してください')
    end
  end

  # --- メールファイルの拡張子チェック ---
  def validate_email_file_extension(file_attached_name = :file)
    attached = send(file_attached_name)
    return unless attached.attached?

    filename = attached.blob.filename.to_s.downcase
    content_type = attached.blob.content_type

    if filename.end_with?('.eml', '.msg')
      allowed_email_types = [
        'message/rfc822',
        'application/vnd.ms-outlook',
        'application/octet-stream',
        'application/x-ole-storage',
        'text/plain'
      ]

      unless allowed_email_types.include?(content_type)
        errors.add(:file, "メールファイル（#{File.extname(filename)}）として認識できません")
      end
    end
  end
end
