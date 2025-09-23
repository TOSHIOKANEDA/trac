# app/services/favorite_file_copier.rb
class FavoriteFileCopier
  def initialize(favorite, event)
    @favorite = favorite
    @event = event
  end

  def call
    return if @favorite.favorite_files.blank?

    @favorite.favorite_files.each do |fav_file|
      copy_file(fav_file)
    end
    
    @event.update!(file_pasted: true)
  end

  private

  def copy_file(fav_file)
    attrs = fav_file.attributes.except('id', 'created_at', 'updated_at', 'favorite_id')
    event_file = @event.event_files.build(attrs)
    
    attach_file(event_file, fav_file) if fav_file.file.attached?
    event_file.save!
  end

  def attach_file(event_file, fav_file)
    event_file.file.attach(
      io: StringIO.new(fav_file.file.blob.download),
      filename: fav_file.file.blob.filename.to_s,
      content_type: fav_file.file.blob.content_type
    )
  end
end
