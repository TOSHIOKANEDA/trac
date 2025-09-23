import JapaneseHolidays from './japanese_holidays';

/**
 * WeekViewHandler
 * 週表示固有のロジックを管理するハンドラークラス
 * - カスタム週表示のHTML生成
 * - イベント順序制御（赤→青）
 * - 祝日表示
 * - スクロール対応
 * - ホバーエフェクト
 * - モーダル連携
 */
export class WeekViewHandler {
  constructor(adapter, eventManager, targets, onEventClick) {
    this.adapter = adapter;
    this.eventManager = eventManager;
    this.targets = targets;
    this.onEventClick = onEventClick;
    this.currentDate = null; // 遅延初期化
  }

  /**
   * ビュー切り替え時の初期化
   */
  onViewChange() {
    // currentDateを初期化（FullCalendarの現在日付から取得）
    if (!this.currentDate) {
      this.currentDate = new Date(this.adapter.getDate());
    }
    
    this.adapter.setHandler(this);
    this.renderWeekView();
  }

  /**
   * 週表示をレンダリング
   */
  renderWeekView() {
    const weekDays = this.getWeekDays(this.currentDate);
    const container = this.targets.weekViewContainer;

    if (!container) {
      console.error('weekViewContainer not found');
      return;
    }

    let html = '<div class="week-view-wrapper">';

    // ヘッダー（曜日）
    html += this.generateWeekHeader(weekDays);

    // 1週間のイベントを取得
    const allEvents = this.adapter.getEvents();

    // イベントを日付ごとにグループ化
    const eventsByDate = this.groupEventsByDate(allEvents);

    // グリッド開始
    html += '<div class="week-grid">';

    // 各曜日のセルを生成
    weekDays.forEach(day => {
      const dateKey = this.getDateKey(day);
      const dayEvents = eventsByDate[dateKey] || [];

      // イベントをソート（赤→青、その後ID順）
      const sortedEvents = this.sortEvents(dayEvents);

      html += this.generateDayCell(day, sortedEvents);
    });

    html += '</div>'; // week-grid
    html += '</div>'; // week-view-wrapper

    container.innerHTML = html;

    // lucide iconsを再初期化
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // DOMが更新された後にイベントリスナーを設定
    setTimeout(() => {
      this.setupEventListeners();
    }, 50);
  }

  /**
   * 週の日付を取得（日曜日スタート）
   * @param {Date} date - 任意の日付
   * @returns {Array<Date>}
   */
  getWeekDays(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = 日曜日
    const diff = d.getDate() - day;
    const startDate = new Date(d.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      weekDays.push(dayDate);
    }

    return weekDays;
  }

