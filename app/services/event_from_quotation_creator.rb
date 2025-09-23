# app/services/event_from_quotation_creator.rb

class EventFromQuotationCreator
  def initialize(quotation, current_year, current_user)
    @quotation = quotation
    @current_year = current_year
    @current_user = current_user
  end

  def call
    @event = build_event
    setup_container
    setup_step
    setup_shipment
    setup_schedule
    setup_finbalance
    setup_client
    setup_doc
    
    @event.save!
    
    @event
  end

  private

  def build_event
    Event.new(
      forwarder_id: @quotation.forwarder_id,
      year: @current_year
    ).tap do |event|
      event.id_string = event.generate_id
    end
  end

  def setup_doc
    @event.build_event_doc(
      quotation: true
    )
  end

  def setup_container
    @event.containers.build
  end

  def setup_client
    @event.event_companies.build(company_id: @quotation.client_id, role: :client)
  end

  def setup_step
    @event.event_steps.build(status: :booking, status_date: Time.current)
  end

  def setup_shipment
    @event.build_event_shipment(
      shipment: @quotation.shipment,
      mode: @quotation.mode,
      term: @quotation.term,
      pick_up: @quotation.place_of_receipt,
      place_of_receipt: @quotation.port_of_loading,
      port_of_loading: @quotation.port_of_loading,
      port_of_delivery: @quotation.port_of_discharge,
      port_of_discharge: @quotation.port_of_discharge,
      delivery: @quotation.port_of_delivery,
    )
  end

  def setup_schedule
    @event.build_event_schedule
  end

  def setup_finbalance
    income = @quotation.quotation_items.sum(:sales_amount)
    expense = @quotation.quotation_items.sum(:purchase_amount)
    small_total = income
    consumption_tax_total = (small_total * @quotation.tax_percent / 100).floor
    total_amount = small_total + consumption_tax_total
    balance = income - expense

    event_finbalance = @event.event_finbalances.build(
      user_id: @current_user.id,
      client_pic_name: @quotation.client_pic_name,
      remark: @quotation.remark,
      total_amount: @quotation.total_amount,
      tax_percent: @quotation.tax_percent,
      comumption_tax_total: consumption_tax_total,
      income: income,
      expense: expense,
      balance: balance,
      small_total: small_total
    )
    
    @quotation.quotation_items.each do |item|
      event_finbalance.event_finbalance_assemblies.build(
        finbalance_item_id: item.finbalance_item_id,
        unit: item.unit,
        tax_flag: item.tax_flag,
        currency: item.currency,
        exchange_rate: item.exchange_rate,
        quantity: item.quantity,
        purchase_unit_price: item.purchase_unit_price,
        purchase_amount: item.purchase_amount,
        sales_unit_price: item.sales_unit_price,
        sales_amount: item.sales_amount,
        gross_profit: item.gross_profit,
        gross_profit_rate: item.gross_profit_rate,
        item_remark: item.item_remark
      )
    end
  end
end
