class AttachedFileCopier
  def initialize(source, destination)
    @source = source
    @destination = destination
  end

  def call
    if @source.is_a?(Favorite)
      copy_favorite_to_event
    elsif @source.is_a?(Event)
      copy_event_to_favorite
    end
  end

  private

  # Favorite → Event のコピー（既存実装）
  def copy_favorite_to_event
    return if @source.favorite_files.blank?

    @source.favorite_files.each do |fav_file|
      copy_favorite_file(fav_file)
    end
    
    @destination.update!(file_pasted: true)
  end

  # Event → Favorite のコピー（新規実装）
  def copy_event_to_favorite
    return if @source.event_files.blank?

    @source.event_files.each do |event_file|
      copy_event_file(event_file)
    end
  end

  def copy_favorite_file(fav_file)
    attrs = fav_file.attributes.except('id', 'created_at', 'updated_at', 'favorite_id')
    event_file = @destination.event_files.build(attrs)
    
    attach_file(event_file, fav_file) if fav_file.file.attached?
    event_file.save!
  end

  def copy_event_file(event_file)
    return if event_file.file.blank?

    favorite_file = @destination.favorite_files.build(
      business_category_id: event_file.business_category_id
    )

    attach_file(favorite_file, event_file)
    favorite_file.save!
  end

  def attach_file(dest_file, src_file)
    file_content = src_file.file.blob.download
    dest_file.file.attach(
      io: StringIO.new(file_content),
      filename: src_file.file.blob.filename.to_s,
      content_type: src_file.file.blob.content_type
    )
  end
end

