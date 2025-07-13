import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "accountingTableBody", "totalIncome", "totalExpense", "grandTotal",
    "displayIncomeInfo", "displayExpenseInfo", "displayProfitInfo", "displayMarginInfo",
    "fileListPanel", "fileListPanelOverlay"
  ]

  connect() {
    this.costItems = [
      "集荷費用", "保管料", "梱包費", "輸出通関手数料", "輸出税・関税", "検査費用",
      "海上運賃", "航空運賃", "B/L発行手数料", "CAF", "BAF", "DO費用",
      "海上保険料", "コンテナチャージ", "THC", "VGM申告費用", "輸入通関費用",
      "輸入関税", "現地配送費（仕向地側配送費）"
    ];

    // 初期表示で計算実行
    this.calculateTotals();
  }

  // ファイルパネル開く
  openFileListPanel() {
    this.fileListPanelOverlayTarget.classList.add('active');
    this.fileListPanelTarget.classList.add('active');
  }

  // ファイルパネル閉じる
  closeFileListPanel() {
    this.fileListPanelOverlayTarget.classList.remove('active');
    this.fileListPanelTarget.classList.remove('active');
  }

  // 通貨フォーマット
  formatCurrency(amount) {
    if (amount < 0) {
      return `(¥${Math.abs(amount).toLocaleString()})`;
    }
    return `¥${amount.toLocaleString()}`;
  }

  // パーセンテージフォーマット
  formatPercentage(percent) {
    return `${percent}%`;
  }

  // 選択肢作成
  createItemOptions() {
    return this.costItems.map(item => `<option value="${item}">${item}</option>`).join('');
  }

  // 行追加
  addAccountingRow() {
    const newRowTemplate = `
      <tr>
        <td>
          <select class="table-select item-select">
            <option value="">項目を選択してください</option>
            ${this.createItemOptions()}
          </select>
        </td>
        <td><input type="number" class="table-input income-input" placeholder="0" min="0" data-action="input->finbalance-new#calculateTotals"></td>
        <td><input type="number" class="table-input expense-input" placeholder="0" min="0" data-action="input->finbalance-new#calculateTotals"></td>
        <td><span class="balance-output">¥0</span></td>
        <td>
          <button class="delete-row-btn" title="行を削除" data-action="click->finbalance-new#deleteRow">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;

    this.accountingTableBodyTarget.insertAdjacentHTML('beforeend', newRowTemplate);
  }

  // 行削除
  deleteRow(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    row.remove();
    this.calculateTotals();
  }

  // 合計計算
  calculateTotals() {
    const rows = this.accountingTableBodyTarget.querySelectorAll('tr');
    let totalIncome = 0;
    let totalExpense = 0;

    rows.forEach(row => {
      const incomeInput = row.querySelector('.income-input');
      const expenseInput = row.querySelector('.expense-input');
      const balanceOutput = row.querySelector('.balance-output');

      const income = parseFloat(incomeInput.value) || 0;
      const expense = parseFloat(expenseInput.value) || 0;
      
      totalIncome += income;
      totalExpense += expense;
      
      const balance = income - expense;

      balanceOutput.textContent = `¥${balance.toLocaleString()}`;
      balanceOutput.classList.toggle('negative', balance < 0);
    });
    
    const grandTotal = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? ((grandTotal / totalIncome) * 100) : 0;

    // テーブル合計を更新
    this.totalIncomeTarget.textContent = `¥${totalIncome.toLocaleString()}`;
    this.totalExpenseTarget.textContent = `¥${totalExpense.toLocaleString()}`;
    this.grandTotalTarget.textContent = `¥${grandTotal.toLocaleString()}`;
    this.grandTotalTarget.classList.toggle('negative', grandTotal < 0);

    // 案件情報表示を更新
    this.displayIncomeInfoTarget.textContent = this.formatCurrency(totalIncome);
    this.displayExpenseInfoTarget.textContent = this.formatCurrency(totalExpense);
    
    this.displayProfitInfoTarget.textContent = this.formatCurrency(grandTotal);
    this.displayProfitInfoTarget.style.color = grandTotal < 0 ? '#c72c41' : '#333';
    
    this.displayMarginInfoTarget.textContent = this.formatPercentage(margin.toFixed(1));
    this.displayMarginInfoTarget.style.color = margin < 0 ? '#c72c41' : '#17a2b8';
  }

  // 保存
  saveRecord() {
    const rows = this.accountingTableBodyTarget.querySelectorAll('tr');
    
    if (rows.length === 0) {
      alert('支払い・請求管理項目を最低1つは入力してください。');
      return;
    }

    // 実際のアプリケーションでは、ここでサーバーにデータを送信
    alert('支払い・請求管理情報が保存されました。');
  }
}