  /**
   * 日付をキーに変換（YYYY-MM-DD）
   * @param {Date} date
   * @returns {string}
   */
  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * イベントを日付ごとにグループ化
   * @param {Array} allEvents
   * @returns {Object}
   */
  groupEventsByDate(allEvents) {
    const grouped = {};

    allEvents.forEach(event => {
      const dateKey = this.getDateKey(event.start);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }

  /**
   * イベントをソート（赤→青、その後ID順）
   * @param {Array} events
   * @returns {Array}
   */
  sortEvents(events) {
    return events.sort((a, b) => {
      const aIsDischarging = a.extendedProps.vessel_action === 'discharging';
      const bIsDischarging = b.extendedProps.vessel_action === 'discharging';

      // dischargingが優先（赤が先）
      if (aIsDischarging && !bIsDischarging) return -1;
      if (!aIsDischarging && bIsDischarging) return 1;

      // 同じタイプの場合はID順
      return a.extendedProps.id - b.extendedProps.id;
    });
  }

  /**
   * 週ヘッダー（曜日）を生成
   * @param {Array<Date>} weekDays
   * @returns {string}
   */
  generateWeekHeader(weekDays) {
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    let html = '<div class="week-header">';

    weekDays.forEach((day, index) => {
      const dayLabel = dayLabels[day.getDay()];
      const dayNum = day.getDate();
      const holiday = JapaneseHolidays.isHoliday(day);
      
      // 日曜日または祝日のみ赤、土曜日は青
      const isRedDay = (day.getDay() === 0 || holiday !== null);
      const headerClass = isRedDay ? 'week-day-header holiday' : 'week-day-header';
      const dateStr = `${day.getMonth() + 1}/${dayNum}`;

      html += `
        <div class="${headerClass}">
          <div class="day-label">${dayLabel}</div>
          <div class="day-date">${dateStr}</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * 日付セルを生成
   * @param {Date} day
   * @param {Array} dayEvents
   * @returns {string}
   */
  generateDayCell(day, dayEvents) {
    const holiday = JapaneseHolidays.isHoliday(day);
    
    // 日曜日または祝日のみ赤、土曜日は青
    const isRedDay = (day.getDay() === 0 || holiday !== null);
    const cellClass = isRedDay ? 'week-day-cell holiday' : 'week-day-cell';
    
    // 本日判定
    const today = new Date();
    const isToday = (day.getFullYear() === today.getFullYear() &&
                     day.getMonth() === today.getMonth() &&
                     day.getDate() === today.getDate());
    const todayClass = isToday ? ' today' : '';
    
    const dateKey = this.getDateKey(day);

    let html = `<div class="${cellClass}${todayClass}" data-date="${dateKey}">`;

    // イベントを表示
    dayEvents.forEach(event => {
      const props = event.extendedProps;
      const isDischarging = props.vessel_action === 'discharging';
      const portCode = props.portCode || '';

      const eventClass = isDischarging ? 'week-event discharging' : 'week-event loading';

      html += `
        <div class="${eventClass}" data-event-id="${event.id}" data-vessel-action="${props.vessel_action}">
          <!-- Port Code Badge -->
          <div class="event-port-code">${portCode}</div>
          
          <!-- Event Details -->
          <div class="event-details">
            <div class="event-row inline">
              <span class="event-label">Job No.：</span>
              <span class="event-value">${props.id}</span>
            </div>
            <div class="event-row inline">
              <span class="event-label">MBL：</span>
              <span class="event-value">${props.mbl_no || 'N/A'}</span>
            </div>
            <div class="event-row inline">
              <span class="event-label">HBL：</span>
              <span class="event-value">${props.hbl_no || 'N/A'}</span>
            </div>
            <div class="event-row multiline">
              <span class="event-label">Shipper：</span>
              <span class="event-value">${props.shipper ? props.shipper.substring(0, 20) : 'N/A'}</span>
            </div>
            <div class="event-row multiline">
              <span class="event-label">Cnee：</span>
              <span class="event-value">${props.cnee ? props.cnee.substring(0, 20) : 'N/A'}</span>
            </div>
            <div class="event-row inline">
              <span class="event-label">Mode：</span>
              <span class="event-value">${props.mode || 'N/A'}</span>
            </div>
            <div class="event-row inline">
              <span class="event-label">Term：</span>
              <span class="event-value">${props.term || 'N/A'}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * 表示値を取得
   * @param {Object} props
   * @returns {string}
   */
  getDisplayValue(props) {
    const displayOption = this.eventManager.getDisplayOption();
    let displayValue = '';

    switch (displayOption) {
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
        displayValue = props.shipper ? props.shipper.substring(0, 12) : 'N/A';
        break;
      case 'cnee':
        displayValue = props.cnee ? props.cnee.substring(0, 12) : 'N/A';
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

    return displayValue;
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    const eventElements = document.querySelectorAll('.week-event');

    eventElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const eventId = el.getAttribute('data-event-id');
        const event = this.adapter.getEventById(eventId);

        if (event && this.onEventClick) {
          this.onEventClick({ event });
        }
      });

      // ホバーエフェクト
      el.addEventListener('mouseenter', () => {
        el.classList.add('event-hover');
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('event-hover');
      });
    });
  }

  /**
   * 前の週に移動
   */
  prevWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() - 7);
    this.currentDate = newDate;
    this.renderWeekView();
  }

  /**
   * 次の週に移動
   */
  nextWeek() {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + 7);
    this.currentDate = newDate;
    this.renderWeekView();
  }

  /**
   * 現在の週の開始日を取得
   * @returns {Date}
   */
  getWeekStart() {
    return this.getWeekDays(this.currentDate)[0];
  }

  /**
   * 現在の日付を設定（前月/次月ボタン対応）
   * @param {Date} date
   */
  setDate(date) {
    this.currentDate = new Date(date);
    this.renderWeekView();
  }

  /**
   * FullCalendar callback: eventContent
   * 週表示では使用しない
   */
  eventContent = (arg) => {
    return { html: '' };
  }

  /**
   * FullCalendar callback: eventDidMount
   * 週表示では使用しない
   */
  eventDidMount = (info) => {
    // 週表示用の独自DOMなので、FullCalendarのコールバックは不要
  }

  /**
   * FullCalendar callback: datesSet
   * 日付範囲が変更されたときの処理
   */
  datesSet = () => {
    const currentDate = this.adapter.getDate();
    this.setDate(currentDate);
  }

  /**
   * FullCalendar callback: eventClick
   * 週表示では使用しない（setupEventListenersで独自に処理）
   */
  eventClick = (info) => {
    // 週表示用の独自DOMなので、FullCalendarのコールバックは不要
  }

  /**
   * グローバルリスナーをクリーンアップ
   */
  cleanup() {
    // 週表示用のリスナーをクリア
  }
}

export default WeekViewHandler;
