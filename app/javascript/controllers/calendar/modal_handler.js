/**
 * ModalHandler
 * モーダル表示制御を責務とするクラス
 * - イベント詳細表示
 * - イベント一覧表示
 * - モーダルの開閉制御
 */
export class ModalHandler {
  constructor(adapter, eventManager, targets) {
    this.adapter = adapter;
    this.eventManager = eventManager;
    this.targets = targets;  // eventModalTarget, detailsModalContentTarget
  }

  /**
   * イベント詳細を表示（モーダル）
   */
  showEventDetails(info) {
    const props = info.event.extendedProps;

    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '/');
    };

    const formatDate = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '/');
    };

    const eventId = props.event_id;
    const editUrl = eventId ? `/events/${eventId}/edit` : '#';

    let html = `
      <div class="relative">
        <button class="close-modal-btn absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 z-10" data-action="click->calendar#closeModal"><i data-lucide="x" class="h-6 w-6"></i></button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h4 class="text-lg font-bold text-gray-800 border-b pb-2 mb-3">基本情報</h4>
            <dl class="space-y-2 text-sm">
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">ID</dt><dd>${props.id}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">B/L No.</dt><dd>${props.bl_no}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">MBL No.</dt><dd>${props.mbl_no || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">HBL No.</dt><dd>${props.hbl_no || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">種別</dt><dd><span class="px-2 py-1 rounded text-xs font-medium ${props.type === '輸出' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">${props.type}</span></dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">担当者</dt><dd>${props.assignee}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Shipper</dt><dd>${props.shipper || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Cnee</dt><dd>${props.cnee || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Mode</dt><dd>${props.mode || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Container</dt><dd>${props.modal_container || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">Term</dt><dd>${props.term || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">出発地</dt><dd>${props.origin || 'N/A'}</dd></div>
              ${props.vessel2 ? `<div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">積み替え港</dt><dd>${props.ts_location || 'N/A'}</dd></div>` : ''}
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">到着地</dt><dd>${props.destination || 'N/A'}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">ETD</dt><dd>${formatDate(props.etd)}</dd></div>
              <div class="flex"><dt class="w-24 font-medium text-gray-500 shrink-0">ETA</dt><dd>${formatDate(props.eta)}</dd></div>
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
        <a href="${editUrl}" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center no-underline">
          <i data-lucide="message-square" class="mr-2 h-5 w-5"></i>
          案件詳細＆チャット
        </a>
      </div>`;

    this.targets.detailsModalContent.innerHTML = html;
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.targets.eventModal.classList.remove('hidden');
  }

  /**
   * 指定日付のイベント一覧を表示（モーダル）
   */
  showEventListModal(info) {
    const date = info.date;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const allEvents = this.adapter.getEvents();
    const dayEvents = allEvents.filter(event => {
      const eventDate = event.start;
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });

    let html = `
      <div class="relative">
        <button class="close-modal-btn absolute top-0 right-0 p-1 rounded-full hover:bg-gray-200 z-10" data-action="click->calendar#closeModal"><i data-lucide="x" class="h-6 w-6"></i></button>
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-4">${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日 のイベント一覧</h3>
          <div class="space-y-3">
    `;

    dayEvents.forEach((event, index) => {
      const props = event.extendedProps;
      const isTsumi = props.vessel_action === 'loading';
      const badgeClass = isTsumi ? 'bg-blue-600' : 'bg-red-600';
      const portCode = props.portCode || '';

      let displayValue = '';
      switch (this.eventManager.getDisplayOption()) {
        case 'id':
          displayValue = `${props.id}`;
          break;
        case 'mbl_no':
          displayValue = props.mbl_no || 'N/A';
          break;
        case 'hbl_no':
          displayValue = props.hbl_no || 'N/A';
          break;
        case 'shipper':
          displayValue = props.shipper ? props.shipper.substring(0, 20) : 'N/A';
          break;
        case 'cnee':
          displayValue = props.cnee ? props.cnee.substring(0, 20) : 'N/A';
          break;
        case 'mode':
          displayValue = props.mode || 'N/A';
          break;
        case 'container':
          displayValue = props.container || 'N/A';
          break;
        case 'term':
          displayValue = props.term || 'N/A';
          break;
        default:
          displayValue = `${props.id}`;
      }

      html += `
        <div class="flex items-center gap-2 p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors" data-event-id="${event.id}" data-action="click->calendar#selectEventFromList">
          <span class="text-white text-xs font-bold px-2 py-1 rounded ${badgeClass} whitespace-nowrap">${portCode}</span>
          <span class="text-gray-900 text-sm flex-1">${displayValue}</span>
          <span class="text-gray-500 text-xs">${isTsumi ? '出航' : '到着'}</span>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
      <div class="mt-8 pt-4 border-t border-gray-200 flex justify-end">
        <button class="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors" data-action="click->calendar#closeModal">
          閉じる
        </button>
      </div>
    `;

    this.targets.detailsModalContent.innerHTML = html;
    if (window.lucide) {
      window.lucide.createIcons();
    }
    this.targets.eventModal.classList.remove('hidden');
  }

  /**
   * リストからイベントを選択
   */
  selectEventFromList(eventId) {
    const calendarEvent = this.adapter.getEventById(eventId);
    if (calendarEvent) {
      this.showEventDetails({ event: calendarEvent });
    }
  }

  /**
   * モーダルを閉じる
   */
  closeModal() {
    this.targets.eventModal.classList.add('hidden');
  }

  /**
   * モーダルの背景クリック
   */
  handleBackgroundClick(event) {
    if (event.target === this.targets.eventModal) {
      this.closeModal();
    }
  }
}

export default ModalHandler;
