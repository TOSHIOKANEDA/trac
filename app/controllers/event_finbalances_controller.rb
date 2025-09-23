class EventFinbalancesController < ApplicationController
  before_action :find_event
  before_action :set_attributes, only: [:new, :edit, :update, :create]
  before_action :set_event_finbalance, only: [:edit, :update, :show]

  def new
    @event_finbalance = EventFinbalance.new(event_id: @event.id)
    @event_finbalance.event_finbalance_assemblies.build
  end

  def edit
  end

  def update
    sanitized_params = sanitize_event_finbalance_params(event_finbalance_params)
    @event_finbalance.assign_attributes(sanitized_params)
    @event_finbalance.user_id = current_user.id

    if @event_finbalance.save
      redirect_to edit_event_event_finbalance_path(id: @event_finbalance.id, event_id: @event.id), 
                  notice: '支払い・請求編集を更新しました'
    else
      @messages = event_finbalance_error_messages
      render :edit
    end
  end

  def index
    @event_finbalances = Event.with_event_finbalances(current_user.company.id)
                              .where(events: { id: @event.id })
                              .select(event_list_columns)
                              .group('event_finbalance_id')
  end

  def create
    sanitized_params = sanitize_event_finbalance_params(event_finbalance_params)
    @event_finbalance = @event.event_finbalances.build(sanitized_params)
    @event_finbalance.user_id = current_user.id

    if @event_finbalance.save
      redirect_to edit_event_event_finbalance_path(id: @event_finbalance.id, event_id: @event.id), notice: '支払い・請求編集を保存しました'
    else
      @messages = event_finbalance_error_messages
      render :new
    end
  end


  def show    
    respond_to do |format|
      format.html
      format.pdf do
        pdf_service = InvoicePdfService.new(@event_finbalance)
        send_data pdf_service.generate,
                  filename: "invoice_#{@event_finbalance.id}_#{Date.today.strftime('%Y%m%d')}.pdf",
                  type: 'application/pdf',
                  disposition: 'inline'  # ブラウザで表示
      end
    end
  end

  private

  def sanitize_event_finbalance_params(params_hash)
    sanitized = params_hash.dup

    # 親レベルの金額フィールド
    %i[income expense balance small_total comumption_tax_total total_amount].each do |attr|
      if sanitized[attr].present?
        sanitized[attr] = sanitized[attr].to_s.delete(",").to_i
      end
    end

    # 子レベル（event_finbalance_assemblies_attributes）の金額フィールド
    if sanitized[:event_finbalance_assemblies_attributes].present?
      sanitized[:event_finbalance_assemblies_attributes].each do |_key, assembly_attrs|
        %i[purchase_amount sales_amount gross_profit].each do |attr|
          if assembly_attrs[attr].present?
            assembly_attrs[attr] = assembly_attrs[attr].to_s.delete(",").to_i
          end
        end
      end
    end

    sanitized
  end

  def event_list_columns
    [
      "events.id",
      "events.id_string",
      "events.mbl",
      "events.accounting_month",
      "COALESCE(event_finbalances.subject, '') AS subject",
      "COALESCE(event_finbalances.expense, 0) AS expense",
      "COALESCE(event_finbalances.income, 0) AS income",
      "COALESCE(event_finbalances.balance, 0) AS balance",
      "COALESCE(event_finbalances.small_total, 0) AS small_total",
      "COALESCE(event_finbalances.comumption_tax_total, 0) AS comumption_tax_total",
      "COALESCE(event_finbalances.total_amount, 0) AS total_amount",
      "COALESCE(clients.english_name, '') AS client",
      "COALESCE(shippers.english_name, '') AS shipper",
      "COALESCE(consignees.english_name, '') AS consignee",
      "COALESCE(event_finbalances.id, '') AS event_finbalance_id"
    ]
  end

  def find_event
    @event = Event.find(params[:event_id])
  end

  def event_finbalance_error_messages
    messages = []
    
    # 親レベル（EventFinbalance）のエラー
    if @event_finbalance.errors.any?
      messages += @event_finbalance.errors.details.flat_map { |attr, ds|
        ds.map { |d| "#{@event_finbalance.class.human_attribute_name(attr)} #{EventFinbalance.new.errors.generate_message(attr, d[:error])}" }
      }
    end
    
    # 子レベル（EventFinbalanceAssembly）のエラー
    @event_finbalance.event_finbalance_assemblies.each_with_index do |assembly, index|
      if assembly.errors.any?
        messages += assembly.errors.details.flat_map { |attr, ds|
          ds.map { |d| "明細行 #{index + 1} の #{EventFinbalanceAssembly.human_attribute_name(attr)} #{EventFinbalanceAssembly.new.errors.generate_message(attr, d[:error])}" }
        }
      end
    end
    
    messages
  end

  def set_attributes
    @units = ["件","20'","40'","台","コンテナ","個","KG","M3","箱","欄","Page","葉"]
    @finbalance_items = current_user.company.finbalance_items
    @event_companies = @event.event_companies.joins(:company).select("companies.japanese_name as name", "companies.id as id")
  end

  def set_event_finbalance
    @event_finbalance = EventFinbalance.find(params[:id])
  end

  def event_finbalance_params
    params.require(:event_finbalance).permit(
      :subject,
      :client_pic_name,
      :due_date,
      :tax_percent,
      :income,
      :company_id,
      :expense,
      :balance,
      :small_total,
      :comumption_tax_total,
      :total_amount,
      event_finbalance_assemblies_attributes: [
        :id,
        :finbalance_item_id,
        :unit,
        :tax_flag,
        :currency,
        :exchange_rate,
        :quantity,
        :purchase_unit_price,
        :purchase_amount,
        :sales_unit_price,
        :sales_amount,
        :gross_profit,
        :gross_profit_rate,
        :item_remark,
        :_destroy
      ]
    )
  end
end
