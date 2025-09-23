module QuotationHelper
  def quotation_new_get_company_options(company, options_map)
    category = company.company_category
    return [] if category.blank?
    enum_key = BusinessCategory.categories[category]
    options_map[enum_key] || []
  end
end