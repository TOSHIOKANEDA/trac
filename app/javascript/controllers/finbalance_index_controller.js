import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "dataTableBody", "blFilter", "idFilter", "typeFilter", "methodFilter", 
    "loadingPortFilter", "dischargePortFilter", "billingFilter", "monthFilter"
  ]
  
  connect() {
    // サンプルデータ
    this.financeData = [
      {
        id: 1001,
        bl_no: 'BL-12345',
        event_id: 'X8J2LQ9',
        type: '輸出',
        method: 'FCL',
        loading_port_name: 'Shanghai',
        loading_port_code: 'SHA',
        discharge_port_name: 'Tokyo',
        discharge_port_code: 'TYO',
        billing_company: 'ABC Solutions Co., Ltd.',
        etd: '2025-07-20T18:00:00',
        eta: '2025-08-05T09:30:00',
        containers: '2x40HC',
        accounting_month: '2025-07',
        income: 850000,
        expense: 720000,
        profit: 130000,
        profit_margin: 15.3
      },
      {
        id: 1002,
        bl_no: 'BL-67890',
        event_id: 'A7ZK3YD',
        type: '輸入',
        method: 'LCL',
        loading_port_name: 'Los Angeles',
        loading_port_code: 'LAX',
        discharge_port_name: 'Osaka',
        discharge_port_code: 'OSA',
        billing_company: 'XYZ Trading Ltd.',
        etd: '2025-07-25T22:00:00',
        eta: '2025-07-28T10:00:00',
        containers: '3x20FT',
        accounting_month: '2025-07',
        income: 320000,
        expense: 280000,
        profit: 40000,
        profit_margin: 12.5
      },
      {
        id: 1003,
        bl_no: 'BL-ABCDE',
        event_id: 'C1PXV6E',
        type: '輸出',
        method: 'AIR',
        loading_port_name: 'Narita Airport',
        loading_port_code: 'NRT',
        discharge_port_name: 'Singapore Airport',
        discharge_port_code: 'SIN',
        billing_company: 'DEF Corporation',
        etd: '2025-07-23T15:00:00',
        eta: '2025-07-24T08:00:00',
        containers: '1x40FT',
        accounting_month: '2025-07',
        income: 180000,
        expense: 160000,
        profit: 20000,
        profit_margin: 11.1
      },
      {
        id: 1004,
        bl_no: 'BL-FGHIJ',
        event_id: 'T9BQL0M',
        type: '輸入',
        method: 'FCL',
        loading_port_name: 'Bangkok',
        loading_port_code: 'BKK',
        discharge_port_name: 'Yokohama',
        discharge_port_code: 'YOK',
        billing_company: 'GHI Logistics Japan Inc.',
        etd: '2025-07-15T11:00:00',
        eta: '2025-07-23T14:00:00',
        containers: '1x20FT',
        accounting_month: '2025-07',
        income: 420000,
        expense: 390000,
        profit: 30000,
        profit_margin: 7.1
      }
    ];

    this.displayedData = [...this.financeData];
    this.renderTable();
  }

  // 計上月フォーマット（YYYY年MM月形式）
  formatAccountingMonth(monthString) {
    if (!monthString) return 'N/A';
    const [year, month] = monthString.split('-');
    return `${year}年${month}月`;
  }

  // 日時フォーマット（月日のみ）
  formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ja-JP', { 
      month: '2-digit', 
      day: '2-digit'
    });
  }

  // 金額フォーマット
  formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // パーセンテージフォーマット
  formatPercentage(value) {
    return `${value.toFixed(1)}%`;
  }

  // Method badge クラス取得
  getMethodBadgeClass(method) {
    const methodClasses = {
      'FCL': 'method-fcl',
      'LCL': 'method-lcl',
      'AIR': 'method-air'
    };
    return methodClasses[method] || '';
  }

  // テーブル描画
  renderTable() {
    const tbody = this.dataTableBodyTarget;
    tbody.innerHTML = '';

    this.displayedData.forEach(item => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td class="text-sm font-medium">${item.bl_no}</td>
        <td class="text-sm font-medium">${item.event_id}</td>
        <td>
          <span class="type-badge ${item.type === '輸出' ? 'type-export' : 'type-import'}">${item.type}</span>
        </td>
        <td>
          <span class="method-badge ${this.getMethodBadgeClass(item.method)}">${item.method}</span>
        </td>
        <td class="port-info">
          <div class="port-row port-loading">${item.loading_port_name}</div>
          <div class="port-row port-discharge">${item.discharge_port_name}</div>
        </td>
        <td class="multi-line-cell">
          <div class="cell-row">
            <div class="cell-value">${item.billing_company}</div>
          </div>
        </td>
        <td class="multi-line-cell">
          <div class="cell-row">
            <span class="cell-value">ATD：${this.formatDateTime(item.eta)}</span>
          </div>
          <div class="cell-row">
            <span class="cell-value">ATA：${this.formatDateTime(item.etd)}</span>
          </div>
        </td>
        <td class="text-sm font-medium">${item.containers}</td>
        <td class="text-sm">${this.formatAccountingMonth(item.accounting_month)}</td>
        <td class="financial-summary">
          <div class="financial-row">
            <span class="financial-label">収入</span>
            <span class="financial-value text-income">${this.formatCurrency(item.income)}</span>
          </div>
          <div class="financial-row">
            <span class="financial-label">支出</span>
            <span class="financial-value text-expense">${this.formatCurrency(item.expense)}</span>
          </div>
          <div class="financial-row financial-calculation">
            <span class="financial-label">差引</span>
            <span class="financial-value financial-total ${item.profit < 0 ? 'negative' : ''}">${this.formatCurrency(item.profit)}</span>
          </div>
          <div class="financial-row">
            <span class="financial-label">利益率</span>
            <span class="financial-value financial-margin ${item.profit_margin < 0 ? 'negative' : ''}">${this.formatPercentage(item.profit_margin)}</span>
          </div>
        </td>
        <td>
          <a href="#" class="action-link">
            <i class="fas fa-edit"></i> 編集
          </a>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }

  // フィルター適用
  applyFilters() {
    const blFilter = this.blFilterTarget.value.toLowerCase();
    const idFilter = this.idFilterTarget.value.toLowerCase();
    const typeFilter = this.typeFilterTarget.value;
    const methodFilter = this.methodFilterTarget.value;
    const loadingPortFilter = this.loadingPortFilterTarget.value;
    const dischargePortFilter = this.dischargePortFilterTarget.value;
    const billingFilter = this.billingFilterTarget.value.toLowerCase();
    const monthFilter = this.monthFilterTarget.value;

    this.displayedData = this.financeData.filter(item => {
      const blMatch = !blFilter || item.bl_no.toLowerCase().includes(blFilter);
      const idMatch = !idFilter || item.event_id.toLowerCase().includes(idFilter);
      const typeMatch = !typeFilter || item.type === typeFilter;
      const methodMatch = !methodFilter || item.method === methodFilter;
      const loadingPortMatch = !loadingPortFilter || item.loading_port_code === loadingPortFilter;
      const dischargePortMatch = !dischargePortFilter || item.discharge_port_code === dischargePortFilter;
      const billingMatch = !billingFilter || item.billing_company.toLowerCase().includes(billingFilter);
      const monthMatch = !monthFilter || item.accounting_month === monthFilter;

      return blMatch && idMatch && typeMatch && methodMatch && loadingPortMatch && dischargePortMatch && billingMatch && monthMatch;
    });

    this.renderTable();
  }

  // テーブルソート
  sortTable(event) {
    const column = event.currentTarget.dataset.column;
    const currentDirection = event.currentTarget.dataset.direction || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // すべてのソートボタンからactiveクラスを削除
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
    
    // 現在のボタンにactiveクラスを追加
    event.currentTarget.classList.add('active');
    event.currentTarget.dataset.direction = newDirection;

    this.displayedData.sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'bl':
          aValue = a.bl_no;
          bValue = b.bl_no;
          break;
        case 'id':
          aValue = a.event_id;
          bValue = b.event_id;
          break;
        case 'income':
          aValue = a.income;
          bValue = b.income;
          break;
        case 'expense':
          aValue = a.expense;
          bValue = b.expense;
          break;
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        case 'margin':
          aValue = a.profit_margin;
          bValue = b.profit_margin;
          break;
        case 'containers':
          aValue = a.containers;
          bValue = b.containers;
          break;
        case 'accounting':
          aValue = a.accounting_month;
          bValue = b.accounting_month;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    this.renderTable();
  }

  // データエクスポート
  exportData() {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `支払い・請求管理管理_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // CSV生成
  generateCSV() {
    const headers = [
      'B/L番号', 'ID番号', '輸出/輸入', 'Method', '積み地', '揚げ地', 
      '請求先情報', 'ETD', 'ETA', 'コンテナ本数', '計上月', 
      '収入', '支出', '差引支払い・請求管理', '利益率'
    ];
    
    const rows = this.displayedData.map(item => [
      item.bl_no,
      item.event_id,
      item.type,
      item.method,
      item.loading_port_name,
      item.discharge_port_name,
      item.billing_company,
      this.formatDateTime(item.etd),
      this.formatDateTime(item.eta),
      item.containers,
      item.accounting_month,
      item.income,
      item.expense,
      item.profit,
      item.profit_margin
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return '\uFEFF' + csvContent; // BOM for Excel compatibility
  }
}
