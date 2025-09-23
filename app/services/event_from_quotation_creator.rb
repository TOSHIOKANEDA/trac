# app/services/event_from_quotation_creator.rb

class EventFromQuotationCreator
  def initialize(quotation, current_year)
    @quotation = quotation
    @current_year = current_year
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
    finbalance = @event.build_finbalance
    
    @quotation.quotation_items.each do |item|
      finbalance.finbalance_assemblies.build(
        finbalance_item_id: item.finbalance_item_id,
        income_amount: item.sales_amount,
        cost_amount: item.purchase_amount,
        balance_amount: item.gross_profit
      )
    end
  end
end
