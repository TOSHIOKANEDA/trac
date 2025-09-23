import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = [
    "detailBody",
    "totalIncome",
    "totalExpense",
    "grandTotal"
  ]

  connect() {
    // 初期表示時に合計を計算
    this.calculateTotals()
  }

  // 1. 明細行を追加
  addItemRow(event) {
    const optionsHtml = document.querySelector("#finbalance-items").innerHTML
    const newIndex = new Date().getTime() // ユニークID
    const unitOptionsHtml = this.getUnitOptions()
    // 新しい行のHTML
    const newRow = document.createElement('tr')
    newRow.className = 'item-row'
    newRow.innerHTML = `
      <td class="item-name-cell">
        <select name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][finbalance_item_id]" 
                class="item-name-select" required>
          <option value="">項目を選択してください</option>
          ${optionsHtml}
        </select>
      </td>
      <td>
        <select name="quotation[event_finbalance_assemblies_attributes][${newIndex}][unit]" class="item-input unit-select">
          ${unitOptionsHtml}
        </select>
      </td>
      <td class="tax-cell">
        <label class="tax-label">
          <input type="hidden" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][tax_flag]" value="0" />
          <input type="checkbox" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][tax_flag]" 
                class="tax-check" value="1" data-action="change->event-finbalance-new#calculateTotals" />
        </label>
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][currency]" 
              class="item-input currency" data-action="input->event-finbalance-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][exchange_rate]" 
              class="item-input exchange-rate" data-action="input->event-finbalance-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][quantity]" 
              class="item-input quantity" data-action="input->event-finbalance-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][purchase_unit_price]" 
              class="item-input purchase-unit-price" data-action="input->event-finbalance-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][purchase_amount]" 
              class="item-input purchase-amount" readonly />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][sales_unit_price]" 
              class="item-input sales-unit-price" data-action="input->event-finbalance-new#calculateTotals" />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][sales_amount]" 
              class="item-input sales-amount" readonly />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][gross_profit]" 
              class="item-input gross-profit" readonly />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][gross_profit_rate]" 
              class="item-input gross-profit-rate" readonly />
      </td>
      <td>
        <input type="text" name="event_finbalance[event_finbalance_assemblies_attributes][${newIndex}][item_remark]" class="item-input" />
      </td>
      <td class="delete-cell">
        <button type="button" class="delete-item-btn" title="行を削除" 
                data-action="click->event-finbalance-new#deleteRow">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `
    
    // テーブルボディに行を追加
    this.detailBodyTarget.appendChild(newRow)
    
    // 合計を再計算
    this.calculateTotals()
  }

  getUnitOptions() {
    const optionsContainer = document.querySelector("#unit-options")
    if (optionsContainer) {
      return optionsContainer.innerHTML
    }
    return ''
  }

  // 2. 明細行を削除
  deleteRow(event) {
    event.preventDefault()
    const row = event.currentTarget.closest('tr')
    row.remove()
    this.calculateTotals()
  }

  // 3. 合計金額を計算
  calculateTotals() {
    let totalPurchaseAmount = 0
    let totalSalesAmount = 0
    let taxableSalesAmount = 0
    
    // 全ての明細行を取得
    const rows = this.detailBodyTarget.querySelectorAll('tr.item-row')
    
    rows.forEach(row => {
      // 各フィールドの値を取得（カンマを削除）
      const quantity = this.parseNumberInput(row.querySelector('.quantity')?.value) || 0
      const exchangeRate = this.parseNumberInput(row.querySelector('.exchange-rate')?.value) || 1
      const purchaseUnitPrice = this.parseNumberInput(row.querySelector('.purchase-unit-price')?.value) || 0
      const salesUnitPrice = this.parseNumberInput(row.querySelector('.sales-unit-price')?.value) || 0
      const currency = row.querySelector('.currency')?.value || 'JPY'
      const isTaxable = row.querySelector('.tax-check')?.checked || false
      
      // 換算レートの判定（円の場合は1）
      const effectiveRate = this.isJPY(currency) ? 1 : exchangeRate
      
      // 仕入金額を計算（小数点は切り捨て、税抜き金額）
      const purchaseAmount = Math.floor(quantity * purchaseUnitPrice * effectiveRate)
      const purchaseAmountInput = row.querySelector('.purchase-amount')
      if (purchaseAmountInput) {
        purchaseAmountInput.value = this.formatNumberWithComma(purchaseAmount)
      }
      
      // 売上金額を計算（小数点は切り捨て、税抜き金額）
      const salesAmount = Math.floor(quantity * salesUnitPrice * effectiveRate)
      const salesAmountInput = row.querySelector('.sales-amount')
      if (salesAmountInput) {
        salesAmountInput.value = this.formatNumberWithComma(salesAmount)
      }
      
      // 粗利を計算
      const grossProfit = salesAmount - purchaseAmount
      const grossProfitInput = row.querySelector('.gross-profit')
      if (grossProfitInput) {
        grossProfitInput.value = this.formatNumberWithComma(grossProfit)
      }
      
      // 粗利率を計算（小数点は切り捨て）
      const grossProfitRate = salesAmount !== 0 ? Math.floor((grossProfit / salesAmount) * 10000) / 100 : 0
      const grossProfitRateInput = row.querySelector('.gross-profit-rate')
      if (grossProfitRateInput) {
        grossProfitRateInput.value = grossProfitRate.toFixed(2) + '%'
      }
      
      // 合計に加算
      totalPurchaseAmount += purchaseAmount
      totalSalesAmount += salesAmount
      
      // tax_flagがtrueの場合のみ消費税対象に加算
      if (isTaxable) {
        taxableSalesAmount += salesAmount
      }
    })
    
    // 親フォームの値を取得
    const expenseInput = document.querySelector('input[name="event_finbalance[expense]"]')
    const incomeInput = document.querySelector('input[name="event_finbalance[income]"]')
    const smallTotalInput = document.querySelector('input[name="event_finbalance[small_total]"]')
    const taxPercentInput = document.querySelector('input[name="event_finbalance[tax_percent]"]')
    const comumptionTaxTotalInput = document.querySelector('input[name="event_finbalance[comumption_tax_total]"]')
    const totalAmountInput = document.querySelector('input[name="event_finbalance[total_amount]"]')
    const balanceInput = document.querySelector('input[name="event_finbalance[balance]"]')
    
    // 親レベルの計算
    const expense = totalPurchaseAmount
    const income = totalSalesAmount
    const taxPercent = this.parseNumberInput(taxPercentInput?.value) || 10
    const smallTotal = income // 小計 = 全売上（税抜き）
    const comumptionTaxTotal = Math.floor(taxableSalesAmount * taxPercent / 100) // 消費税（tax_flag=trueのみが対象）
    const totalAmount = smallTotal + comumptionTaxTotal
    const balance = income - expense
    
    // 親フォームに値を設定（カンマなし）
    if (expenseInput) {
      expenseInput.value = Math.floor(expense)
    }
    if (incomeInput) {
      incomeInput.value = Math.floor(income)
    }
    if (smallTotalInput) {
      smallTotalInput.value = Math.floor(smallTotal)
    }
    if (comumptionTaxTotalInput) {
      comumptionTaxTotalInput.value = Math.floor(comumptionTaxTotal)
    }
    if (totalAmountInput) {
      totalAmountInput.value = Math.floor(totalAmount)
    }
    if (balanceInput) {
      balanceInput.value = Math.floor(balance)
    }
    
    // 表示用にもカンマ付きで更新
    if (this.hasTotalExpenseTarget) {
      this.totalExpenseTarget.value = this.formatNumberWithComma(Math.floor(expense))
    }
    if (this.hasTotalIncomeTarget) {
      this.totalIncomeTarget.value = this.formatNumberWithComma(Math.floor(income))
    }
    if (this.hasGrandTotalTarget) {
      this.grandTotalTarget.value = this.formatNumberWithComma(Math.floor(balance))
    }
    
    // 詳細セクションの金額表示をカンマ付きで更新
    if (expenseInput) {
      expenseInput.value = this.formatNumberWithComma(Math.floor(expense))
    }
    if (incomeInput) {
      incomeInput.value = this.formatNumberWithComma(Math.floor(income))
    }
    if (smallTotalInput) {
      smallTotalInput.value = this.formatNumberWithComma(Math.floor(smallTotal))
    }
    if (comumptionTaxTotalInput) {
      comumptionTaxTotalInput.value = this.formatNumberWithComma(Math.floor(comumptionTaxTotal))
    }
    if (totalAmountInput) {
      totalAmountInput.value = this.formatNumberWithComma(Math.floor(totalAmount))
    }
    if (balanceInput) {
      balanceInput.value = this.formatNumberWithComma(Math.floor(balance))
    }
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

  // ヘルパー: テキスト入力フィールドから数値を抽出（カンマを削除）
  parseNumberInput(value) {
    if (!value) return 0
    const cleaned = value.toString().replace(/,/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
}
