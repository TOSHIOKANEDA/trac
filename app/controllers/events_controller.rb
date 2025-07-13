class EventsController < ApplicationController
  before_action :set_event, only: %i[ show edit update destroy purge_file ]

  def index
    @events = current_user.events.all
    respond_to do |format|
      format.html # index.html.erb
      format.json do
        render json: @events.map do |event|
          {
            id: event.id,
            title: event.title,
            start: event.start_time,
            end: event.end_time,
            # ↓↓↓ この2行を追加します ↓↓↓
            className: status_to_tailwind_class(event.status),
            url: edit_event_path(event) # モーダルで開くためのURL
          }
        end
      end
    end
  end

  # ... (list, show, new, edit, create, update, destroyアクションは変更なし)
  def list
    @q = Event.ransack(params[:q])
    # 全ユーザーの案件を表示する場合
    # @events = @q.result(distinct: true)
    # ログインユーザーの案件のみ表示する場合
    @events = @q.result(distinct: true).where(user: current_user)
  end

  def expense_list
  end

  def expense_new
  end

  def show
  end

  def new
    @event = Event.new
  end

  def edit
    @messages = @event.messages.order(created_at: :asc)
  end

  def create
    @event = current_user.events.new(event_params)
    if @event.save
      redirect_to events_url, notice: "案件を登録しました。"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @event.update(event_params)
      redirect_to events_url, notice: "案件を更新しました。"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    redirect_to events_url, notice: "案件を削除しました。"
  end

  def purge_file
    file = @event.files.find(params[:file_id])
    file.purge
    redirect_to edit_event_path(@event), notice: "\u30D5\u30A1\u30A4\u30EB\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002"
  end


  private

  def set_event
    @event = current_user.events.find(params[:id])
  end

  def event_params
    params.require(:event).permit(:title, :start_time, :end_time, :status, files: [])
  end

  # ↓↓↓ このメソッドを追加します ↓↓↓
  def status_to_tailwind_class(status)
    # FullCalendarのイベントのスタイルをTailwindクラスで定義
    base_class = "p-0.5 border text-white text-xs font-semibold overflow-hidden"
    case status
    when "active"
      "#{base_class} bg-blue-500 border-blue-700"
    when "in_progress"
      "#{base_class} bg-yellow-500 border-yellow-700"
    when "completed"
      "#{base_class} bg-green-500 border-green-700"
    when "canceled"
      "#{base_class} bg-gray-400 border-gray-600 !text-gray-800" # キャンセルは文字色を濃くする
    else
      "#{base_class} bg-indigo-500 border-indigo-700"
    end
  end
end
