class InvoicePdfService
  require 'prawn'
  require 'prawn/table'

  attr_reader :event_finbalance, :pdf

  def initialize(event_finbalance)
    @event_finbalance = event_finbalance
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
    notice_block
    meta_block
    summary_block
    payment_info_block
    details_block
    total_block
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
      pdf.font('NotoSans', size: 11)
    else
      pdf.font('Helvetica', size: 11)
    end
  end

  # ============================================================
  # 【1】title_block - 「請求書」をページ上部中央に表示
  # ============================================================
  def title_block
    pdf.font('NotoSans', size: 16, style: :bold)
    pdf.text '請求書', align: :center
    pdf.font('NotoSans', size: 11)
    pdf.move_down mm_to_pt(8)
  end

  # ============================================================
  # 【2】header_block - 宛名と請求情報・発行者情報を2カラムテーブルで表示
  # ============================================================
  def header_block
    # テーブルデータ構築
    left_column = build_header_left_column
    right_column = build_header_right_column

    # header_blockテーブル（2カラム）
    table_data = [
      [left_column, right_column]
    ]

    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: mm_to_pt(170)) do
      pdf.font('NotoSans', size: 10)
      
      # 相対幅指定で浮動小数点誤差を回避
      available_width = pdf.bounds.width
      col_widths = [available_width * 0.6, available_width * 0.4]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # ボーダーなし
        table.cells.borders = []
        
        # セルパディング
        table.cells.padding = [2, 3]
        table.cells.leading = 5        
        # 垂直配置
        table.cells.valign = :top
        
        # 列配置
        table.column(0).align = :left
        table.column(1).align = :left
      end
    end

    pdf.move_down mm_to_pt(5)
  end

  def build_header_left_column
    lines = []

    billing_company = get_billing_company
    billing_to_name = billing_company.present? ? 
                      safe_string(billing_company.japanese_name) : ''
    lines << {text: "#{billing_to_name} 御中", size: 12, style: :bold}
    
    # 【修正】担当者名は client_pic_name から取得
    contact_person = safe_string(@event_finbalance.client_pic_name)
    lines << {text: contact_person, size: 10} if contact_person.present?
    
    # テキストを結合して返す
    lines.map { |line| format_header_text(line) }.join("\n")
  end

  def build_header_right_column
    lines = []
    
    # 上部: 請求情報（右揃え）
    invoice_date = safe_date(@event_finbalance.created_at)
    invoice_number = "EF#{@event_finbalance.id.to_s.rjust(6, '0')}"
    registration_number = 'T4011001158054'  # HPS CONNECTの登録番号
    
    lines << "請求日           #{invoice_date}"
    lines << "請求書番号       #{invoice_number}"
    lines << "登録番号         #{registration_number}"
    
    # 空行
    lines << ""
    
    # 下部: 発行者情報（右揃え）
    issuer_name = '株式会社HPS CONNECT'
    issuer_postal_code = '〒530-0017'
    issuer_address = '大阪府大阪市北区角田町8番1号'
    issuer_building ='大阪梅田ツインタワーズ・ノース19階'
    issuer_phone = 'TEL: 06-7668-8588'
    
    lines << issuer_name
    lines << issuer_postal_code
    lines << issuer_address
    lines << issuer_building
    lines << issuer_phone
    
    lines.join("\n")
  end

  def format_header_text(line_hash)
    "#{line_hash[:text]}"
  end

  # ============================================================
  # 【3】notice_block - 「下記の通りご請求申し上げます。」を左側に表示
  # ============================================================
  def notice_block
    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: pdf.bounds.width - mm_to_pt(40)) do
      pdf.font('NotoSans', size: 10)
      pdf.text '下記の通りご請求申し上げます。'
    end
    pdf.move_down mm_to_pt(6)
  end

  # ============================================================
  # 【4】meta_block - 件名を左側に表示
  # ============================================================
  def meta_block
    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: pdf.bounds.width - mm_to_pt(40)) do
      pdf.font('NotoSans', size: 10)
      
      subject = safe_string(@event_finbalance.subject)
      pdf.text "件名 ： #{subject}"
    end
    
    pdf.move_down mm_to_pt(8)
  end

  # ============================================================
  # 【5】summary_block - 小計・消費税・請求金額を3列テーブルで表示
  # ============================================================
  def summary_block
    subtotal = calculate_subtotal
    tax_amount = calculate_tax
    total = subtotal + tax_amount

    table_data = [
      ['小計（税抜）', '消費税', '請求金額'],
      ["#{format_amount(subtotal)}", "#{format_amount(tax_amount)}", "#{format_amount(total)}"]
    ]

    # ステップ1: 左50%のbounding_boxを作成
    full_width = pdf.bounds.width
    left_width = full_width * 0.43

    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: left_width) do
      pdf.font('NotoSans', size: 10)
      
      # ステップ2: その中での相対幅指定（31.25%, 31.25%, 37.5%）
      available_width = pdf.bounds.width
      col_widths = [
        available_width * 0.3125,
        available_width * 0.3125,
        available_width * 0.375
      ]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # ヘッダー行
        table.row(0).background_color = 'f8f8f8'
        table.row(0).style(font_style: :bold, size: 10)
        
        # データ行
        table.row(1).style(size: 10)
        
        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5
        
        # セルパディング
        table.cells.padding = [2, 3]
        
        # 配置
        table.cells.align = :center
      end
    end

    pdf.move_down mm_to_pt(2)
  end

  # ============================================================
  # 【6】payment_info_block - 入金期日と振込先を2列テーブルで表示
  # ============================================================
  def payment_info_block
    table_data = [
      ['支払い期限', safe_date(@event_finbalance.due_date)],
    ]

    # ステップ1: 左50%のbounding_boxを作成
    full_width = pdf.bounds.width
    left_width = full_width * 0.43

    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: left_width) do
      pdf.font('NotoSans', size: 9)
      
      # ステップ2: その中での相対幅指定（31.25%, 68.75%）
      available_width = pdf.bounds.width
      col_widths = [
        available_width * 0.3125,
        available_width * 0.6875
      ]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5
        table.cells.leading = 5
        # セルパディング
        table.cells.padding = [2, 3]
        
        # 配置
        table.column(0).align = :left
        table.column(1).align = :left
      end
    end

    pdf.move_down mm_to_pt(5)
  end

  # ============================================================
  # 【7】details_block - 明細をテーブル（4列）で表示
  # ============================================================
  def details_block
    table_data = [
      ['摘要', '数量', '単価', '明細金額', '備考']
    ]

    items = @event_finbalance.event_finbalance_assemblies

    items.each do |item|
      item_name = extract_item_name(item)
      # tax_flagがtrueの場合は「※」を摘要名の後ろに付け加える
      item_name = "#{item_name}※" if item.tax_flag
      
      quantity = safe_number(item.quantity).to_i
      unit = safe_string(item.unit).presence || '件'
      quantity_str = "#{quantity} #{unit}"

      unit_price = safe_number(item.sales_unit_price)
      amount = safe_number(item.sales_amount)
      
      # 明細金額：tax_flagがtrueなら税抜き計算、falseならそのまま使用
      amount_for_display = if item.tax_flag
                             calculate_amount_before_tax(amount)
                           else
                             amount
                           end
      
      remark = safe_string(item.item_remark)
      
      # 単価の表示（外貨通貨建て以外は、換算レートで計算した日本円で表示）
      formatted_unit_price = format_unit_price(item, true)

      table_data << [
        item_name,
        quantity_str,
        formatted_unit_price,
        format_amount(amount_for_display.to_i),
        remark
      ]
    end

    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: pdf.bounds.width - mm_to_pt(30)) do
      pdf.font('NotoSans', size: 10)
      
      # 相対幅指定で浮動小数点誤差を回避
      available_width = pdf.bounds.width
      col_widths = [
        available_width * 0.5,
        available_width * 0.1,
        available_width * 0.15,
        available_width * 0.15,
        available_width * 0.1
      ]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # ヘッダー行
        table.row(0).background_color = 'f8f8f8'
        table.row(0).style(font_style: :bold, size: 10)
        
        # データ行（行高さを半分に）
        table.rows(1..-1).style(size: 10)
        
        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5
        
        # セルパディング
        table.cells.padding = [2, 3]
        
        table.row(0).columns(0..4).align = :center

        # データ行の配置
        table.rows(1..-1).columns(0).align = :left    # 摘要
        table.rows(1..-1).columns(1).align = :center  # 数量
        table.rows(1..-1).columns(2).align = :right   # 単価
        table.rows(1..-1).columns(3).align = :right   # 明細金額
        table.rows(1..-1).columns(4).align = :center  # 備考
      end
    end

    pdf.move_down mm_to_pt(2)
  end

  # ============================================================
  # 【8】total_block - 10%対象と消費税を右側のみで表示するテーブル
  # ============================================================
  def total_block
    taxable_amount = calculate_taxable_amount
    tax_amount = calculate_tax

    table_data = [
      ['10%対象（税抜）', "#{format_amount(taxable_amount.to_i)}"],
      ['10%消費税', "#{format_amount(tax_amount.to_i)}"]
    ]

    pdf.bounding_box([mm_to_pt(108), pdf.cursor], width: mm_to_pt(81)) do
      pdf.font('NotoSans', size: 10)
      
      # 相対幅指定で浮動小数点誤差を回避
      available_width = pdf.bounds.width
      col_widths = [available_width * 0.5, available_width * 0.5]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # すべての行がデータ行
        table.rows(0..-1).style(size: 10)

        # すべてのセルから罫線を削除
        table.cells.borders = []
        table.cells.padding = [2, 3]
        
        # 配置
        table.column(0).align = :left
        table.column(1).align = :right
      end
      pdf.stroke_color 'cccccc'
      pdf.line_width 0.5
      pdf.stroke_bounds # <- これが bounding_box の外枠を描画する命令
    end

    pdf.move_down mm_to_pt(8)
  end

  # ============================================================
  # 【9】remarks_block - 備考をテーブルで表示
  # ============================================================
  def remarks_block
    # 【修正】EventFinbalance.remark から取得
    remarks_note = safe_string(@event_finbalance.remark)
    
    # 【修正】Event → EventSchedule と EventShipment から ETA を取得
    # shipment が export なら pol_etd、それ以外は pod_eta
    event = @event_finbalance.event
    event_shipment = event.event_shipment
    event_schedule = event.event_schedule
    
    # ETA の決定ロジック
    if event_shipment&.shipment.to_s == 'export' && event_schedule&.pol_etd.present?
      eta = event_schedule.pol_etd.strftime('%Y-%m-%d')
    elsif event_schedule&.pod_eta.present?
      eta = event_schedule.pod_eta.strftime('%Y-%m-%d')
    else
      eta = ''
    end
    
    cargo = event.event_goods.pluck(:pkg).compact.join(', ')
    
    content_lines = []
    content_lines << "ETA: #{eta}" if eta.present?
    content_lines << "Cargo: #{cargo}" if cargo.present?
    content_lines << '※は消費税課税対象'
    
    table_data = [
      ['備考'],
      [content_lines.join("\n")]
    ]

    pdf.bounding_box([mm_to_pt(20), pdf.cursor], width: mm_to_pt(170)) do
      pdf.font('NotoSans', size: 9)
      
      # 相対幅指定で浮動小数点誤差を回避
      available_width = pdf.bounds.width
      col_widths = [available_width]
      
      pdf.table(table_data, column_widths: col_widths) do |table|
        # ヘッダー行
        table.row(0).background_color = 'f8f8f8'
        table.row(0).style(font_style: :bold, size: 10)
        
        # コンテンツ行
        table.row(1).style(size: 9)
        
        # 線のスタイル
        table.cells.border_color = 'cccccc'
        table.cells.border_width = 0.5
        
        # セルパディング
        table.cells.padding = [2, 3]
        table.cells.leading = 5
        # 配置
        table.cells.align = :left
        table.cells.valign = :top
      end
    end
  end

  # ============================================================
  # ヘルパーメソッド
  # ============================================================

  def mm_to_pt(mm)
    (mm * 72 / 25.4).round(2)
  end

  # 【修正】EventFinbalanceAssembly 用の item_name 抽出メソッド
  def extract_item_name(assembly)
    # EventFinbalanceAssembly の場合、finbalance_item_id から FinbalanceItem を取得
    if assembly.is_a?(EventFinbalanceAssembly) && assembly.finbalance_item_id
      finbalance_item = FinbalanceItem.find_by(id: assembly.finbalance_item_id)
      return safe_string(finbalance_item.item_name) if finbalance_item
    end

    '—'
  end

  # 【修正】event_finbalance_assemblies 用に更新
  def calculate_subtotal
    items = @event_finbalance.event_finbalance_assemblies
    items.sum do |item|
      amount = safe_number(item.sales_amount)
      if item.tax_flag
        calculate_amount_before_tax(amount)
      else
        amount
      end
    end
  end

  # 【修正】event_finbalance_assemblies 用に更新
  def calculate_taxable_amount
    items = @event_finbalance.event_finbalance_assemblies
    items.sum do |item|
      if item.tax_flag
        amount_with_tax = safe_number(item.sales_amount)
        calculate_amount_before_tax(amount_with_tax)
      else
        0
      end
    end
  end

  def calculate_tax
    taxable_amount = calculate_taxable_amount
    (taxable_amount * (@event_finbalance.tax_percent || 10) / 100).floor
  end

  def calculate_amount_before_tax(amount_with_tax)
    # sales_amountは税込み金額なので、税抜き = 税込み / (1 + 税率/100)
    tax_percent = @event_finbalance.tax_percent || 10
    amount_before_tax = amount_with_tax / (1 + tax_percent / 100.0)
    amount_before_tax.floor
  end

  def format_amount(amount)
    amount = safe_number(amount).to_i
    return '—' if amount == 0
    "¥#{number_with_delimiter(amount)}"
  end

  def format_unit_price(item, is_sales = false)
    if is_sales
      price = safe_number(item.sales_unit_price).to_i
    else
      price = safe_number(item.purchase_unit_price).to_i
    end
    currency = safe_string(item.currency)
    exchange_rate = safe_number(item.exchange_rate)
    
    # JPY または通貨未指定の場合
    if currency.blank? || currency == 'JPY'
      return "¥#{number_with_delimiter(price)}"
    end
    
    # 外貨の場合、換算レートで日本円に計算
    if exchange_rate > 0
      jpy_price = (price * exchange_rate).round.to_i
      "¥#{number_with_delimiter(jpy_price)}"
    else
      "¥#{number_with_delimiter(price)}"
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

  def safe_date(value)
    return '—' if value.nil?
    
    if value.is_a?(String)
      return value
    elsif value.respond_to?(:strftime)
      return value.strftime('%Y-%m-%d')
    end
    
    '—'
  end

  # 【追加】EventFinbalance に関連する Event の Client Company を取得
  def get_billing_company
    company_id = @event_finbalance.company_id
    return if company_id.blank?
    Company.find(company_id)
  end
end
