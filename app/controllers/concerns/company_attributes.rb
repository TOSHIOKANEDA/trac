# app/controllers/concerns/company_attributes.rb
module CompanyAttributes
  extend ActiveSupport::Concern

  private

  def set_attributes
    @ports = PortList.pluck(:name)
    @carriers = Carrier.joins(:company).pluck("companies.japanese_name as name", "carriers.id")
    @units = ["件","20'","40'","台","コンテナ","個","KG","M3","箱","欄","Page","葉"]
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
