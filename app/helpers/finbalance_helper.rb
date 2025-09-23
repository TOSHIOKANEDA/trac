module FinbalanceHelper
  def finbalance_index_container_count(containers)
    return [] if containers.blank?
    containers
      .select { |c| c.cntr_num.present? }   # cntr_numが空でないものだけ
      .group_by { |c| "#{c.cntr_size} #{c.cntr_type}" }
      .transform_values(&:count)
  end
end
