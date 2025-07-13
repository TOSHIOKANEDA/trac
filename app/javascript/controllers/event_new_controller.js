import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = [
    "containerTableBody", "cargoTableBody", "fileCounter", 
    "milestoneModalOverlay", "milestoneModal", "milestoneContent", "soaInput",
    "operationsDropdown", "operationsDropdownContent",
    "chatModal", "chatModalOverlay", "chatForm", "chatNameInput","chatModalContent",
    "participantInput", "participantsList", "participantSelect",
    "portSearchInputBox", "portSearchModal", "portSearchModalInput", "portSearchResults"
  ]

  connect() {
    this.setupDropdownClickOutside();
    this.fileCount = 3;
    this.participants = []; // チャット参加者を管理
    this.initializeFlatpickr();
    const portDataEl = document.getElementById("port-data"); // 港検索を表示
    this.portDataList = portDataEl ? JSON.parse(portDataEl.dataset.ports) : []
    // chatId がある場合のみ購読
    const chatId = this.hasChatIdValue ? this.chatIdValue : this.element.dataset.chatId
    if (chatId) {
      subscribeToChat(chatId)
    }
  }

  disconnect() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }

  // Flatpickrの初期化
  initializeFlatpickr() {
    if (this.hasSoaInputTarget && window.flatpickr) {
      flatpickr(this.soaInputTarget, {
        mode: "single",
        dateFormat: "Y-m",
        defaultDate: "2025-08",
        locale: "ja",
        plugins: [
          new window.monthSelectPlugin({
            shorthand: true,
            dateFormat: "Y-m",
            altFormat: "Y年m月"
          })
        ]
      });
    }
  }

  // ドロップダウン外部クリックの設定
  setupDropdownClickOutside() {
    this.clickOutsideHandler = (event) => {
      if (this.hasOperationsDropdownTarget && !this.operationsDropdownTarget.contains(event.target)) {
        this.closeOperationsDropdown();
      }
    };
    document.addEventListener('click', this.clickOutsideHandler);
  }

  // 操作ドロップダウンの開閉
  toggleOperations(event) {
    event.preventDefault();
    if (!this.hasOperationsDropdownTarget || !this.hasOperationsDropdownContentTarget) return;
    
    const dropdown = this.operationsDropdownTarget;
    const content = this.operationsDropdownContentTarget;
    
    dropdown.classList.toggle('show');
    content.classList.toggle('show');
  }

  // 操作ドロップダウンを閉じる
  closeOperationsDropdown(event) {
    if (event) {
      event.preventDefault();
    }
    if (!this.hasOperationsDropdownTarget || !this.hasOperationsDropdownContentTarget) return;
    
    const dropdown = this.operationsDropdownTarget;
    const content = this.operationsDropdownContentTarget;
    
    dropdown.classList.remove('show');
    content.classList.remove('show');
  }

  // チャット追加
  addChat(event) {
    if (event) {
      event.preventDefault();
    }
    this.closeOperationsDropdown();
    this.participants = []; // 参加者リストをリセット
    this.showChatCreationModal();
  }

  showChatCreationModal(event) {
    if (event) {
      event.preventDefault();
    }
    // モーダルを表示
    this.chatModalOverlayTarget.classList.add('active');
    // モーダルコンテンツにアニメーションクラスを追加
    this.chatModalContentTarget.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // チャット作成モーダルを閉じる
  closeChatCreation() {
    // モーダルコンテンツからアニメーションクラスを削除
    // chatModalContentTargetは、.modal_showを持つ要素を指します
    this.chatModalContentTarget.classList.remove('open');
    
    // アニメーションが完了するのを待ってからモーダルを完全に非表示にする
    setTimeout(() => {
      // モーダルオーバーレイを非表示にする
      this.chatModalOverlayTarget.classList.remove('active');
      // スクロールを有効化
      document.body.style.overflow = '';
    }, 300);
  }

  // チャットモーダル背景クリックで閉じる
  closeChatModal(event) {
    // クリックされた要素がモーダルの背景（chatModalOverlayTarget）であるか確認
    if (event.target === this.chatModalOverlayTarget) {
      // closeChatCreationメソッドを呼び出してモーダルを閉じる
      this.closeChatCreation();
    }
  }

  // 参加者を追加（select対応版）
  addParticipant() {
    if (this.hasParticipantSelectTarget) {
      const select = this.participantSelectTarget;
      const selectedOption = select.options[select.selectedIndex];

      if (!selectedOption || !selectedOption.value) {
        this.showNotification('参加者を選択してください', 'warning');
        return;
      }

      const userId = selectedOption.value;
      const name = selectedOption.dataset.name;
      const company = selectedOption.dataset.company;

      // 既に追加済みかチェック
      const isDuplicate = this.participants.some(p => p.id === userId);
      if (isDuplicate) {
        this.showNotification('この参加者は既に追加されています', 'warning');
        return;
      }

      // 参加者を追加
      const participant = {
        id: userId,
        name: name,
        company: company
      };

      this.participants.push(participant);
      this.updateParticipantsList();
      select.value = '';

      this.showNotification('参加者を追加しました', 'success');
      return;
    }
  }

  // 参加者を削除
  removeParticipant(event) {
    const index = parseInt(event.currentTarget.dataset.removeIndex);
    if (isNaN(index) || index < 0 || index >= this.participants.length) {
      this.showNotification('削除できませんでした', 'error');
      return;
    }

    this.participants.splice(index, 1);
    this.updateParticipantsList();
    this.showNotification('参加者を削除しました', 'info');
  }

  // 参加者リストを更新
  updateParticipantsList() {
    const container = this.participantsListTarget;

    if (this.participants.length === 0) {
      container.innerHTML = `
        <div class="empty-participants">
          参加者が追加されていません
        </div>
      `;
      return;
    }

    const participantHTML = this.participants.map((participant, index) => {
      const initial = participant.name.charAt(0).toUpperCase();
      return `
        <div class="participant-item">
          <div class="participant-info">
            <div class="participant-avatar">${initial}</div>
            <div class="participant-details">
              <div class="participant-name">${participant.name}</div>
              <div class="participant-company">${participant.company}</div>
            </div>
          </div>
          <button type="button" class="remove-participant" data-remove-index="${index}" data-action="click->event-new#removeParticipant">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = participantHTML;
  }

  // チャット作成
  createChat(event) {
    event.preventDefault();

    const chatName = this.chatNameInputTarget.value.trim();

    if (!chatName) {
      this.showNotification('チャット名を入力してください', 'warning');
      return;
    }

    if (this.participants.length === 0) {
      this.showNotification('少なくとも1人の参加者を追加してください', 'warning');
      return;
    }

    // チャットウィジェットを作成
    this.createChatWidget(chatName, 'customer', this.participants);

    // モーダルを閉じる
    this.closeChatCreation();

    this.showNotification(`「${chatName}」チャットを作成しました`, 'success');
  }

  // チャットウィジェットを作成
  createChatWidget(chatName, chatType, participants) {
    const chatWidgets = document.querySelector('.chat-widgets');
    if (!chatWidgets) {
      console.error('Chat widgets container not found');
      return;
    }

    const chatId = `chat-${Date.now()}`;
    const headerClass = chatType === 'business' ? 'business' : '';
    const icon = chatType === 'business' ? 'fas fa-building' : 'fas fa-comments';

    const participantNames = participants.map(p => `${p.name}（${p.company}）`).join(', ');

    const newChatHTML = `
      <div class="chat-widget" id="${chatId}">
        <div class="chat-header ${headerClass}" data-action="click->event-new#toggleChat" data-chat-id="${chatId}">
          <span><i class="${icon}"></i> ${chatName}</span>
          <button class="chat-toggle">−</button>
        </div>
        <div class="chat-content">
          <div class="chat-message">
            <strong>システム</strong><br>
            ${chatName}が作成されました。<br>
            参加者: ${participantNames}
          </div>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="メッセージを入力..." data-action="keypress->event-new#sendChatMessage">
        </div>
      </div>
    `;

    chatWidgets.insertAdjacentHTML('beforeend', newChatHTML);
  }


  // チャットフォームをクリア
  clearChatForm() {
    if (this.hasChatNameInputTarget) {
      this.chatNameInputTarget.value = '';
    }
    if (this.hasParticipantInputTarget) {
      this.participantInputTarget.value = '';
    }
    if (this.hasParticipantSelectTarget) {
      this.participantSelectTarget.value = '';
    }
    
    // 参加者リストをクリア
    this.participants = [];
    this.updateParticipantsList();
  }


  // 通知表示（拡張版）
  showNotification(message, type = 'success') {
    const colors = {
      success: '#28a745',
      warning: '#ffc107',
      info: '#17a2b8',
      error: '#dc3545'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.success};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    // CSS アニメーションを追加（一時的）
    if (!document.querySelector('#notification-style')) {
      const style = document.createElement('style');
      style.id = 'notification-style';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 3秒後に削除
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // アコーディオン機能
  toggleSection(event) {
    const sectionId = event.currentTarget.dataset.section;
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.toggle('collapsed');
    }
  }

  // チャット最小化/最大化機能
  toggleChat(event) {
    const chatId = event.currentTarget.dataset.chatId;
    const chatWidget = document.getElementById(chatId);
    const toggleButton = chatWidget.querySelector('.chat-toggle');
    
    if (chatWidget && toggleButton) {
      chatWidget.classList.toggle('minimized');
      toggleButton.textContent = chatWidget.classList.contains('minimized') ? '+' : '−';
    }
  }

  // イベント伝播を停止（パネル内クリック時）
  stopPropagation(event) {
    event.stopPropagation();
  }

  // 進捗表示（案件一覧スタイルに統一）
  showMilestone(event) {
    event.preventDefault();
    if (!this.hasMilestoneModalOverlayTarget) {
      console.error('milestoneModalOverlay target not found');
      return;
    }

    const modalOverlay = this.milestoneModalOverlayTarget;
    const modal = this.milestoneModalTarget;
    
    // モーダルオーバーレイを表示
    modalOverlay.classList.add('active');
    
    // スクロールを無効化
    document.body.style.overflow = 'hidden';
  }

  // 進捗モーダルを閉じる（案件一覧スタイルに統一）
  closeMilestoneModal(event) {
    event.preventDefault();
    if (!this.hasMilestoneModalOverlayTarget) {
      return;
    }

    const modalOverlay = this.milestoneModalOverlayTarget;
    
    // アクティブクラスを削除（アニメーションで非表示）
    modalOverlay.classList.remove('active');
    
    // スクロールを有効化
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 300); // CSSアニメーション時間に合わせる
  }

  // モーダルオーバーレイクリック時の処理
  modalOverlayClick(event) {
    // オーバーレイ自体がクリックされた場合のみモーダルを閉じる
    if (event.target === this.milestoneModalOverlayTarget) {
      this.closeMilestoneModal();
    }
  }

  // Enter キーで送信
  sendChatMessage(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const form = event.target.form
      if (!form) return

      const chatId = form.dataset.chatId
      const messagesContainer = document.getElementById(`chat_${chatId}_messages`)
      if (!chatId || !messagesContainer) return

      const formData = new FormData(form)

      fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { "Accept": "text/vnd.turbo-stream.html" }
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          return response.text()
        })
        .then(html => {
          messagesContainer.insertAdjacentHTML("beforeend", html)
          event.target.value = ""
        })
        .catch(err => console.error("Chat send error:", err))
    }
  }

  // コンテナ行を追加
  addContainerRow() {
    if (!this.hasContainerTableBodyTarget) return;
    // 現在の時刻をユニークなインデックスとして使用（Railsの推奨方法）
    const newIndex = new Date().getTime();
    
    const newRow = this.containerTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td><input class="table-input container-number-input" type="text" name="event[containers_attributes][${newIndex}][cntr_num]" id="event_containers_attributes_${newIndex}_cntr_num"></td>
      <td>
      <select class="container-type-select" name="event[containers_attributes][${newIndex}][cntr_type]" id="event_containers_attributes_${newIndex}_cntr_type">
          <option value="Dry">Dry</option>
          <option value="Reefer">Reefer</option>
          <option value="OT">OT</option>
          <option value="FR">FR</option>
        </select>
      </td>
      <td>
        <select class="container-type-select" name="event[containers_attributes][${newIndex}][cntr_size]" id="event_containers_attributes_${newIndex}_cntr_size">
          <option value="20'">20'</option>
          <option value="40'">40'</option>
          <option value="40'HC">40'HC</option>
        </select>
      </td>
      <td><input class="table-input container-seal-input" type="text" name="event[containers_attributes][${newIndex}][cntr_seal]" id="event_containers_attributes_${newIndex}_cntr_seal"></td>
      <td><input class="table-input container-remark-input" type="text" name="event[containers_attributes][${newIndex}][cntr_remark]" id="event_containers_attributes_${newIndex}_cntr_remark"></td>
      <td>
        <button type="button" class="delete-container-btn" title="コンテナを削除" data-action="click->event-new#deleteRow" data-target-name="containerTableBody">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
      `;
  }

  // 貨物行を追加
  addCargoRow() {
    if (!this.hasCargoTableBodyTarget) return;
    const newIndex = new Date().getTime();
    
    const newRow = this.cargoTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][pkg]" id="event_event_goods_attributes_${newIndex}_pkg"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][type_of_pkg]" id="event_event_goods_attributes_${newIndex}_type_of_pkg"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][n_w]" id="event_event_goods_attributes_${newIndex}_"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][g_w]" id="event_event_goods_attributes_${newIndex}_"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][three_m]" id="event_event_goods_attributes_${newIndex}_"></td>
      <td>
        <button type="button" class="delete-good-btn" title="貨物を削除" data-action="click->event-new#deleteRow" data-target-name="cargoTableBody">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
  }

  // フォーカス時の処理
  handleFocus(event) {
    event.target.style.transform = 'translateY(-2px)';
    event.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
  }

  // ブラー時の処理
  handleBlur(event) {
    event.target.style.transform = 'translateY(0)';
    event.target.style.boxShadow = 'none';
  }
}
