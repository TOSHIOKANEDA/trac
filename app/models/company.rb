class Company < ApplicationRecord
  has_many :users, -> { kept }, dependent: :destroy
  has_many :organized_events, -> { kept }, class_name: "Event", foreign_key: :forwarder_id
  has_many :own_favorites, -> { kept }, class_name: "Favorite", foreign_key: :forwarder_id
  has_many :finbalance_items, -> { kept }, class_name: "FinbalanceItem", foreign_key: :forwarder_id
  has_many :quotations, -> { kept }, class_name: "Quotation", foreign_key: :forwarder_id
  has_many :customers,  -> { kept }, class_name: "CompanyBusinessCategory", foreign_key: :forwarder_id
  has_many :event_companies, -> { kept }, dependent: :destroy
  has_many :participated_events, -> { kept }, through: :event_companies, source: :event
  has_many :company_business_categories, -> { kept }, dependent: :destroy
  has_many :business_categories, -> { kept }, through: :company_business_categories
  accepts_nested_attributes_for :users, allow_destroy: true, reject_if: :all_blank
  has_many :quotation_companies, -> { kept }, dependent: :destroy
  has_many :quotations, -> { kept }, through: :quotation_companies
  include Discard::Model
  default_scope -> { kept }

  scope :with_categories, ->(forwarder_id) {
    select("companies.id,
            companies.japanese_name,
            companies.english_name,
            companies.status,
            GROUP_CONCAT(business_categories.category ORDER BY business_categories.category) AS categories")
      .joins(company_business_categories: :business_category)
      .where("company_business_categories.forwarder_id = ?", forwarder_id)
      .group("companies.id, companies.japanese_name, companies.english_name, companies.status")
  }

  # カテゴリIDの配列を受け取って、CompanyBusinessCategoryを作成・更新する
  def create_business_category(ids, forwarder_id, category_attributes = {})
    ids = Array(ids).compact.reject(&:blank?).map(&:to_i)

    transaction do
      company_business_categories.destroy_all
      ids.each do |category_id|
        if BusinessCategory.exists?(category_id)
          category = BusinessCategory.find(category_id)
          
          cbc = company_business_categories.create!(
            business_category_id: category_id,
            forwarder_id: forwarder_id
          )

          # CARRIERの場合、Carrierレコードを作成
          if category.category == "carrier"
            scac_value = category_attributes[category_id.to_s]&.dig(:scac)
            is_air_value = category_attributes[category_id.to_s]&.dig(:is_air)
            
            # is_air が true の場合、SCAC は "AIR" に自動設定
            if is_air_value == 'true' || is_air_value == true
              scac_value = 'AIR'
              is_air = true
            else
              is_air = false
            end

            if scac_value.present?
              cbc.create_carrier!(
                scac: scac_value,
                is_air: is_air
              )
            end
          end

          # OTHERの場合、Industryを紐付け
          if category.category == "other" && category_attributes[category_id.to_s]&.dig(:industry_id).present?
            cbc.update!(
              industry_id: category_attributes[category_id.to_s][:industry_id]
            )
          end
        end
      end
    end
  end

  # ビューで使用：カテゴリIDの配列を返す
  def category_ids
    business_categories.pluck(:id)
  end

  # ビューで使用：CARRIER用SCAQを取得
  def carrier_scac
    cbc = company_business_categories.joins(:business_category)
                                     .find_by(business_categories: { category: :carrier })
    cbc&.carrier&.scac
  end

  # ビューで使用：CARRIER用CompanyBusinessCategoryを取得
  def carrier_company_business_category
    company_business_categories.joins(:business_category)
                               .find_by(business_categories: { category: :carrier })
  end

  # ビューで使用：OTHER用業種IDを取得
  def other_industry_id
    cbc = company_business_categories.joins(:business_category)
                                     .find_by(business_categories: { category: :other })
    cbc&.industry_id
  end

  # ビューで使用：OTHER用CompanyBusinessCategoryを取得
  def other_company_business_category
    company_business_categories.joins(:business_category)
                               .find_by(business_categories: { category: :other })
  end

  def self.ransackable_attributes(auth_object = nil)
    %w[english_name japanese_name]
  end
end
