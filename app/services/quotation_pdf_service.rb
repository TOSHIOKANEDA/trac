class QuotationPdfService
  require 'prawn'
  require 'prawn/table'

  attr_reader :quotation, :pdf

  def initialize(quotation)
    @quotation = quotation
    @pdf = Prawn::Document.new(
      page_size: 'A4',
      page_layout: :portrait,
      margin: [10, 10, 10, 10]
    )
    setup_fonts
  end

  def generate
    title_block
    header_block
    detail_info_block
    export_items_block
    freight_items_block
    import_items_block
    remarks_block

    pdf.render
  end

  private

  def setup_fonts
    font_regular = Rails.root.join('public/fonts/NotoSansJP-Regular.ttf').to_s
    font_bold = Rails.root.join('public/fonts/NotoSansJP-Bold.ttf').to_s

    if File.exist?(font_regular) && File.exist?(font_bold)
      pdf.font_families.update('NotoSans' => {
        normal: font_regular,
        bold: font_bold
      })
      pdf.font('NotoSans', size: 10)
    else
      pdf.font('Helvetica', size: 10)
    end
  end

  # ============================================================
  # 【セクション1】タイトル
  # ============================================================
  def title_block
    pdf.font('NotoSans', size: 16, style: :bold)
    pdf.text "Quote for #{@quotation.is_air ? "Air" : "Ocean" } Shipment", align: :center
    pdf.font('NotoSans', size: 10)
    pdf.move_down mm_to_pt(8)
  end

  # ============================================================
  # 【セクション2】ヘッダー（2カラム）
  # ============================================================
  def header_block
    left_content = build_header_left
    right_content = build_header_right

    table_data = [[left_content, right_content]]

    pdf.bounding_box([mm_to_pt(10), pdf.cursor], width: mm_to_pt(190)) do
      pdf.font('NotoSans', size: 10)
      available_width = pdf.bounds.width
      col_widths = [available_width * 0.6, available_width * 0.4]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        table.cells.borders = []
        table.cells.leading = 5
        table.rows(0..-1).height = mm_to_pt(35)
        table.cells.padding = [2, 3]
        table.cells.valign = :top
        table.column(0).align = :left
        table.column(1).align = :left
      end
    end

    pdf.move_down mm_to_pt(5)
  end

  def build_header_left
    is_english = @quotation.respond_to?(:issued_in_english) && @quotation.issued_in_english
    
    # 会社名：issued_in_english に応じて言語を切り替え
    if is_english
      client_name = @quotation.client ? @quotation.client.english_name : ''
      contact_label = 'Contact Person: '
    else
      client_name = @quotation.client ? @quotation.client.japanese_name : ''
      contact_label = 'ご担当者： '
    end
    
    contact_name = safe_string(@quotation.client_pic_name)
    
    "#{client_name}\n\n#{contact_label}#{contact_name}"
  end

  def build_header_right
    lines = [
      "株式会社HPS CONNECT",
      "〒530-0017",
      "大阪府大阪市北区角田町8番1号",
      "大阪梅田ツインタワーズ・ノース19階",
      "メール： iino@hps-connect.com",
      "Date: #{safe_string(@quotation.issue_at)}"
    ]
    lines.join("\n")
  end

  # ============================================================
  # 【セクション3】詳細情報（1行目は2カラム、以降は全幅）
  # ============================================================
  def detail_info_block
    pdf.bounding_box([mm_to_pt(10), pdf.cursor], width: mm_to_pt(190)) do
      pdf.font('NotoSans', size: 9)

      # 1行目：見積概要 / 条件（2カラム）
      first_row_data = [[
        "見積概要：#{safe_string(@quotation.term)}",
        "条件：#{safe_string(@quotation.condition)}"
      ]]

      available_width = pdf.bounds.width
      col_widths = [available_width * 0.2, available_width * 0.5]

      pdf.table(first_row_data, column_widths: col_widths) do |table|
        table.cells.borders = []
        table.cells.padding = [2, 0]
        table.cells.valign = :top
        table.column(0).align = :left
        table.column(1).align = :left
      end

      pdf.move_down mm_to_pt(2)

      # 以降の行：全幅
      detail_rows = [
        ["貨物内容：#{safe_string(@quotation.cargo)}"],
        ["集荷先：#{safe_string(@quotation.place_of_receipt)}"],
        ["出港地：#{safe_string(@quotation.port_of_loading)}"],
        ["入港地：#{safe_string(@quotation.port_of_discharge)}"],
        ["納品先：#{safe_string(@quotation.port_of_delivery)}"],
        ["#{@quotation.is_air ? "航空" : "船" }会社：#{safe_string(@quotation.carrier)}"],
        ["見積有効期限：#{safe_string(@quotation.valid_at)}"],
        ["費用概算：#{format_quotation_amount}"]
      ]

      detail_rows.each do |row|
        pdf.table([row], column_widths: [available_width]) do |table|
          table.cells.borders = []
          table.cells.padding = [2, 0]
          table.cells.valign = :top
          table.column(0).align = :left
        end
        pdf.move_down mm_to_pt(1)
      end
    end

    pdf.move_down mm_to_pt(3)
  end

  def format_quotation_amount
    total = safe_number(@quotation.total_amount)
    currency = safe_string(@quotation.currency)

    # issued_by_foreign_currency が true の場合、為替換算
    if @quotation.respond_to?(:issued_by_foreign_currency) && @quotation.issued_by_foreign_currency
      exchange_rate = safe_number(@quotation.exchange_rate)
      
      if exchange_rate > 0
        # 外貨に換算
        converted_amount = (total / exchange_rate).floor
      else
        converted_amount = total
      end
    else
      # issued_by_foreign_currency が false の場合、そのまま使用
      converted_amount = total.to_i
    end

    # 通貨記号の付与
    case currency
    when 'USD'
      "USD #{number_with_delimiter(converted_amount)}"
    when 'JPY'
      "¥#{number_with_delimiter(converted_amount)}"
    else
      "#{currency} #{number_with_delimiter(converted_amount)}"
    end
  end

  # ============================================================
  # 【セクション4】テーブル1「摘要に関する費用」(export)
  # ============================================================
  def export_items_block
    items = @quotation.quotation_items.where(section: 'export')
    items_table_block('摘要に関する費用', items) if items.any?
  end

  # ============================================================
  # 【セクション5】テーブル2「輸送費用」(freight)
  # ============================================================
  def freight_items_block
    items = @quotation.quotation_items.where(section: 'freight')
    items_table_block('輸送費用', items) if items.any?
  end

  # ============================================================
  # 【セクション6】テーブル3「輸入に関する費用」(import)
  # ============================================================
  def import_items_block
    items = @quotation.quotation_items.where(section: 'import')
    items_table_block('輸入に関する費用', items) if items.any?
  end

  # ============================================================
  # 共通：テーブル描画メソッド
  # ============================================================
  def items_table_block(title, items)
    pdf.bounding_box([mm_to_pt(10), pdf.cursor], width: mm_to_pt(190)) do
      pdf.font('NotoSans', size: 10, style: :bold)
      pdf.text title
      pdf.move_down mm_to_pt(2)

      # テーブルデータ構築
      table_data = [
        ['摘要', '単位', '部分', '消費税', '単価', '備考']
      ]

      items.each do |item|
        item_name = extract_item_name(item)
        unit = format_unit(item)
        quantity = format_quantity(item)
        tax_flag = item.tax_flag ? '※' : ''
        price = format_price(item)
        remark = safe_string(item.item_remark)

        table_data << [item_name, unit, quantity, tax_flag, price, remark]
      end

      pdf.font('NotoSans', size: 9)

      # カラム幅を%で指定（合計100%に正規化）
      available_width = pdf.bounds.width
      col_proportions = [51, 10, 18.5, 18.5, 18.5, 18.5]
      total_proportion = col_proportions.sum
      col_widths = col_proportions.map { |p| available_width * (p / total_proportion) }

      pdf.table(table_data, column_widths: col_widths) do |table|
        table.cells.leading = 4
        # ヘッダー行
        table.row(0).background_color = 'f8f8f8'
        table.row(0).style(font_style: :bold, size: 9)

        # データ行
        table.rows(1..-1).style(size: 9)

        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5

        # セルパディング
        table.cells.padding = [2, 3]

        # 配置
        table.column(0).align = :left
        table.column(1).align = :center
        table.column(2).align = :right
        table.column(3).align = :center
        table.column(4).align = :right
        table.column(5).align = :left
      end
    end

    pdf.move_down mm_to_pt(3)
  end

  # ============================================================
  # 【セクション7】備考
  # ============================================================
  def remarks_block
    pdf.bounding_box([mm_to_pt(10), pdf.cursor], width: mm_to_pt(190)) do
      pdf.font('NotoSans', size: 10, style: :bold)
      
      table_data = [
        ['備考'],
        [remarks_content]
      ]

      pdf.table(table_data, column_widths: [pdf.bounds.width]) do |table|
        # ヘッダー行
        table.cells.leading = 4
        table.row(0).background_color = 'f8f8f8'
        table.row(0).style(font_style: :bold, size: 10)

        # コンテンツ行
        table.row(1).style(size: 9)

        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5

        # セルパディング
        table.cells.padding = [3, 3]

        # 配置
        table.cells.align = :left
        table.cells.valign = :top
      end
    end
  end

  def remarks_content
    [
      "※税金のお支払いはリアルタイム口座か前払いにてお願いします。",
      "※関税・消費税は含まれておりません。",
      "※数量はお客様の情報に基づいています。数量が変更された場合、料金も変更されます。",
      "※税関検査など発生の場合は実費請求させて頂きます。"
    ].join("\n")
  end

  # ============================================================
  # ヘルパーメソッド
  # ============================================================

  def mm_to_pt(mm)
    (mm * 72 / 25.4).round(2)
  end

  def extract_item_name(item)
    if item.respond_to?(:finbalance_item_id) && item.finbalance_item_id
      finbalance_item = FinbalanceItem.find_by(id: item.finbalance_item_id) if defined?(FinbalanceItem)
      return finbalance_item.item_name if finbalance_item
    end

    if item.respond_to?(:item_name) && item.item_name.present?
      return safe_string(item.item_name)
    end

    if item.respond_to?(:item_name_note) && item.item_name_note.present?
      return safe_string(item.item_name_note)
    end

    '—'
  end

  def format_unit(item)
    unit_val = safe_number(item.unit)
    unit_val == 0 ? '件' : unit_val.to_s
  end

  def format_quantity(item)
    quantity = safe_number(item.quantity)
    quantity == quantity.to_i ? quantity.to_i.to_s : quantity.to_s
  end

  def format_price(item)
    price = safe_number(item.purchase_unit_price).to_i
    currency = safe_string(item.currency)
    
    if currency.blank? && item.section != 'export'
      currency = 'JPY'
    end

    case currency
    when 'USD'
      "USD #{number_with_delimiter(price)}"
    when 'JPY'
      "¥#{number_with_delimiter(price)}"
    else
      "#{currency} #{number_with_delimiter(price)}"
    end
  end

  def number_with_delimiter(number)
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
  end

  def safe_string(value)
    return '' if value.nil?
    value.to_s.strip
  end

  def safe_number(value)
    return 0 if value.nil?
    return value if value.is_a?(Numeric)

    if value.is_a?(String)
      return value.to_f if value.match?(/\A-?\d+\.?\d*\z/)
    end

    0
  end
end
