class ChatsController < ApplicationController
  before_action :set_event
  before_action :set_chat

  def update    
    begin
      ActiveRecord::Base.transaction do
        # ChatUserモデルでサニタイズ
        safe_params = chat_params
        if safe_params[:chat_users_attributes]
          sanitized_chat_users = ChatUser.sanitize_attributes_for_chat(@chat, safe_params[:chat_users_attributes])
          safe_params = safe_params.merge(chat_users_attributes: sanitized_chat_users)
        end
        
        if @chat.update(safe_params)
          respond_to do |format|
            format.json { 
              render json: { 
                status: 'success', 
                message: "「#{@chat.name}」チャットを更新しました",
                chat: { id: @chat.id, name: @chat.name }
              } 
            }
          end
        else
          respond_to do |format|
            format.json { 
              render json: { 
                status: 'error', 
                errors: @chat.errors.full_messages 
              } 
            }
          end
        end
      end
    rescue ActiveRecord::RecordNotFound => e
      respond_to do |format|
        format.json { 
          render json: { 
            status: 'error', 
            errors: ['参加者データに不整合があります'] 
          } 
        }
      end
    end
  end

  private

  def chat_params
    params.require(:chat).permit(:name, :visible, chat_users_attributes: [:id, :user_id, :_destroy])
  end

  def set_event
    @event = Event.find(params[:event_id])
  end

  def set_chat
    @chat = @event.chats.find(params[:id])
  end
end