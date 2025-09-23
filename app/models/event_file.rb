class EventFile < ApplicationRecord
  include AttachableFileCleanup
  include Discard::Model
  # アソシエーション
  belongs_to :event
  belongs_to :business_category
  belongs_to :creator, class_name: 'User', foreign_key: 'create_id'
  belongs_to :updater, class_name: 'User', foreign_key: 'update_id'

  # Active Storage
  has_one_attached :file, service: :local_event

  # 基本バリデーション
  validates :business_category_id, presence: true
  validates :event_id, presence: true

  default_scope -> { kept }
  after_update :sync_event_steps
  after_discard :sync_event_steps
  after_update :sync_event_doc
  after_discard :sync_event_doc, if: :event_doc_completed?

  FILE_DOC_TO_STATUS = {
    "van_photo" => 2,
    "van_repo" => 2,
    "quarantine" => 3,
    "export_permit" => 4,
    "import_permit" => 4
  }.freeze

  scope :verified_count, ->(event_files) {
    if event_files.blank?
      0 # 空のRelationを返す
    else
      event_files.where(is_verified: true).count
    end
  }

  private

  def event_doc_completed?
    event.event_doc&.completed?
  end

  def sync_event_steps
    # --- 現在のファイルに対応するステップを作成/更新 ---
    status = FILE_DOC_TO_STATUS[verified_doc]
    if status
      @current_step = EventStep.find_or_initialize_by(event_id: event_id, status: status)
      @current_step.status_date = DateTime.current
      @current_step.save if @current_step.new_record?
    end

    # --- 不要なステップを削除 ---
    # 1. 未削除の EventFile の verified_doc を取得
    existing_file_types = event.event_files.pluck(:verified_doc) # ["van_photo", "quarantine"]

    # 2. 対応するステータスを抽出
    existing_statuses = FILE_DOC_TO_STATUS.slice(*existing_file_types).values # [2,3]

    # 3. obsolete_steps を event_steps から作る
    obsolete_steps = EventStep
      .where(event_id: event.id, status: FILE_DOC_TO_STATUS.values) # 対象ステータス全体 [2,3,4]
      .where.not(status: existing_statuses)                          # 存在するファイルに対応するステータスは除外
      .where.not(id: @current_step&.id)                              # 作成したステップは除外

    obsolete_steps.each(&:discard)
  end

  def sync_event_doc
    is_completed = event.event_doc.true_count == EventFile.verified_count(event.event_files)
    event_doc = event.event_doc
    event_doc.completed = is_completed
    event_doc.save
  end
end
