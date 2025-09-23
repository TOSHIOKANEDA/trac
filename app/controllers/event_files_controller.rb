class EventFilesController < ApplicationController
  before_action :set_event, only: [:index, :create]
  before_action :set_event_and_file, only: [:destroy, :update, :download]

  FILE_DOC_TO_STATUS = {
    "van_photo" => 2,
    "van_repo" => 2,
    "quarantine" => 3,
    "export_permit" => 4,
    "import_permit" => 4
  }.freeze

  # GET /events/:event_id/event_files
  def index
    @event_files = @event.event_files.includes(:creator, :business_category, :file_blob)
    business_categories = BusinessCategory.all.index_by(&:category)
    @event_doc = @event.event_doc
    @event_files_count = @event_files.present? ? EventFile.verified_count(@event_files) : 0
    @sections = [
      {
        id: 'shipperDocs',
        title: '荷主が提出する書類',
        icon: 'fas fa-user-tie',
        category: :shipper,
        category_id: business_categories['shipper'].id,
        docs: EventDoc.get_required_docs_by_category(@event_doc, :shipper),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:shipper] })
      },
      {
        id: 'forwarderDocs',
        title: 'フォワーダーが提出する書類',
        icon: 'fas fa-shipping-fast',
        category: :forwarder,
        category_id: business_categories['forwarder'].id,
        docs: EventDoc.get_required_docs_by_category(@event_doc, :forwarder),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:forwarder] })
      },
      {
        id: 'customDocs',
        title: '通関業者が提出する書類',
        icon: 'fas fa-file-contract',
        category: :custom,
        category_id: business_categories['custom'].id,
        docs: EventDoc.get_required_docs_by_category(@event_doc, :custom),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:custom] })
      }
    ]
    # JSONレスポンス対応を追加
    respond_to do |format|
      format.html # index.html.erb
      format.json { 
        render json: { 
          success: true,
          event_files: @event_files.as_json(include: [:creator, :business_category]),
          sections: @sections.map { |section| 
            {
              id: section[:id],
              title: section[:title],
              category_id: section[:category_id],
              files_count: section[:files].count,
              docs_count: section[:docs].length
            }
          }
        } 
      }
    end
  end

  # POST /events/:event_id/event_files
  def create
    if params[:event_file][:file].blank?
      respond_to do |format|
        format.html { 
          redirect_to event_event_files_path(@event), 
                      alert: 'ファイルを選択してください。'
        }
        format.json { 
          render json: { error: 'ファイルを選択してください。' }, 
                 status: :unprocessable_entity 
        }
      end
      return
    end

    @event_file = @event.event_files.build(event_file_params)
    @event_file.create_id = current_user.id
    @event_file.update_id = current_user.id

    respond_to do |format|
      if @event_file.save
        format.html { 
          redirect_to event_event_files_path(@event), 
                      notice: 'ファイルがアップロードされました。'
        }
        format.json { 
          render json: { 
            success: true, 
            file: {
              id: @event_file.id,
              name: @event_file.file_name,
              size: @event_file.file_size
            }
          }, status: :ok
        }
      else
        format.html { 
          redirect_to event_event_files_path(@event), 
                      alert: "エラー: #{@event_file.errors.full_messages.join(', ')}"
        }
        format.json { 
          render json: { 
            error: @event_file.errors.full_messages.join(', ') 
          }, status: :unprocessable_entity
        }
      end
    end
  end
  
  # DELETE /events/:event_id/event_files/:id
  def destroy
    @event_file.discard_and_remove_attached
    
    redirect_to event_event_files_path(@event), 
                notice: 'ファイルが削除されました。'
  end

  # PATCH/PUT /events/:event_id/event_files/:id
  def update
    if event_file_params_for_update[:verified_doc].present?
      @event_file.is_verified = true
      @event_file.verified_name = current_user.name
      @event_file.is_estimate = event_file_params_for_update[:verified_doc] == "quotation"
    else
      @event_file.is_verified = false
      @event_file.verified_name = nil
    end
    if @event_file.update(event_file_params_for_update)
      redirect_to event_event_files_path(@event), 
                  notice: 'ファイル情報が更新されました。'
    else
      redirect_to event_event_files_path(@event), 
                  alert: "エラー: #{@event_file.errors.full_messages.join(', ')}"
    end
  end

  # GET /events/:event_id/event_files/:id/download
  def download
    # 権限チェック（後で実装予定）
    # authorize_download_access(@event_file)
    
    if @event_file.file.attached?
      redirect_to @event_file.file, allow_other_host: true
    else
      redirect_back(fallback_location: event_event_files_path(@event), 
                    alert: 'ファイルが見つかりません。')
    end
  end
  
  private

  def update_event_step
    return unless @event_file&.persisted? # update が成功した場合のみ

    status = FILE_DOC_TO_STATUS[@event_file.verified_doc]
    return unless status

    step = EventStep.find_or_initialize_by(event_id: @event.id, status: status)
    step.status_date = DateTime.current
    step.save
  end

  def clean_orphan_event_steps
    return unless @event_file&.persisted?

    # Event が持つファイルタイプ一覧
    existing_file_types = @event.event_files.pluck(:verified_doc)

    # Event に存在するステップをまとめて取得（未削除のみ）
    event_steps = EventStep.where(event_id: @event.id, status: FILE_DOC_TO_STATUS.values)

    # 削除対象のステップを判定
    obsolete_steps = event_steps.select do |step|
      corresponding_file_types = FILE_DOC_TO_STATUS.select { |_, s| s == step.status }.keys
      (existing_file_types & corresponding_file_types).empty?
    end

    # 論理削除
    obsolete_steps.each(&:discard)
  end

  def set_event
    @event = Event.find(params[:event_id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: 'イベントが見つかりません。'
  end
  
  def set_event_and_file
    @event = Event.find(params[:event_id])
    @event_file = @event.event_files.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: 'ファイルまたはイベントが見つかりません。'
  end
  
  def event_file_params
    params.require(:event_file).permit(
      :business_category_id,
      :shipper_view,
      :consignee_view,
      :custom_view,
      :agent_view,
      :is_estimate,
      :is_verified,
      :verified_name,
      :file
    )
  end

  def event_file_params_for_update
    params.require(:event_file).permit(
      :verified_doc,
      :shipper_view,
      :consignee_view,
      :custom_view,
      :agent_view,
      :is_estimate,
      :is_verified,
      :verified_name
    )
  end
end
