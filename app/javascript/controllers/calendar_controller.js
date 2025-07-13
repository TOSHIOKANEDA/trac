import { Controller } from "@hotwired/stimulus"

// Connecting to data-controller="calendar"
export default class extends Controller {
  static targets = ["calendar", "loadingFilter", "dischargingFilter", "performPlusone", "eventModal", "detailsModalContent", "dateTooltip"]
  
  connect() {
    // lucide icons の初期化
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // status styles の定義
    this.statusStyles = {
      '見積もり作成中': 'bg-yellow-100 text-yellow-800', 
      'ブッキング依頼中': 'bg-blue-100 text-blue-800',
      '書類準備中': 'bg-purple-100 text-purple-800', 
      '本船出航待ち': 'bg-orange-100 text-orange-800',
      '航海中': 'bg-green-100 text-green-800', 
      '請求書発行待ち': 'bg-cyan-100 text-cyan-800',
      '完了': 'bg-gray-100 text-gray-800'
    };
    
    // フィルター状態
    this.showLoading = true;      // 積み地を表示
    this.showDischarging = true;  // 揚げ地を表示
    this.showHouseBL = true;      // House B/L番号を表示
    
    // House B/L のラベル（変更可能）
    this.houseBLLabel = "House B/L";
    
    // プロジェクトデータの生成
    this.projects = this.generateProjects(40);
    
    // カレンダーの初期化
    this.initializeCalendar();
    
    // フィルターボタンの初期化
    this.updateFilterButtons();
  }
  
