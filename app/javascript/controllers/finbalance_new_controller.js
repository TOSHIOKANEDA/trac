import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "accountingTableBody", "totalIncome", "totalExpense", "grandTotal","displayMarginInfo",
    "fileListPanel", "fileListPanelOverlay", "amountInput"
  ]

  connect() {
    // 初期表示で計算実行
    this.calculateTotals();
    this.amountInputTargets.forEach(input => {
      this.formatWithCommas({ target: input }) // 疑似イベントオブジェクトを渡す
    })
  }

  formatWithCommas(event) {
    const input = event.target
    const numericValue = input.value.replace(/,/g, '') // 既存カンマを除去
    if (!isNaN(numericValue) && numericValue !== "") {
      input.value = Number(numericValue).toLocaleString() // カンマ付きで再セット
    }
  }

  // ファイルパネル開く
  openFileListPanel(event) {
    event.preventDefault();
    this.fileListPanelOverlayTarget.classList.add('active');
    this.fileListPanelTarget.classList.add('active');
  }

  // ファイルパネル閉じる
  closeFileListPanel(event) {
    event.preventDefault();
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

  addAccountingRow(event) {
    const optionsHtml = document.querySelector("#finbalance-items").innerHTML;
    const newIndex = new Date().getTime(); // ユニークID
    const button = event.currentTarget;
    const isFavorite = button.dataset.finbalanceNewIsFavorite === "true";
    const namePrefix = isFavorite ? "favorite_" : "";

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>
        <select class="table-select item-select" required="required" name="${namePrefix}finbalance[${namePrefix}finbalance_assemblies_attributes][${newIndex}][finbalance_item_id]"
                id="${namePrefix}finbalance_favorite_finbalance_assemblies_attributes_${newIndex}_finbalance_item_id">
          <option value="">項目を選択してください</option>
          ${optionsHtml}
        </select>
      </td>
      <td>
        <input class="table-input income-input number-with-commas"
                placeholder="0"
                required="required"
                data-finbalance-new-target="amountInput"
                data-action="input-&gt;finbalance-new#formatWithCommas input-&gt;finbalance-new#calculateTotals"
                type="text" value="0" name="${namePrefix}finbalance[${namePrefix}finbalance_assemblies_attributes][${newIndex}][income_amount]"
                id="${namePrefix}finbalance_finbalance_assemblies_attributes_${newIndex}_income_amount"> 
      </td>
      <td>
        <input class="table-input expense-input number-with-commas"
                placeholder="0"
                required="required"
                data-finbalance-new-target="amountInput"
                data-action="input-&gt;finbalance-new#formatWithCommas input-&gt;finbalance-new#calculateTotals"
                type="text" value="0" name="${namePrefix}finbalance[${namePrefix}finbalance_assemblies_attributes][${newIndex}][cost_amount]"
                id="finbalance_finbalance_assemblies_attributes_${newIndex}_cost_amount">
      </td>
      <td>
        <input class="table-input balance-output"
                readonly="readonly" value="0"
                type="text"
                name="${namePrefix}finbalance[${namePrefix}finbalance_assemblies_attributes][${newIndex}][balance_amount]"
                id="${namePrefix}finbalance_finbalance_assemblies_attributes_${newIndex}_balance_amount">
      </td>
      <td>
        <input value="0" 
                class="discard-flag"
                autocomplete="off"
                type="hidden"
                name="${namePrefix}finbalance[${namePrefix}finbalance_assemblies_attributes][${newIndex}][_destroy]"
                id="${namePrefix}finbalance_finbalance_assemblies_attributes_${newIndex}__destroy">
        <button type="button"
                class="delete-row-btn"
                title="行を削除"
                data-action="click->finbalance-new#deleteRow">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    this.accountingTableBodyTarget.appendChild(newRow);
  }

  syncItem(event) {
    const itemId = event.target.value
    document.querySelectorAll(".income-item-id, .cost-item-id").forEach(el => {
      el.value = itemId
    })
  }

  // 行削除
  deleteRow(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    const tableBody = this.accountingTableBodyTarget
    const rows = tableBody.querySelectorAll('tr')

    // 行が1つしかない場合は削除不可
    if (rows.length <= 1) {
      alert("これ以上削除できません。最低1行は必要です。")
      return
    }

    // hidden input を探す（論理削除用）
    const discardInput = row.querySelector('.discard-flag');

    if (discardInput) {
      // 論理削除: 既存行も新規追加行も対応
      discardInput.value = "1"; // Rails 側で discard フラグ扱い
      row.style.display = "none"; // 行を非表示
    } else {
      // ここに入ることはない想定
      row.remove();
    }

    this.calculateTotals();
  }

  // 合計計算
  calculateTotals() {
    const rows = this.accountingTableBodyTarget.querySelectorAll('tr');
    let totalIncome = 0;
    let totalExpense = 0;

    rows.forEach(row => {
      // 論理削除済みの行はスキップ
      const discardInput = row.querySelector('.discard-flag');
      if (discardInput && discardInput.value === "1") return;

      const incomeInput = row.querySelector('.income-input');
      const expenseInput = row.querySelector('.expense-input');
      const balanceField = row.querySelector('.balance-output');

      // カンマを除去して数値化
      const income = parseFloat((incomeInput?.value || "0").replace(/,/g, "")) || 0;
      const expense = parseFloat((expenseInput?.value || "0").replace(/,/g, "")) || 0;

      totalIncome += income;
      totalExpense += expense;

      const balance = income - expense;
      if (balanceField) {
        balanceField.value = balance.toLocaleString();
        balanceField.classList.toggle('negative', balance < 0);
      }
    });

    const grandTotal = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? ((grandTotal / totalIncome) * 100) : 0;

    // 合計欄の更新（カンマ付き表示）
    this.totalIncomeTarget.textContent = `¥${totalIncome.toLocaleString()}`;
    this.totalExpenseTarget.textContent = `¥${totalExpense.toLocaleString()}`;
    this.grandTotalTarget.textContent = `¥${grandTotal.toLocaleString()}`;
    this.grandTotalTarget.classList.toggle('negative', grandTotal < 0);
    this.grandTotalTarget.style.color = grandTotal < 0 ? '#c72c41' : '#333';

    this.displayMarginInfoTarget.textContent = this.formatPercentage(margin.toFixed(1));
    this.displayMarginInfoTarget.style.color = margin < 0 ? '#c72c41' : '#333';
  }
}
