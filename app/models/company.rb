class Company < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :organized_events, class_name: "Event", foreign_key: :forwarder_id
  has_many :event_companies, dependent: :destroy
  has_many :participated_events, through: :event_companies, source: :event
  has_many :company_business_categories, dependent: :destroy
  has_many :business_categories, through: :company_business_categories
  accepts_nested_attributes_for :users, allow_destroy: true, reject_if: :all_blank

  scope :with_categories, -> {
    select("companies.id,
            companies.japanese_name,
            companies.english_name,
            companies.status,
            GROUP_CONCAT(business_categories.category ORDER BY business_categories.category) AS categories")
      .joins(:company_business_categories => :business_category)
      .group("companies.id, companies.japanese_name, companies.english_name, companies.status")
  }

  # カテゴリIDの配列を受け取って、CompanyBusinessCategoryを作成・更新する
  def category_ids=(ids)
    ids = Array(ids).compact.reject(&:blank?).map(&:to_i)
    
    # トランザクション内で処理

    transaction do
      company_business_categories.destroy_all
      ids.each do |category_id|
        
        if BusinessCategory.exists?(category_id)
          company_business_categories.create!(business_category_id: category_id)
        end
      end
    end
  end

  # フォーム表示用：現在選択されているカテゴリIDの配列を返す
  def category_ids
    business_categories.pluck(:id)
  end

  def self.ransackable_attributes(auth_object = nil)
    %w[english_name japanese_name]
  end
end
