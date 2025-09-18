class EventFilesController < ApplicationController
  before_action :set_event, only: [:index, :create]
  before_action :set_event_and_file, only: [:destroy, :update, :download]

  # GET /events/:event_id/event_files
  def index
    @event_files = @event.event_files.includes(:creator, :business_category, file_attachment: :blob)
    business_categories = BusinessCategory.all.index_by(&:category)
    event_doc = @event.event_doc
    @sections = [
      {
        id: 'shipperDocs',
        title: '荷主が提出する書類',
        icon: 'fas fa-user-tie',
        category: :shipper,
        category_id: business_categories['shipper'].id,
        docs: EventDoc.get_required_docs_by_category(event_doc, :shipper),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:shipper] })
      },
      {
        id: 'forwarderDocs',
        title: 'フォワーダーが提出する書類',
        icon: 'fas fa-shipping-fast',
        category: :forwarder,
        category_id: business_categories['forwarder'].id,
        docs: EventDoc.get_required_docs_by_category(event_doc, :forwarder),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:forwarder] })
      },
      {
        id: 'customDocs',
        title: '通関業者が提出する書類',
        icon: 'fas fa-file-contract',
        category: :custom,
        category_id: business_categories['custom'].id,
        docs: EventDoc.get_required_docs_by_category(event_doc, :custom),
        files: @event_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:custom] })
      }
    ]
  end

  # POST /events/:event_id/event_files
  def create
    if params[:event_file][:file].blank?
      redirect_to event_event_files_path(@event), 
                  alert: 'ファイルを選択してください。'
      return
    end

    @event_file = @event.event_files.build(event_file_params)
    @event_file.create_id = current_user.id
    @event_file.update_id = current_user.id
    # view権限のデフォルト値を設定
    @event_file.shipper_view = false
    @event_file.consignee_view = false
    @event_file.custom_view = false
    @event_file.agent_view = false

    if @event_file.save
      redirect_to event_event_files_path(@event), 
                  notice: 'ファイルがアップロードされました。'
    else
      redirect_to event_event_files_path(@event), 
                  alert: "エラー: #{@event_file.errors.full_messages.join(', ')}"
    end
  end
  
  # DELETE /events/:event_id/event_files/:id
  def destroy
    @event_file.discard
    
    redirect_to event_event_files_path(@event), 
                notice: 'ファイルが削除されました。'
  end

  # PATCH/PUT /events/:event_id/event_files/:id
  def update
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
      :file_type,
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
