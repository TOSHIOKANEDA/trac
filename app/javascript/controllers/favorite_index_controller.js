import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "typeFilter", "nameSearch", "loadingPortSearch", 
    "dischargePortSearch", "shipperSearch", "consigneeSearch",
    "projectTableBody"
  ]
  
  connect() {
    // プロジェクトデータ
    this.projects = [
      { 
        name: 'ここは好きに設定できる名前',
        type: '輸出',
        shipper: 'ABC Solutions Co., Ltd. Tokyo Branch',
        consignee: 'ABC Solutions USA, Inc. Los Angeles Office',
        loading_port: 'Shanghai',
        discharge_port: 'Kobe'
      },
      { 
        name: 'わかりやすく入力してね案件',
        type: '輸入',
        shipper: 'Suzuki Trading Co., Ltd. Aomori',
        consignee: 'Fresh Fruits Import Inc. Yokohama',
        loading_port: 'Seattle',
        discharge_port: 'Yokohama'
      },
      { 
        name: '山田食品の冷凍肉案件',
        type: '輸入',
        shipper: 'Yamada Foods Co., Ltd. Sapporo',
        consignee: 'Meat Distributors Ltd. Osaka',
        loading_port: 'New York',
        discharge_port: 'Osaka'
      },
      { 
        name: '高橋工業の機械部品案件',
        type: '輸出',
        shipper: 'Takahashi Industries Ltd. Nagoya',
        consignee: 'Global Machinery Corp. Hamburg',
        loading_port: 'Nagoya',
        discharge_port: 'Hamburg'
      },
      { 
        name: '佐藤水産の鮭案件',
        type: '輸出',
        shipper: 'Sato Marine Products Hokkaido',
        consignee: 'Seafood Imports Inc. Vancouver',
        loading_port: 'Hakodate',
        discharge_port: 'Vancouver'
      },
      { 
        name: '伊藤商会の衣料案件',
        type: '輸入',
        shipper: 'Milan Fashion Export S.p.A.',
        consignee: 'Ito Shokai Ltd. Tokyo',
        loading_port: 'Genoa',
        discharge_port: 'Tokyo'
      },
      { 
        name: '小林農産の米案件',
        type: '輸出',
        shipper: 'Kobayashi Agri Co., Ltd. Niigata',
        consignee: 'Rice Trading Inc. Bangkok',
        loading_port: 'Niigata',
        discharge_port: 'Bangkok'
      },
      { 
        name: '松本酒造の日本酒案件',
        type: '輸出',
        shipper: 'Matsumoto Sake Brewery Kyoto',
        consignee: 'Sake Lovers Co. San Francisco',
        loading_port: 'Osaka',
        discharge_port: 'San Francisco'
      },
      { 
        name: '加藤化学の薬品案件',
        type: '輸入',
        shipper: 'ChemSupply GmbH Berlin',
        consignee: 'Kato Chemical Ltd. Tokyo',
        loading_port: 'Hamburg',
        discharge_port: 'Tokyo'
      },
      { 
        name: '中村木材の木材案件',
        type: '輸出',
        shipper: 'Nakamura Lumber Co. Nagano',
        consignee: 'Timber World Ltd. Sydney',
        loading_port: 'Nagoya',
        discharge_port: 'Sydney'
      },
      { 
        name: '渡辺製菓のお菓子案件',
        type: '輸出',
        shipper: 'Watanabe Seika Tokyo',
        consignee: 'Sweet Imports Inc. Los Angeles',
        loading_port: 'Tokyo',
        discharge_port: 'Los Angeles'
      },
      { 
        name: '藤田電機の電子部品案件',
        type: '輸出',
        shipper: 'Fujita Electronics Osaka',
        consignee: 'TechParts Ltd. Singapore',
        loading_port: 'Osaka',
        discharge_port: 'Singapore'
      }
    ];

    this.displayedProjects = [...this.projects];
    this.renderProjectTable();
  }

  // プロジェクトテーブルを描画
  renderProjectTable() {
    this.projectTableBodyTarget.innerHTML = '';

    this.displayedProjects.forEach(project => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <span class="type-badge ${project.type === '輸出' ? 'type-export' : 'type-import'}">${project.type}</span>
        </td>
        <td class="text-sm">
          <div class="truncate-text" title="${project.name || ''}">${project.name || 'N/A'}</div>
        </td>
        <td class="text-sm font-medium">${project.loading_port || 'N/A'}</td>
        <td class="text-sm font-medium">${project.discharge_port || 'N/A'}</td>
        <td class="text-sm">
          <div class="truncate-text" title="${project.shipper || ''}">${project.shipper || 'N/A'}</div>
        </td>
        <td class="text-sm">
          <div class="truncate-text" title="${project.consignee || ''}">${project.consignee || 'N/A'}</div>
        </td>
        <td>
          <a href="#" class="action-link">
            <i class="fas fa-edit"></i> 編集
          </a>
        </td>
        <td>
          <a href="#" class="action-link">
            <i class="fas fa-plus"></i> 案件登録
          </a>
        </td>
      `;
      this.projectTableBodyTarget.appendChild(row);
    });
  }

  // フィルター機能
  filterProjects() {
    const typeFilter = this.typeFilterTarget.value;
    const nameSearch = this.nameSearchTarget.value.toLowerCase();
    const loadingPortSearch = this.loadingPortSearchTarget.value.toLowerCase();
    const dischargePortSearch = this.dischargePortSearchTarget.value.toLowerCase();
    const shipperSearch = this.shipperSearchTarget.value.toLowerCase();
    const consigneeSearch = this.consigneeSearchTarget.value.toLowerCase();

    this.displayedProjects = this.projects.filter(project => {
      const typeMatch = !typeFilter || project.type === typeFilter;
      const nameMatch = !nameSearch || (project.name && project.name.toLowerCase().includes(nameSearch));
      const loadingPortMatch = !loadingPortSearch || (project.loading_port && project.loading_port.toLowerCase().includes(loadingPortSearch));
      const dischargePortMatch = !dischargePortSearch || (project.discharge_port && project.discharge_port.toLowerCase().includes(dischargePortSearch));
      const shipperMatch = !shipperSearch || (project.shipper && project.shipper.toLowerCase().includes(shipperSearch));
      const consigneeMatch = !consigneeSearch || (project.consignee && project.consignee.toLowerCase().includes(consigneeSearch));

      return typeMatch && nameMatch && loadingPortMatch && dischargePortMatch && shipperMatch && consigneeMatch;
    });

    this.renderProjectTable();
  }
}