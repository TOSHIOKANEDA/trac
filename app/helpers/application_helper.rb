module ApplicationHelper
  def active_sidebar_class(names)
    targets = Array(names).map(&:to_s)
    page = "#{controller_name}/#{action_name}"

    "active" if targets.include?(page)
  end

  def site_title
    "トラフィックカレンダー"
  end

  def page_title(title = nil)
    if title.present?
      "#{title} | #{site_title}"
    else
      site_title
    end
  end


  def date_with_time(date_time)
    return "N/A" if date_time.blank?
    
    begin
      time = date_time.is_a?(String) ? Time.zone.parse(date_time) : date_time
      return "N/A" if time.nil?
      time.strftime("%Y年%-m月%-d日 %H:%M")
    rescue ArgumentError, TypeError
      "N/A"
    end
  end

  def date_only(date_time)
    return "N/A" if date_time.blank?
    
    begin
      time = date_time.is_a?(String) ? Time.zone.parse(date_time) : date_time
      return "N/A" if time.nil?
      time.strftime("%Y年%-m月%-d日")
    rescue ArgumentError, TypeError
      "N/A"
    end
  end
end
