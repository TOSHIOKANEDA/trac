# frozen_string_literal: true
module AttachableFileCleanup
  extend ActiveSupport::Concern

  # file_attached_name: has_one_attached で定義した名前（デフォルトは :file）
  def discard_and_remove_attached(file_attached_name = :file)
    attached = send(file_attached_name)
    return unless attached.attached?

    # --- 物理ファイル削除 ---
    service = attached.blob.service
    key     = attached.blob.key
    path    = service.send(:path_for, key)

    FileUtils.rm_f(path) if File.exist?(path)
    attached.attachment.destroy
    attached.blob.destroy

    # --- 空フォルダを遡って削除 ---
    dir = File.dirname(path)
    while dir != service.root && Dir.empty?(dir)
      Dir.rmdir(dir)
      dir = File.dirname(dir)
    end

    # --- 論理削除 ---
    discard
  end
end
