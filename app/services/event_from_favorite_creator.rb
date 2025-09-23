# app/services/event_from_favorite_creator.rb（更新版）

class EventFromFavoriteCreator
  def initialize(favorite, current_year, current_user)
    @favorite = favorite
    @current_year = current_year
    @current_user = current_user
  end

  def call
    @event = build_event
    setup_companies
    setup_goods
    setup_container
    setup_step
    setup_doc
    setup_shipment
    setup_schedule
    cleanup_empty_companies
    
    @event.save!
    copy_favorite_files if @favorite.favorite_files.present?
    
    @event
  end

  private

  def build_event
    Event.new(
      description: @favorite.description,
      remark: @favorite.remark,
      forwarder_id: @favorite.forwarder_id,
      year: @current_year
    ).tap do |event|
      event.id_string = event.generate_id
    end
  end

  def setup_companies
    favorite_companies = @favorite.favorite_companies.group_by(&:role)
    EventCompany.roles.keys.each do |role|
      company_id = favorite_companies[role]&.first&.company_id
      @event.event_companies.build(role: role, company_id: company_id)
    end
  end

  def setup_goods
    @favorite.favorite_goods.each do |fg|
      @event.event_goods.build(
        pkg: fg.pkg,
        type_of_pkg: fg.type_of_pkg,
        n_w: fg.n_w,
        g_w: fg.g_w,
        three_m: fg.three_m
      )
    end
  end

  def setup_container
    @event.containers.build
  end

  def setup_step
    @event.event_steps.build(status: :booking, status_date: Time.current)
  end

  def setup_doc
    return if @favorite.favorite_doc.blank?

    doc_boolean_columns = FavoriteDoc.columns.select { |c| c.type == :boolean }.map(&:name)
    @event.build_event_doc(@favorite.favorite_doc.slice(*doc_boolean_columns))
  end

  def setup_shipment
    return if @favorite.favorite_shipment.blank?

    shipment_columns = %w[
      shipment mode term place_of_receipt port_of_loading
      port_of_discharge port_of_delivery pick_up delivery carrier
    ]
    @event.build_event_shipment(@favorite.favorite_shipment.slice(*shipment_columns))
  end

  def setup_schedule
    @event.build_event_schedule
  end

  def cleanup_empty_companies
    @event.event_companies.each do |ec|
      ec.mark_for_destruction if ec.company_id.nil?
    end
  end

  def copy_favorite_files
    AttachedFileCopier.new(@favorite, @event).call
  end
end