  generateProjects(count) {
    const projects = [];
    const statuses = Object.keys(this.statusStyles);
    const assignees = ['Taro Tanaka', 'Hanako Suzuki', 'Jiro Sato', 'Saburo Takahashi', 'Shiro Ito'];
    // 40-character English company names
    const longCompanies = [
      'Global Shipping & Maritime Logistics Solutions Inc.',
      'International Freight Forwarding and Customs Brokerage LLC',
      'Trans-Pacific Consolidated Cargo Transport Services Co.',
      'Universal Container & Bulk Cargo Logistics Network Ltd.'
    ];
    const ports = ['Tokyo', 'Yokohama', 'Kobe', 'Osaka', 'Nagoya', 'Hakata', 'Los Angeles', 'Shanghai', 'Singapore', 'Bangkok', 'Pusan', 'Port Klang', 'Jakarta', 'Hamburg', 'Hai Phong'];
    const japanPorts = ['Tokyo', 'Yokohama', 'Kobe', 'Osaka', 'Nagoya', 'Hakata'];
    const vessels = ['OCEAN PIONEER', 'PACIFIC EXPLORER', 'ATLANTIC VOYAGER', 'ASIAN EXPRESS'];

    // House B/L番号生成用のプレフィックス
    const houseBLPrefixes = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'];

    for (let i = 1; i <= count; i++) {
      const origin = ports[Math.floor(Math.random() * ports.length)];
      let destination = ports[Math.floor(Math.random() * ports.length)];
      while (origin === destination) {
        destination = ports[Math.floor(Math.random() * ports.length)];
      }
      
      // 輸出・輸入の判定（日本の港が出発地なら輸出、到着地なら輸入）
      let type = '輸出'; // デフォルト
      if (japanPorts.includes(origin) && !japanPorts.includes(destination)) {
        type = '輸出';
      } else if (!japanPorts.includes(origin) && japanPorts.includes(destination)) {
        type = '輸入';
      } else {
        // どちらも日本港または両方とも海外港の場合はランダム
        type = Math.random() > 0.5 ? '輸出' : '輸入';
      }
      
      const shipperName = longCompanies[Math.floor(Math.random() * longCompanies.length)];
      const cneeName = longCompanies[Math.floor(Math.random() * longCompanies.length)];
      const company = ['ABC', 'XYZ', 'DEF', 'GHI'][i % 4];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const etdDate = new Date(2025, 6 + Math.floor(i/15), 1 + (i % 28));
      etdDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 4) * 15);
      const etaDate = new Date(etdDate.getTime() + (5 + Math.floor(Math.random() * 20)) * 24 * 60 * 60 * 1000);
      etaDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 4) * 15);

      // vessel1をランダムに選ぶ
      const vessel1 = vessels[Math.floor(Math.random() * vessels.length)];

      // vessel2はvessel1と異なる船を選ぶ
      let vessel2;
      do {
        vessel2 = vessels[Math.floor(Math.random() * vessels.length)];
      } while (vessel2 === vessel1);

      // voyage番号
      const voyageCode = `${String.fromCharCode(65 + Math.floor(i / 26))}${String(100 + i).padStart(3, '0')}`;

      const vessel1_eta = new Date(etdDate);
      const vessel1_etd = new Date(etaDate);

      // vessel2 = vessel1 + 1日10時間
      let vessel2_eta = new Date(vessel1_eta.getTime() + (24 + 10) * 60 * 60 * 1000);
      let vessel2_etd = new Date(vessel1_etd.getTime() + (24 + 10) * 60 * 60 * 1000);

      // House B/L番号を生成
      const houseBLPrefix = houseBLPrefixes[Math.floor(Math.random() * houseBLPrefixes.length)];
      const houseBLNumber = `${houseBLPrefix}${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`;

      // プロジェクトデータを push
      projects.push({
        id: i,
        name: `${origin}→${destination} (${company} Co.)`,
        bl_no: `BL-${String(10000 + i).padStart(5, '0')}`,
        houseBL: houseBLNumber,  // House B/L番号を追加
        status: status,
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        origin: origin,
        destination: destination,
        type: type,
        shipper: shipperName,
        cnee: cneeName,
        etd: etdDate.toISOString(),
        eta: etaDate.toISOString(),

        vessel1: vessel1,
        voyage1: voyageCode,
        vessel1_etd: vessel1_etd.toISOString(),
        vessel1_eta: vessel1_eta.toISOString(),
        ts_location: "Singapore",
        vessel2: vessel2,
        voyage2: voyageCode,
        vessel2_etd: vessel2_etd.toISOString(),
        vessel2_eta: vessel2_eta.toISOString()
      });

    }
    const lateNightEtd = new Date(2025, 7, 1, 23, 30);
    const lateNightEta = new Date(2025, 7, 16, 10, 0);
    projects.push({
      id: count + 1, name: 'Narita→JFK (Late Co.)', bl_no: `BL-${String(10000 + count + 1).padStart(5, '0')}`,
      houseBL: 'XYZ123456789',  // House B/L番号を追加
      status: 'Awaiting Vessel Departure', assignee: 'Taro Tanaka', origin: 'Narita', destination: 'JFK', type: '輸出',
      shipper: 'Global Shipping & Maritime Logistics Solutions Inc.', 
      cnee: 'International Freight Forwarding and Customs Brokerage LLC',
      etd: lateNightEtd.toISOString(), eta: lateNightEta.toISOString(),
      vessel1: 'MIDNIGHT EXPRESS', voyage1: 'N001', vessel1_etd: lateNightEtd.toISOString(), vessel1_eta: lateNightEta.toISOString()
    });
    return projects;
  }
  
  updateFilterButtons() {
    this.loadingFilterTarget.className = this.showLoading 
      ? "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 shadow-md"
      : "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-600 hover:bg-gray-300";
      
    this.dischargingFilterTarget.className = this.showDischarging 
      ? "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600 shadow-md"
      : "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-600 hover:bg-gray-300";

    // プラス1ボタンの状態更新
    this.performPlusoneTarget.className = this.showHouseBL 
      ? "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-500 text-white hover:bg-green-600 shadow-md"
      : "px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-600 hover:bg-gray-300";
  }
  
  getFilteredEvents() {
    const allEvents = [];
    this.projects.forEach(project => {
      const extendedProps = { ...project };
      const groupId = `project-${project.id}`;

      // 積み地イベント（ETD）
      if (project.etd && this.showLoading) {
        allEvents.push({
          id: `${project.id}-etd`, groupId: groupId, start: project.etd,
          extendedProps: { ...extendedProps, type: '積み', shipmentType: project.type },
          allDay: true
        });
      }
      
      // 揚げ地イベント（ETA）
      if (project.eta && this.showDischarging) {
        allEvents.push({
          id: `${project.id}-eta`, groupId: groupId, start: project.eta,
          extendedProps: { ...extendedProps, type: '揚げ', shipmentType: project.type },
          allDay: true
        });
      }
    });
    return allEvents;
  }
  
  filterLoading() {
    this.showLoading = !this.showLoading;
    this.updateFilterButtons();
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(this.getFilteredEvents());
  }
  
  filterDischarging() {
    this.showDischarging = !this.showDischarging;
    this.updateFilterButtons();
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(this.getFilteredEvents());
  }

  // House B/L番号の表示・非表示をトグルする
  performPlusone() {
    this.showHouseBL = !this.showHouseBL;
    this.updateFilterButtons();
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(this.getFilteredEvents());
  }
  
  initializeCalendar() {
    const calendarEvents = this.getFilteredEvents();

    this.calendar = new FullCalendar.Calendar(this.calendarTarget, {
      initialView: 'dayGridMonth',
      aspectRatio: 1.8,
      locale: 'ja',
      headerToolbar: { left: 'prev,next', center: 'title', right: '' },
      buttonText: { },
      dayMaxEvents: 3,
      events: calendarEvents,
      moreLinkText: (num) => `他${num}件`,
      moreLinkClick: 'popover',
      displayEventTime: false,
      viewDidMount: () => {
        setTimeout(() => {
          const todayCell = document.querySelector('.fc-day-today');

          if (todayCell) {
            const todayRow = todayCell.closest('tr');
            if (todayRow) {
              todayRow.setAttribute('tabindex', -1);
              todayRow.focus({ preventScroll: false });
              todayRow.addEventListener('blur', () => {
                todayRow.removeAttribute('tabindex');
              }, { once: true }); 
            }
          } else {
            console.error('フォーカス対象の .fc-day-today が見つかりませんでした。');
          }
        }, 100);
      },
      eventContent: (arg) => {
        const props = arg.event.extendedProps;
        const isTsumi = props.type === '積み';
        
        // 積み地の場合は積み地の港名、揚げ地の場合は揚げ地の港名を全文字表示
        const portName = isTsumi ? props.origin : props.destination;
        
        // House B/L番号の表示制御
        const houseBLDisplay = this.showHouseBL && props.houseBL ? ` ${props.houseBL}` : '';
        const displayText = `${portName}${houseBLDisplay}`;
        
        // 積み地は青、揚げ地は赤
        const bgColor = isTsumi ? 'bg-blue-100' : 'bg-red-100';
        
        let html = `
          <div class="h-full w-full flex items-center justify-center text-sm font-bold ${bgColor} text-black" data-vessel-action="${isTsumi ? 'loading' : 'discharging'}">
            <div class="font-bold text-center px-1">${displayText}</div>
          </div>
        `;
        return { html: html };
      },
      eventDidMount: (info) => {
        if (info.event.groupId) {
          info.el.setAttribute('data-group-id', info.event.groupId);
        }
      },
      eventMouseEnter: (info) => {
        const groupId = info.event.groupId;
        if (!groupId) return;
        
        const isSingleEvent = !info.event.extendedProps.eta;
        if (isSingleEvent) return;

        document.querySelectorAll(`[data-group-id="${groupId}"]`).forEach(el => el.classList.add('event-highlight-hover'));

        const pairOnScreen = document.querySelectorAll(`[data-group-id="${groupId}"]`).length === 2;

        if (!pairOnScreen) {
          const calendarRect = this.calendarTarget.getBoundingClientRect();
          const hoveredRect = info.el.getBoundingClientRect();
          
          const x = hoveredRect.left + hoveredRect.width / 2 - calendarRect.left;
          
          const isTsumi = info.event.extendedProps.type === '積み';
          const otherDate = new Date(isTsumi ? info.event.extendedProps.eta : info.event.extendedProps.etd);
          
          const y = isTsumi ? (hoveredRect.bottom - calendarRect.top + 15) : (hoveredRect.top - calendarRect.top - 15);

          const otherType = isTsumi ? '揚げ' : '積み';
          const tooltipText = `${otherDate.getMonth() + 1}/${otherDate.getDate()} ${otherType}`;
          
          this.dateTooltipTarget.innerHTML = tooltipText;
          this.dateTooltipTarget.classList.remove('hidden');
          const tooltipRect = this.dateTooltipTarget.getBoundingClientRect();
          
          this.dateTooltipTarget.style.left = `${x - tooltipRect.width / 2}px`;
          this.dateTooltipTarget.style.top = `${isTsumi ? y : y - tooltipRect.height}px`;
        }
      },
      eventMouseLeave: (info) => {
        const groupId = info.event.groupId;
        if (groupId) {
          document.querySelectorAll(`[data-group-id="${groupId}"]`).forEach(el => el.classList.remove('event-highlight-hover'));
        }
        this.dateTooltipTarget.classList.add('hidden');
      },
      eventClick: (info) => {
        this.showEventDetails(info);
      }
    });
    this.calendar.render();
  }
  
  showEventDetails(info) {
    const props = info.event.extendedProps;
    
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '/');
    };
    
    let html = `
      <div class="relative">
        <button class="close-modal-btn absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 z-10" data-action="click->calendar#closeModal"><i data-lucide="x" class="h-6 w-6"></i></button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b pb-2 mb-3">基本情報</h4>
            <dl class="space-y-2 text-sm">
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">B/L No.</dt><dd>${props.bl_no}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">${this.houseBLLabel}</dt><dd>${props.houseBL || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">種別</dt><dd><span class="px-2 py-1 rounded text-xs font-medium ${props.shipmentType === '輸出' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">${props.shipmentType}</span></dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">担当者</dt><dd>${props.assignee}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Shipper</dt><dd>${props.shipper || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Consignee</dt><dd>${props.cnee || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">出発地</dt><dd>${props.origin || 'N/A'}</dd></div>
              ${props.vessel2 ? `<div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">積み替え港</dt><dd>${props.ts_location || 'N/A'}</dd></div>` : ''}
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">到着地</dt><dd>${props.destination || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">ETD</dt><dd>${formatDateTime(props.etd)}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">ETA</dt><dd>${formatDateTime(props.eta)}</dd></div>
            </dl>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b pb-2 mb-3">本船情報</h4>
            <div class="text-sm bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p class="font-medium text-gray-800">1st Vessel</p>
                <dl class="mt-1 space-y-1 pl-2">
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">本船名</dt><dd>${props.vessel1 || 'N/A'}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Voyage</dt><dd>${props.voyage1 || 'N/A'}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">到着日時</dt><dd>${formatDateTime(props.vessel1_eta)}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">出航日時</dt><dd>${formatDateTime(props.vessel1_etd)}</dd></div>
                </dl>
              </div>
              ${props.vessel2 ? `
              <div class="mt-6">
                <p class="font-medium text-gray-800">2nd Vessel</p>
                <dl class="mt-1 space-y-1 pl-2">
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">本船名</dt><dd>${props.vessel2 || 'N/A'}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Voyage</dt><dd>${props.voyage2 || 'N/A'}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">到着日時</dt><dd>${formatDateTime(props.vessel2_eta)}</dd></div>
                  <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">出航日時</dt><dd>${formatDateTime(props.vessel2_etd)}</dd></div>
                </dl>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 pt-4 border-t border-gray-200 flex justify-end items-center">
        <button class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <i data-lucide="message-square" class="mr-2 h-5 w-5"></i>
          案件詳細＆チャット
        </button>
      </div>`;
    
    this.detailsModalContentTarget.innerHTML = html;
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.eventModalTarget.classList.remove('hidden');
  }
  
  closeModal() {
    this.eventModalTarget.classList.add('hidden');
  }
  
  // モーダルの背景クリックで閉じる
  modalBackgroundClick(event) {
    if (event.target === this.eventModalTarget) {
      this.closeModal();
    }
  }
}
