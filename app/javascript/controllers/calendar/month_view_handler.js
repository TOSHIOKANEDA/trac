
/**
 * MonthViewHandler
 * 月表示固有のロジックを管理するハンドラークラス
 * - イベント描画
 * - イベント数制限
 * - ツールチップ表示
 * - ホバーエフェクト
 */
export class MonthViewHandler {
  constructor(adapter, eventManager, targets, onEventClick) {
    this.adapter = adapter;
    this.eventManager = eventManager;
    this.targets = targets;  // コントローラーから渡されるtargets
    this.onEventClick = onEventClick; 
  }

  /**
   * レンダリング完了を待ってから制限を適用
   * MutationObserverを使用してDOMの変更を監視し、
   * 100ms間DOMに変更がなければレンダリング完了と判定
   * 最大2秒のタイムアウトを設定して無限待機を防止
   */
  waitForRenderComplete() {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        // DOMの変更が一定時間なくなったら完了と判定
        clearTimeout(this.renderTimeout);
        
        this.renderTimeout = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 100);  // 100ms間、DOMの変更がなければ完了と判定
      });

      observer.observe(this.targets.calendar, {
        childList: true,
        subtree: true,
        attributes: true
      });

      // タイムアウト: 最大2秒待つ
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 2000);
    });
  }

  /**
   * ビュー切り替え時の初期化
   */
  onViewChange() {
    // このハンドラーをアダプターに設定
    this.adapter.setHandler(this);
    
    // ビュー切り替え後のレンダリング完了を待つ
    this.waitForRenderComplete().then(() => {
      this.limitEventsPerCell();
      this.setupMoreLinkHoverListeners();
    });
  }

  /**
   * FullCalendar callback: eventContent
   * イベント内容（HTML）を返す
   */
  eventContent = (arg) => {
    const props = arg.event.extendedProps;
    const isTsumi = props.vessel_action === 'loading';  // 言語非依存判定
    const portCode = props.portCode || '';
    
    // 表示選択に基づいて表示内容を決定
    let displayValue = this.getDisplayValue(props);
    
    const badgeClass = isTsumi ? 'bg-blue-600' : 'bg-red-600';
    const vesselAction = isTsumi ? 'loading' : 'discharging';
    
    let html = `
      <div class="h-full w-full flex items-center justify-between px-1 py-0.5 rounded" data-vessel-action="${vesselAction}">
        <span class="text-white text-xs font-bold px-1.5 py-0.5 rounded ${badgeClass} whitespace-nowrap">${portCode}</span>
        <span class="text-gray-900 text-xs truncate flex-1 px-1">${displayValue}</span>
        <span class="text-gray-900 text-xs font-bold whitespace-nowrap">···</span>
      </div>
    `;
    return { html: html };
  }

  /**
   * FullCalendar callback: eventDidMount
   * イベント要素が作成された後の処理
   */
  eventDidMount = (info) => {
    if (info.event.groupId) {
      info.el.setAttribute('data-group-id', info.event.groupId);
    }
    
    // 親要素（.fc-daygrid-event）に data-vessel-action を追加
    const vesselAction = info.event.extendedProps.vessel_action;
    info.el.setAttribute('data-vessel-action', vesselAction);
    
    // 背景色を設定
    if (vesselAction === 'discharging') {
      info.el.style.backgroundColor = '#FEEAEC';
    } else if (vesselAction === 'loading') {
      info.el.style.backgroundColor = '#E2ECFE';
    }
  }

  /**
   * FullCalendar callback: datesSet
   * 日付範囲が変更されたときの処理（月前後移動時に呼ばれる）
   */
  datesSet = () => {
    // 📝 レンダリング完了を待ってから制限を適用
    // （前月/次月ボタンでの移動など、再レンダリングが必要な場合に対応）
    setTimeout(() => {
      this.limitEventsPerCell();
      this.setupMoreLinkHoverListeners();
    }, 100);  // ← 100msの遅延で確実にレンダリング完了を待つ
  }

  /**
   * FullCalendar callback: eventMouseEnter
   * イベント上にマウスが進入したときの処理
   */
  eventMouseEnter = (info) => {
    const groupId = info.event.groupId;
    if (!groupId) return;
    
    const isSingleEvent = !info.event.extendedProps.eta;
    if (isSingleEvent) return;

    // グループのイベントをハイライト
    document.querySelectorAll(`[data-group-id="${groupId}"]`).forEach(el => {
      el.classList.add('event-highlight-hover');
    });

    // ペアのイベントが両方画面上に表示されているか判定
    const pairOnScreen = document.querySelectorAll(`[data-group-id="${groupId}"]`).length === 2;

    if (!pairOnScreen) {
      // ペアが表示されていない場合、ツールチップを表示
      this.showDateTooltip(info);
    }
  }

  /**
   * FullCalendar callback: eventMouseLeave
   * イベントからマウスが離れたときの処理
   */
  eventMouseLeave = (info) => {
    const groupId = info.event.groupId;
    if (groupId) {
      document.querySelectorAll(`[data-group-id="${groupId}"]`).forEach(el => {
        el.classList.remove('event-highlight-hover');
      });
    }
    if (this.targets.dateTooltip) {
      this.targets.dateTooltip.classList.add('hidden');
    }
  }

  eventClick = (info) => {
    if (this.onEventClick) {
      this.onEventClick(info);  // ← コールバック実行
    }
  }

  /**
   * 各セルのイベント数を3つに制限
   */
  limitEventsPerCell() {
    const dayCells = document.querySelectorAll('.fc-daygrid-day');
    
    dayCells.forEach((dayCell, cellIndex) => {
      const eventElements = dayCell.querySelectorAll('.fc-daygrid-event');
      const visibleLimit = 3;
      
      // 4個目以降のイベントを隠す
      eventElements.forEach((el, index) => {
        if (index >= visibleLimit) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      });
      
      // 隠れたイベント数をカウント
      const hiddenCount = eventElements.length - visibleLimit;
      
      // 既に存在する「+ X件」ボタンを削除
      const existingMoreLink = dayCell.querySelector('.fc-daygrid-more-link-custom');
      if (existingMoreLink) {
        existingMoreLink.remove();
      }
      
      // 隠れたイベントがあれば「+ X件」ボタンを追加
      if (hiddenCount > 0) {
        const moreLink = document.createElement('div');
        moreLink.className = 'fc-daygrid-more-link-custom';
        moreLink.textContent = `+ ${hiddenCount}件`;
        moreLink.style.cssText = `
          font-weight: 600;
          color: #4338ca;
          cursor: pointer;
          font-size: 0.75rem;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          margin-bottom: 4px;
        `;
        
        const dayEvents = dayCell.querySelector('.fc-daygrid-day-events');
        if (dayEvents) {
          dayEvents.appendChild(moreLink);
        }
      }
    });
  }

  /**
   * ツールチップリスナーを設定
   */
  setupMoreLinkHoverListeners() {
    const moreLinks = document.querySelectorAll('.fc-daygrid-more-link, .fc-daygrid-more-link-custom');
    
    moreLinks.forEach(link => {
      // 既存のリスナーを削除
      link.removeEventListener('mouseenter', this.boundShowHiddenEvents);
      link.removeEventListener('mouseleave', this.boundHideHiddenEvents);
      
      // リスナーを設定
      this.boundShowHiddenEvents = (e) => {
        if (this.targets.hiddenEventsTooltip && !this.targets.hiddenEventsTooltip.classList.contains('hidden')) {
          this.closeHiddenEventsTooltip();
        }
        this.showHiddenEventsTooltip(link, e);
      };
      
      this.boundHideHiddenEvents = () => {
        // マウス出時には何もしない（外部クリックで閉じる）
      };
      
      link.addEventListener('mouseenter', this.boundShowHiddenEvents);
      link.addEventListener('mouseleave', this.boundHideHiddenEvents);
    });

    // 📝 外部クリックでツールチップを閉じるリスナーを設定
    document.removeEventListener('click', this.boundDocumentClick);
    this.boundDocumentClick = (e) => {
      if (this.targets.hiddenEventsTooltip && !this.targets.hiddenEventsTooltip.classList.contains('hidden')) {
        // ツールチップ自身またはモアリンク内のクリックでなければ閉じる
        if (!this.targets.hiddenEventsTooltip.contains(e.target) && 
            !document.querySelector('.fc-daygrid-more-link, .fc-daygrid-more-link-custom')?.contains(e.target)) {
          this.closeHiddenEventsTooltip();
        }
      }
    };
    document.addEventListener('click', this.boundDocumentClick);
  }

  /**
   * 隠れたイベント一覧を表示
   */
  showHiddenEventsTooltip(moreLink, event) {
      const dayCell = moreLink.closest('.fc-daygrid-day');
      if (!dayCell) return;

      const dateMatch = dayCell.getAttribute('data-date');
      if (!dateMatch) return;

      // その日付の全イベントを取得
      const allEvents = this.adapter.getEvents();
      const filteredEvents = allEvents.filter(ev => {
        const eventDate = ev.start;
        const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return eventDateStr === dateMatch;
      });

      // 表示可能なイベント数（通常は3個）
      const visibleCount = 3;
      const hiddenEvents = filteredEvents.slice(visibleCount);

      if (hiddenEvents.length === 0) return;

      // ツールチップHTMLを生成
      let html = '';
      hiddenEvents.forEach((ev) => {
        const props = ev.extendedProps;
        const isTsumi = props.vessel_action === 'loading';
        const badgeClass = isTsumi ? 'bg-blue-600' : 'bg-red-600';
        const portCode = props.portCode || '';
        const displayValue = this.getDisplayValue(props);
        const vesselAction = props.vessel_action;

        html += `
          <div class="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors text-sm" data-event-id="${ev.id}" data-vessel-action="${vesselAction}" style="background-color: ${vesselAction === 'discharging' ? '#FEEAEC' : '#E2ECFE'};">
            <span class="text-white text-xs font-bold px-2 py-1 rounded ${badgeClass} whitespace-nowrap">${portCode}</span>
            <span class="text-gray-900 text-xs flex-1">${displayValue}</span>
          </div>
        `;
      });

      // ツールチップに設定
      if (this.targets.hiddenEventsList) {
        this.targets.hiddenEventsList.innerHTML = html;
        
        // ✅ ツールチップのイベント要素にクリックリスナーを設定
        const eventItems = this.targets.hiddenEventsList.querySelectorAll('[data-event-id]');
        eventItems.forEach(item => {
          item.removeEventListener('click', this.boundEventItemClick);
          
          this.boundEventItemClick = (e) => {
            const eventId = item.getAttribute('data-event-id');
            const event = this.adapter.getEventById(eventId);
            if (event && this.onEventClick) {
              this.onEventClick({ event });
            }
            // ツールチップを閉じる
            this.closeHiddenEventsTooltip();
          };
          
          item.addEventListener('click', this.boundEventItemClick);
        });
      }

      if (this.targets.hiddenEventsTooltip) {
        this.targets.hiddenEventsTooltip.classList.remove('hidden');
        this.positionTooltip(moreLink);
      }
  }

  /**
   * 隠れたイベント一覧を非表示
   */
  closeHiddenEventsTooltip() {
    if (this.targets.hiddenEventsTooltip) {
      this.targets.hiddenEventsTooltip.classList.add('hidden');
    }
  }

  /**
   * ツールチップの位置を調整
   */
  positionTooltip(element) {
    const parent = element.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const tooltip = this.targets.hiddenEventsTooltip;

    // 計測
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    const tooltipRect = tooltip.getBoundingClientRect();
    tooltip.style.visibility = 'visible';

    // 中央位置
    const left = parentRect.left + parentRect.width / 2 - tooltipRect.width / 2;
    const top = parentRect.top + parentRect.height / 2 - tooltipRect.height / 2;

    // 📍 position: fixed に変更
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * ペアイベント用のツールチップを表示
   */
  showDateTooltip(info) {
    const isTsumi = info.event.extendedProps.vessel_action === 'loading';
    const otherDate = new Date(isTsumi ? info.event.extendedProps.eta : info.event.extendedProps.etd);
    
    // ペアの反対側のイベント情報を取得
    const otherEventId = isTsumi ? `${info.event.extendedProps.id}-eta` : `${info.event.extendedProps.id}-etd`;
    const otherEvent = this.adapter.getEventById(otherEventId);
    const otherType = otherEvent ? otherEvent.extendedProps.type : (isTsumi ? '揚げ' : '積み');
    const tooltipText = `${otherDate.getMonth() + 1}/${otherDate.getDate()} ${otherType}`;
    
    if (this.targets.dateTooltip) {
      this.targets.dateTooltip.innerHTML = tooltipText;
      this.targets.dateTooltip.classList.remove('hidden');

      const hoveredRect = info.el.getBoundingClientRect();
      const calendarRect = this.targets.calendar?.getBoundingClientRect() || { left: 0, top: 0 };
      
      const x = hoveredRect.left + hoveredRect.width / 2 - calendarRect.left;
      const y = isTsumi 
        ? (hoveredRect.bottom - calendarRect.top + 15) 
        : (hoveredRect.top - calendarRect.top - 15);

      const tooltipRect = this.targets.dateTooltip.getBoundingClientRect();
      this.targets.dateTooltip.style.left = `${x - tooltipRect.width / 2}px`;
      this.targets.dateTooltip.style.top = `${isTsumi ? y : y - tooltipRect.height}px`;
    }
  }

  /**
   * 表示値を取得
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
   * グローバルリスナーをクリーンアップ
   * コンポーネント破棄時に呼ぶ
   */
  cleanup() {
    // 📝 外部クリックリスナーを削除
    if (this.boundDocumentClick) {
      document.removeEventListener('click', this.boundDocumentClick);
    }
  }
}

export default MonthViewHandler;