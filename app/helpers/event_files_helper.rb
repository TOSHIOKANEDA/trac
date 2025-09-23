module EventFilesHelper
  def file_icon_class(file_type)
    case file_type&.downcase
    when 'application/pdf'
      'fas fa-file-pdf text-danger'
    when 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      'fas fa-file-word text-primary'
    when 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      'fas fa-file-excel text-success'
    when 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'
      'fas fa-file-image text-info'
    when 'text/plain', 'text/csv'
      'fas fa-file-alt text-secondary'
    when 'message/rfc822', 'application/vnd.ms-outlook'
      'fas fa-envelope text-primary'
    when 'application/zip', 'application/x-zip-compressed'
      'fas fa-file-archive text-dark'
    else
      'fas fa-file text-muted'
    end
  end

  def file_icon_style(file_type)
    case file_type&.downcase
    when 'application/pdf'
      "color: #dc3545;"
    when 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      "color: #0d6efd;"
    when 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      "color: #198754;"
    else
      "color: #28a745;"
    end
  end
end
