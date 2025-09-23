import { Controller } from "@hotwired/stimulus";
import EventManager from "./calendar/event_manager";
import CalendarAdapter from "./calendar/calendar_adapter";
import MonthViewHandler from "./calendar/month_view_handler";
import WeekViewHandler from "./calendar/week_view_handler";
import ModalHandler from "./calendar/modal_handler";
import DataGenerator from "./calendar/data_generator";

/**
 * CalendarController
 * メインコントローラー（修正版）
 * - UIイベント処理（ボタンクリック等）
 * - 各モジュール間の調整
 * - API からのデータ取得対応
 * 
 * 責務：
 * ✅ UIイベント処理のみ
 * ✅ API からのデータ取得処理
 * ❌ FullCalendar直接操作は行わない（アダプター経由）
 * ❌ 月表示ロジックは行わない（ハンドラー経由）
 * ❌ 週表示ロジックは行わない（ハンドラー経由）
 * ❌ モーダル制御は行わない（modal_handler経由）
 */
export default class extends Controller {
  static targets = [
    "calendar",
    "weekViewContainer",
    "loadingFilterCheckbox",
    "dischargingFilterCheckbox",
    "displaySelectBtn",
    "displayMenu",
    "monthViewBtn",
    "weekViewBtn",
    "currentMonth",
    "prevMonthBtn",
    "nextMonthBtn",
    "eventModal",
    "detailsModalContent",
    "dateTooltip",
    "hiddenEventsTooltip",
    "hiddenEventsList"
  ];

  async connect() {
    try {
      // lucide icons の初期化
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // 1️⃣ プロジェクトデータの生成（API から取得）
      console.log('🔄 Fetching projects from API...');
      const projects = await DataGenerator.generateProjects();
      console.log('✅ Projects loaded:', projects.length);

      // データがない場合の警告
      if (projects.length === 0) {
        console.warn('⚠️ No projects loaded. Please check API endpoint.');
      }

      // 2️⃣ EventManager を作成
      this.eventManager = new EventManager(projects);

      // 3️⃣ CalendarAdapter を作成
      this.adapter = new CalendarAdapter(this.calendarTarget, this.eventManager);

      // 4️⃣ ModalHandler を作成
      this.modalHandler = new ModalHandler(
        this.adapter,
        this.eventManager,
        {
          eventModal: this.eventModalTarget,
          detailsModalContent: this.detailsModalContentTarget
        }
      );

      // 5️⃣ MonthViewHandler を作成
      this.monthViewHandler = new MonthViewHandler(
        this.adapter,
        this.eventManager,
        {
          calendar: this.calendarTarget,
          dateTooltip: this.dateTooltipTarget,
          hiddenEventsTooltip: this.hiddenEventsTooltipTarget,
          hiddenEventsList: this.hiddenEventsListTarget
        },
        (info) => this.modalHandler.showEventDetails(info)  // ✅ ModalHandlerのコールバック
      );

      // 6️⃣ WeekViewHandler を作成（weekViewContainerがあるかチェック）
      if (this.hasWeekViewContainerTarget) {
        this.weekViewHandler = new WeekViewHandler(
          this.adapter,
          this.eventManager,
          {
            weekViewContainer: this.weekViewContainerTarget
          },
          (info) => this.modalHandler.showEventDetails(info)  // ✅ ModalHandlerのコールバック
        );
      }

      // ✅ ハンドラーを先に設定（initialize の前に）
      this.adapter.setHandler(this.monthViewHandler);

      // 7️⃣ FullCalendar を初期化
      this.adapter.initialize();

      // 8️⃣ ハンドラーを設定（月表示初期化）
      // ✅ onViewChange() を呼ぶ（「+ X件」ボタン生成に必須）
      this.monthViewHandler.onViewChange();

      // 9️⃣ フィルターボタンを更新
      this.updateFilterButtons();

      // 🔟 月表示を更新
      this.updateMonthDisplay();

      // 1️⃣1️⃣ 現在のビューを記録（デフォルトは月表示）
      this.currentView = 'month';

      console.log('✅ Calendar initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing calendar:', error);
    }
  }

  /**
   * ETD（出航）フィルター
   */
  filterLoading(e) {
    e.preventDefault();
    this.eventManager.toggleLoadingFilter();
    this.updateFilterButtons();
    this.adapter.refetchEvents();
    
    // イベント再取得後、レンダリング完了を待ってから制限を適用
    if (this.currentView === 'month') {
      this.monthViewHandler.waitForRenderComplete().then(() => {
        this.monthViewHandler.limitEventsPerCell();
        this.monthViewHandler.setupMoreLinkHoverListeners();
      });
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      this.weekViewHandler.renderWeekView();
    }
  }

  /**
   * ETA（到着）フィルター
   */
  filterDischarging(e) {
    e.preventDefault();
    this.eventManager.toggleDischargingFilter();
    this.updateFilterButtons();
    this.adapter.refetchEvents();
    
    // イベント再取得後、レンダリング完了を待ってから制限を適用
    if (this.currentView === 'month') {
      this.monthViewHandler.waitForRenderComplete().then(() => {
        this.monthViewHandler.limitEventsPerCell();
        this.monthViewHandler.setupMoreLinkHoverListeners();
      });
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      this.weekViewHandler.renderWeekView();
    }
  }

