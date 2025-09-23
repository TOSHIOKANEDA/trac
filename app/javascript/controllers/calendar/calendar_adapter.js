/**
 * CalendarAdapter
 * FullCalendarのラッパークラス
 * - インスタンス生成・管理
 * - ビューハンドラーの切り替え
 * - コールバック処理の委譲
 */
export class CalendarAdapter {
  constructor(container, eventManager) {
    this.container = container;
    this.eventManager = eventManager;
    this.calendar = null;
    this.currentHandler = null;  // 現在のビューハンドラー
  }

  /**
   * FullCalendarを初期化
   * @param {Object} options - FullCalendarのオプション
   */
  initialize(options = {}) {
    if (!window.FullCalendar) {
      console.error('FullCalendar is not loaded');
      return;
    }

    const FullCalendar = window.FullCalendar;
    const Calendar = FullCalendar.Calendar;

    const defaultOptions = {
      initialView: 'dayGridMonth',
      locale: 'ja',
      height: 'auto',
      contentHeight: 'auto',
      headerToolbar: false,
      
      // イベント取得
      events: (info, successCallback, failureCallback) => {
        successCallback(this.eventManager.getFilteredEvents());
      },

      // コールバック：イベント内容の描画
      eventContent: (arg) => this.handleEventContent(arg),

      // コールバック：イベントDOM作成後
      eventDidMount: (info) => this.handleEventDidMount(info),

      // コールバック：日付範囲が変更されたとき
      datesSet: () => this.handleDatesSet(),

      // コールバック：マウス進入
      eventMouseEnter: (info) => this.handleEventMouseEnter(info),

      // コールバック：マウス離脱
      eventMouseLeave: (info) => this.handleEventMouseLeave(info),

      // コールバック：イベントクリック
      eventClick: (info) => this.handleEventClick(info),
    };

    // オプションをマージ
    const mergedOptions = { ...defaultOptions, ...options };

    // FullCalendarインスタンスを生成
    this.calendar = new Calendar(this.container, mergedOptions);
    this.calendar.render();
  }

  /**
   * ビューハンドラーを設定
   * @param {Object} handler - ビューハンドラー（MonthViewHandler, WeekViewHandlerなど）
   */
  setHandler(handler) {
    this.currentHandler = handler;
  }

  /**
   * ビューを切り替え
   * @param {string} viewName - ビュー名（'dayGridMonth', 'timeGridWeek'など）
   */
  changeView(viewName) {
    if (this.calendar) {
      this.calendar.changeView(viewName);
    }
  }

  /**
   * イベントを再取得
   */
  refetchEvents() {
    if (this.calendar) {
      this.calendar.refetchEvents();
    }
  }

  /**
   * 全イベントを取得
   * @returns {Array}
   */
  getEvents() {
    if (this.calendar) {
      return this.calendar.getEvents();
    }
    return [];
  }

  /**
   * IDでイベントを取得
   * @param {string} eventId
   * @returns {Object|null}
   */
  getEventById(eventId) {
    if (this.calendar) {
      return this.calendar.getEventById(eventId);
    }
    return null;
  }

  /**
   * 現在の日付を取得
   * @returns {Date}
   */
  getDate() {
    if (this.calendar) {
      return this.calendar.getDate();
    }
    return new Date();
  }

  /**
   * 前の月/週に移動
   */
  prev() {
    if (this.calendar) {
      this.calendar.prev();
    }
  }

  /**
   * 次の月/週に移動
   */
  next() {
    if (this.calendar) {
      this.calendar.next();
    }
  }

  /**
   * 指定日付に移動
   * @param {Date} date
   */
  gotoDate(date) {
    if (this.calendar) {
      this.calendar.gotoDate(date);
    }
  }

  /**
   * コールバック：イベント内容の描画
   * 現在のハンドラーに委譲
   */
  handleEventContent(arg) {
    if (this.currentHandler?.eventContent) {
      return this.currentHandler.eventContent(arg);
    }
    return {};
  }

  /**
   * コールバック：イベントDOM作成後
   * 現在のハンドラーに委譲
   */
  handleEventDidMount(info) {
    if (this.currentHandler?.eventDidMount) {
      this.currentHandler.eventDidMount(info);
    }
  }

  /**
   * コールバック：日付範囲が変更されたとき
   * 現在のハンドラーに委譲
   */
  handleDatesSet() {
    if (this.currentHandler?.datesSet) {
      this.currentHandler.datesSet();
    }
  }

  /**
   * コールバック：マウス進入
   * 現在のハンドラーに委譲
   */
  handleEventMouseEnter(info) {
    if (this.currentHandler?.eventMouseEnter) {
      this.currentHandler.eventMouseEnter(info);
    }
  }

  /**
   * コールバック：マウス離脱
   * 現在のハンドラーに委譲
   */
  handleEventMouseLeave(info) {
    if (this.currentHandler?.eventMouseLeave) {
      this.currentHandler.eventMouseLeave(info);
    }
  }

  /**
   * コールバック：イベントクリック
   * 現在のハンドラーに委譲
   */
  handleEventClick(info) {
    if (this.currentHandler?.eventClick) {
      this.currentHandler.eventClick(info);
    }
  }

  /**
   * インスタンスを破棄
   */
  destroy() {
    if (this.calendar) {
      this.calendar.destroy();
      this.calendar = null;
    }
    this.currentHandler = null;
  }
}

export default CalendarAdapter;
