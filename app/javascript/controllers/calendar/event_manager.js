/**
 * EventManager
 * イベントの取得・フィルター・管理を責務とするクラス
 */
export class EventManager {
  constructor(projects, statusStyles) {
    this.projects = projects;
    this.statusStyles = statusStyles;
    
    // フィルター状態
    this.showLoading = true;      // ETD（出航）を表示
    this.showDischarging = true;  // ETA（到着）を表示
    
    // 表示選択の初期値
    this.displayOption = 'id';
  }

  /**
   * フィルターされたイベントを取得
   * @returns {Array} FullCalendarに渡すイベント配列
   */
  getFilteredEvents() {
    const allEvents = [];
    this.projects.forEach(project => {
      const etdDate = new Date(project.etd);
      const etaDate = new Date(project.eta);

      if (this.showLoading) {
        // ETDイベント：終了日時を明示的に設定（翌日の00:00）
        const etdEnd = new Date(etdDate);
        etdEnd.setDate(etdEnd.getDate() + 1);
        etdEnd.setHours(0, 0, 0, 0);
        
        allEvents.push({
          id: `${project.id}-etd`,
          groupId: project.id,
          title: `${project.origin}`,
          start: etdDate.toISOString(),
          end: etdEnd.toISOString(),
          extendedProps: {
            ...project,
            type: '積み',
            vessel_action: 'loading',  // 言語非依存フラグ
            portName: project.origin,
            portCode: project.originPortCode
          }
        });
      }

      if (this.showDischarging) {
        // ETAイベント：終了日時を明示的に設定（翌日の00:00）
        const etaEnd = new Date(etaDate);
        etaEnd.setDate(etaEnd.getDate() + 1);
        etaEnd.setHours(0, 0, 0, 0);
        
        allEvents.push({
          id: `${project.id}-eta`,
          groupId: project.id,
          title: `${project.destination}`,
          start: etaDate.toISOString(),
          end: etaEnd.toISOString(),
          extendedProps: {
            ...project,
            type: '揚げ',
            vessel_action: 'discharging',  // 言語非依存フラグ
            portName: project.destination,
            portCode: project.destinationPortCode
          }
        });
      }
    });
    return allEvents;
  }

  /**
   * ETD（出航）フィルターを切り替え
   */
  toggleLoadingFilter() {
    this.showLoading = !this.showLoading;
  }

  /**
   * ETA（到着）フィルターを切り替え
   */
  toggleDischargingFilter() {
    this.showDischarging = !this.showDischarging;
  }

  /**
   * 表示選択オプションを設定
   * @param {string} option - 表示オプション ('id', 'mbl_no', 'hbl_no', 'shipper', 'cnee', 'mode', 'container', 'term')
   */
  setDisplayOption(option) {
    this.displayOption = option;
  }

  /**
   * 現在の表示選択オプションを取得
   * @returns {string}
   */
  getDisplayOption() {
    return this.displayOption;
  }

  /**
   * ETD フィルター状態を取得
   * @returns {boolean}
   */
  isLoadingVisible() {
    return this.showLoading;
  }

  /**
   * ETA フィルター状態を取得
   * @returns {boolean}
   */
  isDischargingVisible() {
    return this.showDischarging;
  }

  /**
   * 指定IDのプロジェクトを取得
   * @param {number} projectId
   * @returns {Object|null}
   */
  getProjectById(projectId) {
    return this.projects.find(p => p.id === projectId) || null;
  }

  /**
   * 指定日付のイベントを取得
   * @param {Date} date
   * @returns {Array}
   */
  getEventsByDate(date) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const allEvents = this.getFilteredEvents();
    
    return allEvents.filter(event => {
      const eventDate = event.start;
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  }

  /**
   * ステータススタイルを取得
   * @param {string} status
   * @returns {string}
   */
  getStatusStyle(status) {
    return this.statusStyles[status] || 'bg-gray-100 text-gray-800';
  }
}

export default EventManager;