  /**
   * 表示選択を変更
   */
  changeDisplayOption(e) {
    this.eventManager.setDisplayOption(e.target.value);
    this.displayMenuTarget.classList.add('hidden');
    this.adapter.refetchEvents();
    
    // イベント再取得後、レンダリング完了を待ってから制限を適用
    if (this.currentView === 'month') {
      this.monthViewHandler.waitForRenderComplete().then(() => {
        this.monthViewHandler.limitEventsPerCell();
        this.monthViewHandler.setupMoreLinkHoverListeners();
      });
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      this.weekViewHandler.renderWeekView();
    }
  }

  /**
   * 月表示に切り替え
   */
  switchToMonth(e) {
    e.preventDefault();
    this.currentView = 'month';
    
    // 週表示コンテナを非表示
    if (this.hasWeekViewContainerTarget) {
      this.weekViewContainerTarget.classList.add('hidden');
      this.weekViewContainerTarget.style.display = 'none';
    }
    
    // カレンダーを表示（先に表示させる）
    this.calendarTarget.classList.remove('hidden');
    this.calendarTarget.style.display = 'block';
    
    // 表示選択メニューを表示
    this.displaySelectBtnTarget.classList.remove('hidden');
    
    // ボタンのスタイル切り替え
    this.monthViewBtnTarget.classList.add('bg-blue-600', 'text-white');
    this.monthViewBtnTarget.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    this.weekViewBtnTarget.classList.remove('bg-blue-600', 'text-white');
    this.weekViewBtnTarget.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    
    // ⭐ ハンドラーを再設定（コールバック設定を復帰）
    this.adapter.setHandler(this.monthViewHandler);
    
    // ビュー切り替え
    this.adapter.changeView('dayGridMonth');
    
    // 📝 レンダリング完了を待ってから制限を適用
    // （前月/次月ボタンでの移動など、再レンダリングが必要な場合に対応）
    setTimeout(() => {
      this.monthViewHandler.waitForRenderComplete().then(() => {
        this.monthViewHandler.limitEventsPerCell();
        this.monthViewHandler.setupMoreLinkHoverListeners();
      });
    }, 100);
  }

  /**
   * 週表示に切り替え
   */
  switchToWeek(e) {
    e.preventDefault();
    
    // weekViewHandlerが存在するか確認
    if (!this.weekViewHandler) {
      console.error('Week view handler is not initialized');
      return;
    }

    this.currentView = 'week';
    
    // ビュー切り替え
    this.weekViewBtnTarget.classList.add('bg-blue-600', 'text-white');
    this.weekViewBtnTarget.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    this.monthViewBtnTarget.classList.remove('bg-blue-600', 'text-white');
    this.monthViewBtnTarget.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    
    // 表示選択メニューを非表示
    this.displaySelectBtnTarget.classList.add('hidden');
    this.displayMenuTarget.classList.add('hidden');
    
    // 月表示コンテナを非表示、週表示コンテナを表示
    this.calendarTarget.classList.add('hidden');
    this.weekViewContainerTarget.classList.remove('hidden');
    this.weekViewContainerTarget.style.display = 'flex'; // 明示的に表示
    
    // ⭐ ハンドラーを再設定（コールバック設定を復帰）
    this.adapter.setHandler(this.weekViewHandler);
    
    // 週表示を初期化・レンダリング
    this.weekViewHandler.onViewChange();
  }

  /**
   * 前月に移動
   */
  prevMonth(e) {
    e.preventDefault();
    if (this.currentView === 'month') {
      this.adapter.prev();
      this.updateMonthDisplay();
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      this.weekViewHandler.prevWeek();
      this.updateMonthDisplay();
    }
  }

  /**
   * 次月に移動
   */
  nextMonth(e) {
    e.preventDefault();
    if (this.currentView === 'month') {
      this.adapter.next();
      this.updateMonthDisplay();
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      this.weekViewHandler.nextWeek();
      this.updateMonthDisplay();
    }
  }

  /**
   * 表示選択メニューを切り替え
   */
  toggleDisplayMenu(e) {
    e.preventDefault();
    this.displayMenuTarget.classList.toggle('hidden');
  }

  /**
   * 隠れたイベント一覧を非表示
   */
  closeHiddenEventsTooltip() {
    this.monthViewHandler.closeHiddenEventsTooltip();
  }

  /**
   * モーダルの背景クリック
   */
  modalBackgroundClick(event) {
    this.modalHandler.handleBackgroundClick(event);
  }

  /**
   * モーダルを閉じる
   */
  closeModal() {
    this.modalHandler.closeModal();
  }

  /**
   * リストからイベントを選択
   */
  selectEventFromList(event) {
    const eventId = event.currentTarget.getAttribute('data-event-id');
    this.modalHandler.selectEventFromList(eventId);
  }

  /**
   * フィルターボタンを更新
   */
  updateFilterButtons() {
    this.loadingFilterCheckboxTarget.checked = this.eventManager.isLoadingVisible();
    this.dischargingFilterCheckboxTarget.checked = this.eventManager.isDischargingVisible();
  }

  /**
   * 月表示を更新
   */
  updateMonthDisplay() {
    let currentDate;
    if (this.currentView === 'month') {
      currentDate = this.adapter.getDate();
    } else if (this.currentView === 'week' && this.weekViewHandler) {
      currentDate = this.weekViewHandler.getWeekStart();
    } else {
      currentDate = new Date();
    }

    if (currentDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      this.currentMonthTarget.textContent = `${year}年 ${month}月`;
    }
  }
}
