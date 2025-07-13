import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "typeFilter", "idSearch", "blSearch", "loadingPortSearch", 
    "dischargePortSearch", "shipperSearch", "consigneeSearch",
    "milestoneModal", "milestoneModalOverlay", 
    "modalProjectTitle", "milestoneModalContent"
  ]
  
  connect() {
    // プロジェクトデータ
    this.projects = [
      { 
        id: 1001,
        event_id: 'X8J2LQ9', 
        name: 'TYO→LAX (ABC社)', 
        type: '輸出',
        shipper: 'ABC Solutions Co., Ltd. Tokyo Branch', 
        consignee: 'ABC Solutions USA, Inc. Los Angeles Office', 
        bl_no: 'BL-12345', 
        status: '航海中', 
        assignee: '田中 太郎', 
        loading_port: 'TYO', 
        discharge_port: 'LAX', 
        etd: '2025-07-20T18:00:00', 
        eta: '2025-08-05T09:30:00',
        milestone_dates: { 
          'ブッキング確定': '2025/07/05',
          '船積書類受領': '2025/07/08',
          'バンニング': '2025/07/12',
          '検疫完了': '2025/07/14',
          '通関完了': '2025/07/18',
          'ETD': '2025/07/20',
          'ETA': '2025/08/05',
          '配送日': '2025/08/06',
          '請求書発行': '2025/08/08'
        }
      },
      { 
        id: 1002,
        event_id: 'A7ZK3YD', 
        name: 'SHA→KOB (XYZ社)', 
        type: '輸入',
        shipper: 'XYZ Trading (Shanghai) Co., Ltd.', 
        consignee: 'XYZ Japan Ltd. Kobe Branch', 
        bl_no: 'BL-67890', 
        status: 'ブッキング確定', 
        assignee: '鈴木 花子', 
        loading_port: 'SHA', 
        discharge_port: 'KOB', 
        etd: '2025-07-25T22:00:00', 
        eta: '2025-07-28T10:00:00',
        milestone_dates: { 
          'ブッキング確定': '2025/07/15',
          '船積書類受領': '2025/07/17'
          // 以降は未達成
        }
      },
      { 
        id: 1003,
        event_id: 'C1PXV6E', 
        name: 'YOK→SIN (DEF社)', 
        type: '輸出',
        shipper: 'DEF Corporation', 
        consignee: 'DEF Singapore Pte Ltd', 
        bl_no: 'N/A', 
        status: 'ブッキング確定', 
        assignee: '田中 太郎', 
        loading_port: 'YOK', 
        discharge_port: 'SIN', 
        etd: '2025-07-23T15:00:00', 
        eta: '2025-08-02T11:00:00',
        milestone_dates: {}
      },
      { 
        id: 1004,
        event_id: 'T9BQL0M', 
        name: 'BKK→OSA (GHI社)', 
        type: '輸入',
        shipper: 'GHI Logistics (Thailand)', 
        consignee: 'GHI Japan Inc. Osaka', 
        bl_no: 'BL-ABCDE', 
        status: '完了', 
        assignee: '佐藤 次郎', 
        loading_port: 'BKK', 
        discharge_port: 'OSA', 
        etd: '2025-07-15T11:00:00', 
        eta: '2025-07-23T14:00:00',
        milestone_dates: { 
          'ブッキング確定': '2025/07/01',
          '船積書類受領': '2025/07/03',
          'バンニング': '2025/07/08',
          '検疫完了': '2025/07/10',
          '通関完了': '2025/07/13',
          'ETD': '2025/07/15',
          'ETA': '2025/07/23',
          '配送日': '2025/07/24',
          '請求書発行': '2025/07/25'
        }
      },
      { 
        id: 1005,
        event_id: 'F4GRN7A', 
        name: 'HKG→TYO (MNO社)', 
        type: '輸入',
        shipper: 'MNO International (Hong Kong)', 
        consignee: 'MNO Japan Corporation Head Office', 
        bl_no: 'BL-FGHIJ', 
        status: '船積書類受領', 
        assignee: '鈴木 花子', 
        loading_port: 'Hong Kong', 
        discharge_port: 'Tokyo', 
        etd: '2025-08-01T10:00:00', 
        eta: '2025-08-05T14:00:00',
        milestone_dates: { 
          'ブッキング確定': '2025/07/25',
          '船積書類受領': '2025/07/27'
        }
      },
      { 
        id: 1006,
        event_id: 'L2DJW5K', 
        name: 'SIN→NGO (PQR社)', 
        type: '輸入',
        shipper: 'PQR Global Forwarding', 
        consignee: 'PQR Japan Co. Nagoya', 
        bl_no: 'BL-KLMNO', 
        status: '通関完了', 
        assignee: '田中 太郎', 
        loading_port: 'SIN', 
        discharge_port: 'NGO', 
        etd: '2025-08-10T20:00:00', 
        eta: '2025-08-18T11:00:00',
        milestone_dates: { 
          'ブッキング確定': '2025/08/01',
          '船積書類受領': '2025/08/02',
          'バンニング': '2025/08/06',
          '検疫完了': '2025/08/07',
          '通関完了': '2025/08/09'
          // ETD以降はまだ
        }
      },
      { 
        id: 1007,
        event_id: 'BN8K09IU', 
        name: 'LGB→YOK (STU社)', 
        type: '輸入',
        shipper: 'STU North America Inc.', 
        consignee: 'STU Logistics Japan Ltd. Yokohama Branch', 
        bl_no: 'BL-PQRST', 
        status: '請求書発行', 
        assignee: '佐藤 次郎', 
        loading_port: 'LGB', 
        discharge_port: 'YOK', 
        etd: '2025-07-10T15:00:00', 
        eta: '2025-07-25T18:00:00',
        milestone_dates: { 
          'ブッキング確定': '2025/07/01',
          '船積書類受領': '2025/07/02',
          'バンニング': '2025/07/06',
          '検疫完了': '2025/07/07',
          '通関完了': '2025/07/08',
          'ETD': '2025/07/10',
          'ETA': '2025/07/25',
          '配送日': '2025/07/26',
          '請求書発行': '2025/07/28'
        }
      }
    ];


    // マイルストーンテンプレート
    this.MILESTONE_TEMPLATE = [
      'ブッキング確定',
      '船積書類受領',
      'バンニング',
      '検疫完了',
      '通関完了',
      'ETD',
      'ETA',
      '配送日',
      '請求書発行'
    ];
    this.STATUS_ORDER = {
      'ブッキング確定': 0,
      '船積書類受領': 1,
      'バンニング': 2,
      '検疫完了': 3,
      '通関完了': 4,
      'ETD': 5,
      'ETA': 6,
      '配送日': 7,
      '請求書発行': 8
    };
  }

  // 日時フォーマット関数（年と時間を削除、月日のみ表示）
  formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ja-JP', { 
      month: '2-digit', 
      day: '2-digit'
    });
  }

  // マイルストーン取得
  getMilestonesForProject(project) {
    const currentStatusIndex = this.STATUS_ORDER[project.status];
    return this.MILESTONE_TEMPLATE.map((name, index) => {
      let status = 'pending';
      if (index < currentStatusIndex) {
        status = 'complete';
      } else if (index === currentStatusIndex) {
        status = 'current';
      }
      if (project.status === '完了') {
        status = 'complete';
      }
      
      const date = project.milestone_dates[name] || null;
      return { name, status, date };
    });
  }

  // マイルストーン表示
  showMilestone(event) {
    event.preventDefault();
    const projectId = parseInt(event.currentTarget.dataset.projectId);
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    // 行をハイライト
    const row = event.currentTarget.closest('tr');
    document.querySelectorAll('#project-table-body tr').forEach(r => r.classList.remove('selected-row'));
    if (row) row.classList.add('selected-row');

    // モーダルコンテンツの更新
    this.modalProjectTitleTarget.textContent = `${project.bl_no} (ID: ${project.event_id})` || '進捗状況';
    
    const milestones = this.getMilestonesForProject(project);
    let html = '<ul class="milestone-list">';

    milestones.forEach(milestone => {
      const iconClass = milestone.status === 'complete' ? 'fas fa-check' : 
                       milestone.status === 'current' ? 'fas fa-clock' : 'fas fa-circle';
      
      html += `
        <li class="milestone-item">
          <div class="milestone-icon ${milestone.status}">
            <i class="${iconClass}"></i>
          </div>
          <div class="milestone-content">
            <div class="milestone-name">${milestone.name}</div>
            ${milestone.date ? `<div class="milestone-date">${milestone.date}</div>` : ''}
          </div>
        </li>
      `;
    });

    html += '</ul>';
    this.milestoneModalContentTarget.innerHTML = html;

    // モーダル表示
    document.body.style.overflow = 'hidden';
    this.milestoneModalOverlayTarget.classList.add('active');
  }

  // モーダル閉じる
  closeMilestoneModal() {
    this.milestoneModalOverlayTarget.classList.remove('active');
    document.body.style.overflow = '';
    document.querySelectorAll('#project-table-body tr').forEach(r => r.classList.remove('selected-row'));
  }

  // モーダルオーバーレイクリック
  modalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      this.closeMilestoneModal();
    }
  }
}
