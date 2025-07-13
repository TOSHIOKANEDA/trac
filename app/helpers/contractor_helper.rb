module ContractorHelper
  def business_category_names(str)
    return [] if str.blank?
    ids = str.split(",").map(&:to_i)
    keys = ids.map { |i| BusinessCategory.categories.key(i) }
    names = keys.map { |k| I18n.t("activerecord.attributes.business_category.category.#{k}") }
  end
end
