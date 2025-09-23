class FavoriteFilesController < ApplicationController
  before_action :set_favorite, only: [:index, :create]
  before_action :set_favorite_and_file, only: [:destroy, :update, :download]

  def index
    @favorite_files = @favorite.favorite_files.includes(:creator, :business_category, :file_blob)
    business_categories = BusinessCategory.all.index_by(&:category)
    @favorite_doc = @favorite.favorite_doc
    @favorite_files_count = @favorite_files.present? ? FavoriteFile.verified_count(@favorite_files) : 0
    @sections = [
      {
        id: 'shipperDocs',
        title: '荷主が提出する書類',
        icon: 'fas fa-user-tie',
        category: :shipper,
        category_id: business_categories['shipper'].id,
        docs: FavoriteDoc.get_required_docs_by_category(@favorite_doc, :shipper),
        files: @favorite_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:shipper] })
      },
      {
        id: 'forwarderDocs',
        title: 'フォワーダーが提出する書類',
        icon: 'fas fa-shipping-fast',
        category: :forwarder,
        category_id: business_categories['forwarder'].id,
        docs: FavoriteDoc.get_required_docs_by_category(@favorite_doc, :forwarder),
        files: @favorite_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:forwarder] })
      },
      {
        id: 'customDocs',
        title: '通関業者が提出する書類',
        icon: 'fas fa-file-contract',
        category: :custom,
        category_id: business_categories['custom'].id,
        docs: FavoriteDoc.get_required_docs_by_category(@favorite_doc, :custom),
        files: @favorite_files.joins(:business_category).where(business_categories: { category: BusinessCategory.categories[:custom] })
      }
    ]
    # JSONレスポンス対応を追加
    respond_to do |format|
      format.html # index.html.erb
      format.json { 
        render json: { 
          success: true,
          favorite_files: @favorite_files.as_json(include: [:creator, :business_category]),
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

  def create
    if params[:favorite_file][:file].blank?
      respond_to do |format|
        format.html { 
          redirect_to favorite_favorite_files_path(@favorite), 
                      alert: 'ファイルを選択してください。'
        }
        format.json { 
          render json: { error: 'ファイルを選択してください。' }, 
                 status: :unprocessable_entity 
        }
      end
      return
    end

    @favorite_file = @favorite.favorite_files.build(favorite_file_params)
    @favorite_file.create_id = current_user.id
    @favorite_file.update_id = current_user.id
    uploaded = params[:event_file][:file]
    @favorite_file.file_name = uploaded.original_filename
    @favorite_file.file_size = uploaded.size

    respond_to do |format|
      if @favorite_file.save
        format.html { 
          redirect_to favorite_favorite_files_path(@favorite), 
                      notice: 'ファイルがアップロードされました。'
        }
        format.json { 
          render json: { 
            success: true, 
            file: {
              id: @favorite_file.id,
              name: @favorite_file.file_name,
              size: @favorite_file.file_size
            }
          }, status: :ok
        }
      else
        format.html { 
          redirect_to favorite_favorite_files_path(@favorite), 
                      alert: "エラー: #{@favorite_file.errors.full_messages.join(', ')}"
        }
        format.json { 
          render json: { 
            error: @favorite_file.errors.full_messages.join(', ') 
          }, status: :unprocessable_entity
        }
      end
    end
  end
  
  def destroy
    @favorite_file.discard_and_remove_attached
    
    redirect_to favorite_favorite_files_path(@favorite), 
                notice: 'ファイルが削除されました。'
  end

  def update
    if favorite_file_params_for_update[:verified_doc].present?
      @favorite_file.is_verified = true
      @favorite_file.verified_name = current_user.name
      @favorite_file.is_estimate = favorite_file_params_for_update[:verified_doc] == "quotation"
    else
      @favorite_file.is_verified = false
      @favorite_file.verified_name = nil
    end
    if @favorite_file.update(favorite_file_params_for_update)
      redirect_to favorite_favorite_files_path(@favorite), 
                  notice: 'ファイル情報が更新されました。'
    else
      redirect_to favorite_favorite_files_path(@favorite), 
                  alert: "エラー: #{@favorite_file.errors.full_messages.join(', ')}"
    end
  end

  def download
    if @favorite_file.file.attached?
      redirect_to @favorite_file.file, allow_other_host: true
    else
      redirect_back(fallback_location: favorite_favorite_files_path(@favorite), 
                    alert: 'ファイルが見つかりません。')
    end
  end
  
  private

  def set_favorite
    @favorite = Favorite.find(params[:favorite_id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: 'お気に入りが見つかりません。'
  end
  
  def set_favorite_and_file
    @favorite = Favorite.find(params[:favorite_id])
    @favorite_file = @favorite.favorite_files.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path, alert: 'ファイルまたはイベントが見つかりません。'
  end
  
  def favorite_file_params
    params.require(:favorite_file).permit(
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

  def favorite_file_params_for_update
    params.require(:favorite_file).permit(
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
