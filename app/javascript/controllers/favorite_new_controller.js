import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["cargoTableBody", "accountingTableBody", "totalIncome", "totalExpense", "grandTotal", "uploadTableBody", "exportDocuments", "importDocuments", "shipmentSelect"]
  
  connect() {
    this.costItems = [
      "集荷費用", "保管料", "梱包費", "輸出通関手数料", "輸出税・関税", "検査費用",
      "海上運賃", "航空運賃", "B/L発行手数料", "CAF", "BAF", "DO費用",
      "海上保険料", "コンテナチャージ", "THC", "VGM申告費用", "輸入通関費用",
      "輸入関税", "現地配送費（仕向地側配送費）"
    ];
    this.uploadedFiles = {}; // アップロードされたファイル情報を管理
    this.setupFormInteractions();
    this.setupAutoSave();
    this.calculateTotals(); // 初期表示時の合計計算
  }

  // アコーディオン機能
  toggleSection(event) {
    const sectionId = event.currentTarget.dataset.section;
    const section = document.getElementById(sectionId);
    section.classList.toggle('collapsed');
  }

  // 貨物行を追加
  addCargoRow() {
    if (!this.hasCargoTableBodyTarget) return;
    
    const newRow = this.cargoTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td><input type="number" class="table-input"></td>
      <td><input type="text" class="table-input"></td>
      <td><input type="number" class="table-input"></td>
      <td><input type="number" class="table-input"></td>
      <td><input type="number" class="table-input"></td>
      <td>
        <button class="delete-row-btn" title="行を削除" data-action="click->favorite-new#deleteRow">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    this.setupFormInteractions();
  }

  // 輸送方法変更時の処理
  handleShipmentChange(event) {
    const shipmentType = event.target.value;
    
    if (this.hasExportDocumentsTarget && this.hasImportDocumentsTarget) {
      if (shipmentType === 'import') {
        this.exportDocumentsTarget.style.display = 'none';
        this.importDocumentsTarget.style.display = 'block';
      } else {
        this.exportDocumentsTarget.style.display = 'block';
        this.importDocumentsTarget.style.display = 'none';
      }
    }
  }

  // 保存
  save(event) {
    const button = event.currentTarget;
    const originalContent = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
    button.disabled = true;
    button.style.background = '#45a049';
    
    // 保存処理のシミュレーション
    setTimeout(() => {
      button.innerHTML = '<i class="fas fa-check"></i> 保存完了';
      button.style.background = '#4CAF50';
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
        button.style.background = '';
      }, 2000);
    }, 1500);
  }

  // フォーム要素のインタラクション設定
  setupFormInteractions() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea, .table-input, .table-select').forEach(input => {
      // 既存のイベントリスナーを削除（重複防止）
      input.removeEventListener('focus', this.handleFocus);
      input.removeEventListener('blur', this.handleBlur);
      input.removeEventListener('input', this.handleInput);
      
      // 新しいイベントリスナーを追加
      input.addEventListener('focus', this.handleFocus.bind(this));
      input.addEventListener('blur', this.handleBlur.bind(this));
      input.addEventListener('input', this.handleInput.bind(this));
    });

    // 収入・支出の入力フィールドに特別なイベントリスナーを追加
    document.querySelectorAll('.income-input, .expense-input').forEach(input => {
      input.removeEventListener('input', this.handleCalculationInput);
      input.addEventListener('input', this.handleCalculationInput.bind(this));
    });
  }

  // フォーカス時の処理
  handleFocus(event) {
    event.target.style.transform = 'translateY(-2px)';
    event.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
  }

  // ブラー時の処理
  handleBlur(event) {
    event.target.style.transform = 'translateY(0)';
    event.target.style.boxShadow = 'none';
  }

  // 入力時の処理（自動保存用）
  handleInput(event) {
    this.triggerAutoSave();
  }

  // 計算用の入力処理
  handleCalculationInput(event) {
    this.calculateTotals();
    this.triggerAutoSave();
  }

  // 選択肢作成
  createItemOptions() {
    return this.costItems.map(item => `<option value="${item}">${item}</option>`).join('');
  }

  // 支払い・請求管理テーブル行追加
  addAccountingRow() {
    if (!this.hasAccountingTableBodyTarget) return;

    const newRowTemplate = `
      <tr>
        <td>
          <select class="table-select item-select">
            <option value="">項目を選択してください</option>
            ${this.createItemOptions()}
          </select>
        </td>
        <td><input type="number" class="table-input income-input" placeholder="0" min="0" data-action="input->favorite-new#calculateTotals"></td>
        <td><input type="number" class="table-input expense-input" placeholder="0" min="0" data-action="input->favorite-new#calculateTotals"></td>
        <td><span class="balance-output">¥0</span></td>
        <td>
          <button class="delete-row-btn" title="行を削除" data-action="click->favorite-new#deleteRow">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;

    this.accountingTableBodyTarget.insertAdjacentHTML('beforeend', newRowTemplate);
    
    // 新しく追加された行にイベントリスナーを設定
    this.setupFormInteractions();
    this.calculateTotals();
  }

  // 行削除
  deleteRow(event) {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (row) {
      row.remove();
      this.calculateTotals();
    }
  }

  // 合計計算
  calculateTotals() {
    if (!this.hasAccountingTableBodyTarget) return;

    const rows = this.accountingTableBodyTarget.querySelectorAll('tr');
    let totalIncome = 0;
    let totalExpense = 0;

    rows.forEach(row => {
      const incomeInput = row.querySelector('.income-input');
      const expenseInput = row.querySelector('.expense-input');
      const balanceOutput = row.querySelector('.balance-output');

      if (!incomeInput || !expenseInput || !balanceOutput) return;

      const income = parseFloat(incomeInput.value) || 0;
      const expense = parseFloat(expenseInput.value) || 0;
      
      totalIncome += income;
      totalExpense += expense;
      
      const balance = income - expense;

      balanceOutput.textContent = this.formatCurrency(balance);
      balanceOutput.classList.toggle('negative', balance < 0);
    });
    
    const grandTotal = totalIncome - totalExpense;

    // テーブル合計を更新
    if (this.hasTotalIncomeTarget) {
      this.totalIncomeTarget.textContent = this.formatCurrency(totalIncome);
    }
    if (this.hasTotalExpenseTarget) {
      this.totalExpenseTarget.textContent = this.formatCurrency(totalExpense);
    }
    if (this.hasGrandTotalTarget) {
      this.grandTotalTarget.textContent = this.formatCurrency(grandTotal);
      this.grandTotalTarget.classList.toggle('negative', grandTotal < 0);
    }
  }

  // 通貨フォーマット
  formatCurrency(amount) {
    if (amount < 0) {
      return `(¥${Math.abs(amount).toLocaleString()})`;
    }
    return `¥${amount.toLocaleString()}`;
  }

  // ファイルアップロード処理
  handleFileUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const uploadIndex = fileInput.dataset.uploadIndex;
    
    if (!file) return;
    
    // ファイルサイズ制限（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ファイルサイズが10MBを超えています。');
      fileInput.value = '';
      return;
    }
    
    // 許可されたファイル形式
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('許可されていないファイル形式です。PDF、画像、Word、Excelファイルのみ対応しています。');
      fileInput.value = '';
      return;
    }
    
    // ファイル情報を保存
    this.uploadedFiles[uploadIndex] = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    };
    
    // UI更新
    this.updateFileInfo(uploadIndex, file.name);
    this.triggerAutoSave();
  }

  // ファイル削除
  deleteFile(event) {
    event.preventDefault();
    const uploadIndex = event.currentTarget.dataset.uploadIndex;
    
    if (confirm('このファイルを削除しますか？')) {
      // ファイル情報を削除
      delete this.uploadedFiles[uploadIndex];
      
      // ファイル入力をリセット
      const fileInput = document.getElementById(`file-${uploadIndex}`);
      if (fileInput) {
        fileInput.value = '';
      }
      
      // UI更新
      this.updateFileInfo(uploadIndex, null);
      this.triggerAutoSave();
    }
  }

  // ファイル情報表示の更新
  updateFileInfo(uploadIndex, fileName) {
    const fileInfoElement = document.querySelector(`[data-upload-target="fileInfo${uploadIndex}"]`);
    const deleteButton = document.querySelector(`[data-upload-index="${uploadIndex}"].delete-file-btn`);
    
    if (fileInfoElement) {
      const fileNameSpan = fileInfoElement.querySelector('.file-name');
      if (fileName) {
        fileNameSpan.textContent = fileName;
        fileInfoElement.classList.add('has-file');
        if (deleteButton) {
          deleteButton.disabled = false;
          deleteButton.classList.add('enabled');
        }
      } else {
        fileNameSpan.textContent = 'ファイル未選択';
        fileInfoElement.classList.remove('has-file');
        if (deleteButton) {
          deleteButton.disabled = true;
          deleteButton.classList.remove('enabled');
        }
      }
    }
  }

  // ファイルサイズを人間が読みやすい形式に変換
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 自動保存設定
  setupAutoSave() {
    this.autoSaveTimer = null;
  }

  // 自動保存実行
  triggerAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      console.log('自動保存実行');
      // 実際の自動保存ロジックをここに実装
      // this.saveFormData();
    }, 3000);
  }

  // フォームデータの収集（今後の実装用）
  collectFormData() {
    const formData = {
      stakeholders: {},
      transport: {},
      cargo: [],
      documents: {},
      accounting: [],
      files: this.uploadedFiles
    };
    
    // 各セクションのデータを収集
    // この部分は実際の保存処理に応じて実装
    
    return formData;
  }
}
