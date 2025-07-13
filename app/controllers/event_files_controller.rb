class EventFilesController < ApplicationController
  def index
  end

  def new
    # 案件が輸入と輸出とで分ける
    @export_files = [ "Commercial Invoice", "Packing List", "MSDS", "COO（原産地証明書）", "検疫書類", "L/C", "バンレポ", "搬入票" ]
    @forwarder_files = [ "見積書", "S/I (Shipping Instruction)", "HBL/AWB", "DG Declaration", "保険証券", "Booking Confirmation", "MBL" ]
    @custom_files = [ "検量証明書", "輸出許可書", "D/R(Dock Receipt)" ]
  end
end
