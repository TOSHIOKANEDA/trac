class MessagesController < ApplicationController
  before_action :set_chat

  def create
    @message = @chat.messages.build(message_params)
    @message.user = current_user

    if @message.save
      # Turbo Stream 用
      respond_to do |format|
        format.turbo_stream do
          html = ApplicationController.render(
            partial: "messages/message",
            locals: { message: @message }
          )
          ChatChannel.broadcast_to(@chat, html)
          head :ok
        end
        format.html { redirect_to event_path(@chat.event) }
      end
    else
      redirect_to event_path(@chat.event), alert: "送信できませんでした"
    end
  end

  private

  def set_chat
    @chat = Chat.find(params[:chat_id])
  end

  def message_params
    params.require(:message).permit(:content)
  end
end
