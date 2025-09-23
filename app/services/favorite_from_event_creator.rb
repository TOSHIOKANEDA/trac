# app/services/favorite_from_event_creator.rb（更新版）

class FavoriteFromEventCreator
  def initialize(event, current_year)
    @event = event
    @current_year = current_year
  end

  def call
    @favorite = build_favorite
    setup_companies
    setup_shipment
    setup_goods
    setup_doc
    setup_finbalance
    
    @favorite.save!
    copy_event_files if @event.event_files.present?
    
    @favorite
  end

  private

  def build_favorite
    Favorite.new(
      forwarder_id: @event.forwarder_id,
      description: @event.description,
      remark: @event.remark,
      name: ""
    )
  end

  def setup_companies
    @event.event_companies.each do |ec|
      next if ec.company_id.nil?
      
      @favorite.favorite_companies.build(
        role: ec.role,
        company_id: ec.company_id
      )
    end
  end

  def setup_shipment
    return if @event.event_shipment.blank?

    shipment_columns = %w[
      shipment mode term place_of_receipt port_of_loading
      port_of_discharge port_of_delivery pick_up delivery carrier
    ]
    
    @favorite.build_favorite_shipment(@event.event_shipment.slice(*shipment_columns))
  end

  def setup_goods
    @event.event_goods.each do |eg|
      @favorite.favorite_goods.build(
        pkg: eg.pkg,
        type_of_pkg: eg.type_of_pkg,
        n_w: eg.n_w,
        g_w: eg.g_w,
        three_m: eg.three_m
      )
    end
  end

  def setup_doc
    return if @event.event_doc.blank?

    doc_boolean_columns = FavoriteDoc.columns.select { |c| c.type == :boolean }.map(&:name)
    @favorite.build_favorite_doc(@event.event_doc.slice(*doc_boolean_columns))
  end

  def setup_finbalance
    return if @event.event_finbalances.blank?

    favorite_finbalance = @favorite.favorite_finbalances.build
    
    @event.finbalance.event_finbalance_assemblies.each do |fa|
      favorite_finbalance.favorite_finbalance_assemblies.build(
        finbalance_item_id: fa.finbalance_item_id,
        income_amount: fa.income_amount,
        cost_amount: fa.cost_amount,
        balance_amount: fa.balance_amount
      )
    end
  end

  def copy_event_files
    AttachedFileCopier.new(@event, @favorite).call
  end
end
