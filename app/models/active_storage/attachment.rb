class ActiveStorage::Attachment < ApplicationRecord
  self.table_name = "active_storage_attachments"
  belongs_to :record, polymorphic: true, inverse_of: :file_attachment
  belongs_to :blob, class_name: "ActiveStorage::Blob"

  scope :event_files, -> { where(record_type: "EventFile") }
  scope :favorite_files, -> { where(record_type: "FavoriteFile") }
end

# 用途
# ActiveStorage::Attachment.event_files
# ActiveStorage::Attachment.favorite_files
