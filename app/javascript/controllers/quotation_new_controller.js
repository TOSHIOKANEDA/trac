import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = [
    "quotationDetailBody",
    "quotationCompanyBody",
    "totalIncome",
    "totalExpense",
    "totalAmount",
    "grandTotal",
    "displayMarginInfo",
    "exportItems",
    "freightItems",
    "importItems"
  ]

  connect() {
    // 初期表示時に合計を計算
    this.calculateTotals()
    
    // 既存の入力フィールドにイベントリスナーを追加
    this.addInputListeners()
  }

  // 1. 明細行を追加（輸出費用/運賃/輸入費用）
  addClientRow(event) {
    const button = event.currentTarget
    const section = button.dataset.section // "export", "freight", "import"
    const optionsHtml = document.querySelector("#finbalance-items").innerHTML
    const newIndex = new Date().getTime() // ユニークID
    
    // セクションヘッダーの次の位置を探す
    const sectionHeaderRow = this.findSectionHeaderRow(section)
    
    // 新しい行のHTML（Railsのfields_forと同じ構造）
    const newRow = document.createElement('tr')
    newRow.className = 'item-row'
    newRow.dataset.section = section
    newRow.innerHTML = `
      <td class="item-name-cell">
        <input type="hidden" name="quotation[quotation_items_attributes][${newIndex}][section]" value="${section}" />
        <select name="quotation[quotation_items_attributes][${newIndex}][finbalance_item_id]" 
                class="item-name-select" required>
          <option value="">項目を選択してください</option>
          ${optionsHtml}
        </select>
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][unit]" class="item-input" />
      </td>
      <td class="tax-cell">
        <label class="tax-label">
          <input type="hidden" name="quotation[quotation_items_attributes][${newIndex}][tax_flag]" value="0" />
          <input type="checkbox" name="quotation[quotation_items_attributes][${newIndex}][tax_flag]" 
                class="tax-check" value="1" data-action="change->quotation-new#calculateTotals" />
        </label>
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][currency]" 
              class="item-input currency" data-action="input->quotation-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][exchange_rate]" 
              class="item-input exchange-rate" data-action="input->quotation-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][quantity]" 
              class="item-input quantity" data-action="input->quotation-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][purchase_unit_price]" 
              class="item-input purchase-unit-price" data-action="input->quotation-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][purchase_amount]" 
              class="item-input purchase-amount" readonly />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][sales_unit_price]" 
              class="item-input sales-unit-price" data-action="input->quotation-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][sales_amount]" 
              class="item-input sales-amount" readonly />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][gross_profit]" 
              class="item-input gross-profit" readonly />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][gross_profit_rate]" 
              class="item-input gross-profit-rate" readonly />
      </td>
      <td>
        <input type="text" name="quotation[quotation_items_attributes][${newIndex}][item_remark]" class="item-input" />
      </td>
      <td class="delete-cell">
        <button type="button" class="delete-item-btn" title="行を削除" 
                data-target-name="${section}Items"
                data-action="click->quotation-new#deleteRow">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `
    
    // セクションの最後に挿入
    this.insertRowAfterSection(sectionHeaderRow, newRow, section)
    
    // 新しい行の入力フィールドにもリスナーを追加
    this.calculateTotals()
  }

  // 2. ベンダー行を追加
  addCompanyRow(event) {
    const newIndex = new Date().getTime()
    const companies = this.getCompanyOptions()
    
    const newCompanyRow = document.createElement('div')
    newCompanyRow.className = 'form-group'
    newCompanyRow.innerHTML = `
      <select name="quotation[quotation_companies_attributes][${newIndex}][company_id]" class="form-select">
        <option value="">選択してください</option>
        ${companies}
      </select>
      <button type="button" class="btn btn-danger btn-sm" data-action="click->quotation-new#removeCompanyRow" style="margin-left: 10px;">
        <i class="fas fa-trash"></i> 削除
      </button>
    `
    
    this.quotationCompanyBodyTarget.appendChild(newCompanyRow)
  }

  // 3. 明細行を削除
  deleteRow(event) {
    const row = event.currentTarget.closest('tr')
    
    // 既存レコードの場合は_destroyフラグを立てる
    const idInput = row.querySelector('input[name*="[id]"]')
    if (idInput) {
      // 既存レコードの場合は非表示にして_destroyフラグを立てる
      row.style.display = 'none'
      const destroyInput = document.createElement('input')
      destroyInput.type = 'hidden'
      destroyInput.name = idInput.name.replace('[id]', '[_destroy]')
      destroyInput.value = '1'
      row.appendChild(destroyInput)
    } else {
      // 新規行の場合は単純に削除
      row.remove()
    }
    
    this.calculateTotals()
  }

  // 4. ベンダー行を削除
  removeCompanyRow(event) {
    const row = event.currentTarget.closest('.form-group')
    row.remove()
  }

  // 5. 合計金額を計算（完全版ロジック）
  calculateTotals() {
    const TAX_RATE = 0.10 // 消費税率10%
    let totalPurchaseAmount = 0
    let totalSalesAmount = 0
    
    // 全ての明細行を取得（非表示の行は除外）
    const rows = this.quotationDetailBodyTarget.querySelectorAll('tr.item-row:not([style*="display: none"])')
    
    rows.forEach(row => {
      // 各フィールドの値を取得
      const quantity = parseFloat(row.querySelector('.quantity')?.value) || 0
      const exchangeRate = parseFloat(row.querySelector('.exchange-rate')?.value) || 1
      const purchaseUnitPrice = parseFloat(row.querySelector('.purchase-unit-price')?.value) || 0
      const salesUnitPrice = parseFloat(row.querySelector('.sales-unit-price')?.value) || 0
      const currency = row.querySelector('.currency')?.value || 'JPY'
      const isTaxable = row.querySelector('.tax-check')?.checked || false
      
      // 換算レートの判定（円の場合は1）
      const effectiveRate = this.isJPY(currency) ? 1 : exchangeRate
      
      // 仕入金額を計算
      const basePurchaseAmount = quantity * purchaseUnitPrice * effectiveRate
      const purchaseAmount = isTaxable ? basePurchaseAmount * (1 + TAX_RATE) : basePurchaseAmount
      const purchaseAmountInput = row.querySelector('.purchase-amount')
      if (purchaseAmountInput) {
        purchaseAmountInput.value = this.roundAmount(purchaseAmount)
      }
      
      // 売上金額を計算
      const baseSalesAmount = quantity * salesUnitPrice * effectiveRate
      const salesAmount = isTaxable ? baseSalesAmount * (1 + TAX_RATE) : baseSalesAmount
      const salesAmountInput = row.querySelector('.sales-amount')
      if (salesAmountInput) {
        salesAmountInput.value = this.roundAmount(salesAmount)
      }
      
      // 粗利を計算
      const grossProfit = salesAmount - purchaseAmount
      const grossProfitInput = row.querySelector('.gross-profit')
      if (grossProfitInput) {
        grossProfitInput.value = this.roundAmount(grossProfit)
      }
      
      // 粗利率を計算
      const grossProfitRate = salesAmount !== 0 ? (grossProfit / salesAmount * 100) : 0
      const grossProfitRateInput = row.querySelector('.gross-profit-rate')
      if (grossProfitRateInput) {
        grossProfitRateInput.value = grossProfitRate.toFixed(2) + '%'
      }
      
      // 合計に加算
      totalPurchaseAmount += purchaseAmount
      totalSalesAmount += salesAmount
    })
    
    // 総差額（粗利合計）を計算
    const grandTotal = totalSalesAmount - totalPurchaseAmount
    
    // 総利益率を計算
    const overallMargin = totalSalesAmount !== 0 ? (grandTotal / totalSalesAmount * 100) : 0
    
    // 表示を更新
    if (this.hasTotalIncomeTarget) {
      this.totalIncomeTarget.textContent = '¥' + this.formatNumber(totalPurchaseAmount)
    }
    
    if (this.hasTotalExpenseTarget) {
      this.totalExpenseTarget.textContent = '¥' + this.formatNumber(totalSalesAmount)
      const totalAmountInput = document.querySelector('.total-amount')
      if (totalAmountInput) {
        totalAmountInput.value = this.roundAmount(totalSalesAmount)
      }
    }
    
    if (this.hasGrandTotalTarget) {
      this.grandTotalTarget.textContent = '¥' + this.formatNumber(grandTotal)
    }
    
    if (this.hasDisplayMarginInfoTarget) {
      this.displayMarginInfoTarget.textContent = overallMargin.toFixed(2) + '%'
    }
  }

  // 6. 既存の入力フィールドにイベントリスナーを追加
  addInputListeners() {
    const inputs = this.element.querySelectorAll('.quantity, .exchange-rate, .purchase-unit-price, .sales-unit-price, .currency')
    inputs.forEach(input => {
      if (!input.dataset.listenerAdded) {
        input.addEventListener('input', () => this.calculateTotals())
        input.dataset.listenerAdded = 'true'
      }
    })
    
    // 課税チェックボックスにもリスナーを追加
    const checkboxes = this.element.querySelectorAll('.tax-check')
    checkboxes.forEach(checkbox => {
      if (!checkbox.dataset.listenerAdded) {
        checkbox.addEventListener('change', () => this.calculateTotals())
        checkbox.dataset.listenerAdded = 'true'
      }
    })
  }

  // ヘルパー: 通貨が円かどうかを判定
  isJPY(currency) {
    if (!currency) return true
    const normalizedCurrency = currency.trim().toUpperCase()
    return normalizedCurrency === 'JPY' || 
           normalizedCurrency === '円' || 
           normalizedCurrency === 'YEN' ||
           normalizedCurrency === '¥'
  }

  // ヘルパー: 金額を丸める（小数点2桁）
  roundAmount(amount) {
    return Math.round(amount * 100) / 100
  }

  // ヘルパー: セクションヘッダー行を探す
  findSectionHeaderRow(section) {
    const rows = this.quotationDetailBodyTarget.querySelectorAll('tr')
    for (let row of rows) {
      const headerCell = row.querySelector('.section-header-cell')
      if (headerCell) {
        // セクション名からキーを判定（簡易版）
        const text = headerCell.textContent.trim()
        if ((section === 'export' && text.includes('輸出')) ||
            (section === 'freight' && text.includes('運賃')) ||
            (section === 'import' && text.includes('輸入'))) {
          return row
        }
      }
    }
    return null
  }

  // ヘルパー: セクションの最後に行を挿入
  insertRowAfterSection(sectionHeaderRow, newRow, section) {
    if (!sectionHeaderRow) {
      this.quotationDetailBodyTarget.appendChild(newRow)
      return
    }
    
    let currentRow = sectionHeaderRow.nextElementSibling
    let lastRowInSection = sectionHeaderRow
    
    // 同じセクションの最後の行を探す
    while (currentRow && !currentRow.querySelector('.section-header-cell')) {
      if (currentRow.dataset.section === section || 
          currentRow.querySelector(`input[value="${section}"]`)) {
        lastRowInSection = currentRow
      }
      currentRow = currentRow.nextElementSibling
    }
    
    // 最後の行の次に挿入
    lastRowInSection.insertAdjacentElement('afterend', newRow)
  }

  // ヘルパー: ベンダーオプションを取得
  getCompanyOptions() {
    const optionsContainer = document.querySelector("#company-options")
    if (optionsContainer) {
      return optionsContainer.innerHTML
    }
    // フォールバック：既存のselectから取得
    const existingSelect = this.quotationCompanyBodyTarget.querySelector('select')
    if (existingSelect) {
      return existingSelect.innerHTML
    }
    return ''
  }

  // ヘルパー: 数値をカンマ区切りにフォーマット
  formatNumber(num) {
    return Math.round(num).toLocaleString('ja-JP')
  }
}
