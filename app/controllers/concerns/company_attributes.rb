# app/controllers/concerns/company_attributes.rb
module CompanyAttributes
  extend ActiveSupport::Concern

  private

  def set_attributes
    @ports = PortList.pluck(:name)
    @users = current_user.company.users
    @company_groups = BusinessCategory
      .where(companies: { status: true })
      .joins(:companies)
      .select(
        "companies.id AS id",
        "companies.english_name AS name",
        "business_categories.category"
      )&.group_by(&:category)
  end
end
