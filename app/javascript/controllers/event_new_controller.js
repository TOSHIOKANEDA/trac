import BaseController from "./base_controller"
import consumer from "../channels/consumer"

export default class extends BaseController {
  static targets = [
    "containerTableBody", "cargoTableBody", "fileCounter", 
    "milestoneModalOverlay", "milestoneModal", "milestoneContent", "soaInput",
    "operationsDropdown", "operationsDropdownContent",
    "chatModal", "chatModalOverlay", "chatForm", "chatNameInput","chatModalContent",
    "participantInput", "participantsList", "participantSelect",
    "portSearchInputBox", "portSearchModal", "portSearchModalInput", "portSearchResults"
  ]

  static values = { 
    chatId: Number,
    eventId: Number 
  }

  connect() {
    this.setupDropdownClickOutside();
    this.fileCount = 3;
    this.participants = []; // チャット参加者を管理
    this.initializeFlatpickr();
    const portDataEl = document.getElementById("port-data"); // 港検索を表示
    this.portDataList = portDataEl ? JSON.parse(portDataEl.dataset.ports) : []
    if (this.hasChatIdValue && this.hasEventIdValue) {
      this.setupChatChannel()
    }
  }

  disconnect() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
    // ページを離れる時にAction Cable接続を切断
    if (this.chatChannel) {
      this.chatChannel.unsubscribe()
    }
  }

  setupChatChannel() {
    this.chatChannel = consumer.subscriptions.create({
      channel: "ChatChannel",
      event_id: this.eventIdValue,  // data-event-new-event-id-value
      chat_id: this.chatIdValue     // data-event-new-chat-id-value
    }, {
      connected() {
        console.log(`Chat channel connected: event_${this.eventIdValue}_chat_${this.chatIdValue}`)
      },

      disconnected() {
        console.log("Chat channel disconnected")  
      },

      received: (data) => {
  console.log("=== Message received ===")
  console.log("Received data:", data)
  console.log("Current controller element:", this.element)
  console.log("Chat content element:", this.element.querySelector('.chat-content'))
  
        
        // メッセージをチャット画面に追加
        this.addMessageToChat(data)
      }
    })
  }

  sendChatMessage(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const content = event.target.value.trim()
      
      if (content) {
        // Action Cable経由でメッセージ送信（usernameを削除）
        this.chatChannel.send({
          message: content,
          event_id: this.eventIdValue,
          chat_id: this.chatIdValue
        })
        
        // 入力欄をクリア
        event.target.value = ''
      }
    }
  }

  addMessageToChat(data) {
    // 現在のチャットコントローラーのelement内でのみ検索
    const chatContent = this.element.querySelector('.chat-content');
    
    if (chatContent) {
      // チャットが閉じている場合は開く
      if (chatContent.style.display === 'none') {
        chatContent.style.display = 'block';
        const toggleButton = this.element.querySelector('.chat-toggle');
        if (toggleButton) {
          toggleButton.textContent = '−';
        }
        this.element.classList.remove('collapsed');
      }
      
      // 新しいメッセージ要素を作成
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message';
      
      // データから時刻を使用（サーバーから送信される）
      const timeString = data.created_at || this.getCurrentTime();
      
      // メッセージの中身を設定（リンク対応）
      messageElement.innerHTML = `
        <strong>${this.escapeHtml(data.username)} ${timeString}</strong><br>
        ${this.linkify(this.escapeHtml(data.message))}
      `;
      
      // チャット画面に追加
      chatContent.appendChild(messageElement);
      
      // 一番下にスクロール
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }

  // 現在時刻を取得するヘルパーメソッドを追加
  getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
          now.getMinutes().toString().padStart(2, '0');
  }


  // HTMLエスケープ用のメソッドを追加（セキュリティ対策）
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // linkifyメソッドも修正（改行対応）
  linkify(text) {
    // まず改行を<br>に変換
    let processedText = text.replace(/\n/g, '<br>');
    
    // 次にURLをリンクに変換
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return processedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
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

    // ID指定で3つ目のチャット（other）を取得
    const otherChat = document.getElementById('temporary-chat');
    
    if (otherChat) {
      // チャット名を更新
      const chatHeader = otherChat.querySelector('.chat-header span');
      if (chatHeader) {
        chatHeader.innerHTML = `<i class="fas fa-comments"></i> ${chatName}`;
      }
      
      // 参加者情報を準備
      const participantNames = this.participants.map(p => `${p.name}（${p.company}）`).join(', ');
      const chatId = otherChat.dataset.eventNewChatIdValue;
      
      // システムメッセージをAction Cable経由で送信（これによりメッセージが存在することになる）
      // まず適切なコントローラーインスタンスを見つける
      const chatController = this.application.getControllerForElementAndIdentifier(otherChat, 'event-new');
      
      if (chatController && chatController.chatChannel) {
        chatController.chatChannel.send({
          message: `${chatName}が作成されました。\n参加者: ${participantNames}`,
          chat_name: chatName,  // これを追加
          event_id: this.eventIdValue,
          chat_id: chatId
        });
      }
      
      // チャットを表示し、temporary-chat IDを削除
      otherChat.style.display = 'block';
      otherChat.removeAttribute('id');
      
      this.showNotification(`「${chatName}」チャットを作成しました`, 'success');
    } else {
      this.showNotification('利用可能なチャットが見つかりません', 'error');
    }

    this.closeChatCreation();
  }

  // チャットウィジェットを作成
  createChatWidget(chatName, chatType, participants) {
    const chatWidgets = document.querySelector('.chat-widgets');
    if (!chatWidgets) {
      console.error('Chat widgets container not found');
      return;
    }

    // event_idを確実に取得する
    let eventId = this.eventIdValue;
    
    // もしeventIdが取得できない場合は、既存のチャットから取得
    if (!eventId || eventId === 0) {
      const existingChat = document.querySelector('[data-event-new-event-id-value]');
      if (existingChat) {
        eventId = existingChat.dataset.eventNewEventIdValue;
      }
    }
    
    // それでも取得できない場合はURLから推測
    if (!eventId || eventId === 0) {
      const urlMatch = window.location.pathname.match(/\/events\/(\d+)/);
      if (urlMatch) {
        eventId = urlMatch[1];
      }
    }

    const tempChatId = Date.now();
    const chatId = `chat-${tempChatId}`;
    const headerClass = chatType === 'business' ? 'business' : 'customer';
    const icon = chatType === 'business' ? 'fas fa-building' : 'fas fa-comments';

    const participantNames = participants.map(p => `${p.name}（${p.company}）`).join(', ');

    const newChatHTML = `
      <div class="chat-widget" id="${chatId}" 
          data-controller="event-new"
          data-event-new-chat-id-value="${tempChatId}"
          data-event-new-event-id-value="${eventId}">
        
        <div class="chat-header ${headerClass}" data-action="click->event-new#toggleChat">
          <span><i class="${icon}"></i> ${chatName}</span>
          <button class="chat-toggle">−</button>
        </div>
        
        <div class="chat-content" data-event-new-target="chatContent">
          <div class="chat-message">
            <strong>システム</strong><br>
            ${chatName}が作成されました。<br>
            参加者: ${participantNames}
          </div>
        </div>
        
        <div class="chat-input">
          <input type="text" 
                placeholder="メッセージを入力..." 
                data-action="keypress->event-new#sendChatMessage"
                data-event-new-target="messageInput"
                class="form-input"
                autocomplete="off">
        </div>
      </div>
    `;

    chatWidgets.insertAdjacentHTML('beforeend', newChatHTML);
  }
  // addChatメソッドを以下のように修正
  addChat(event) {
    if (event) {
      event.preventDefault();
    }

    const modalOverlay = document.querySelector('[data-event-new-target="chatModalOverlay"]');
    const modalContent = document.querySelector('[data-event-new-target="chatModalContent"]');

    // 現在のインスタンスにモーダル要素がない場合、DOM操作で直接開く
    if (!this.hasChatModalOverlayTarget || !this.hasChatModalContentTarget) {
      if (modalOverlay && modalContent) {
        console.log('DOM操作でモーダルを開く');
        modalOverlay.classList.add('active');
        modalContent.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // 操作ドロップダウンを閉じる
        const dropdown = document.querySelector('[data-event-new-target="operationsDropdown"]');
        const dropdownContent = document.querySelector('[data-event-new-target="operationsDropdownContent"]');
        if (dropdown && dropdownContent) {
          dropdown.classList.remove('show');
          dropdownContent.classList.remove('show');
        }
      } else {
        console.log('モーダル要素が見つかりません');
      }
      return;
    }

    this.closeOperationsDropdown();
    this.participants = [];
    this.showChatCreationModal();
  }
  // showChatCreationModalメソッドも同様に修正
  showChatCreationModal(event) {
    if (event) {
      event.preventDefault();
    }
    
    // 必要なターゲット要素が存在するかチェック
    if (!this.hasChatModalOverlayTarget || !this.hasChatModalContentTarget) {
      console.log('Modal targets not found');
      return;
    }
    
    // モーダルを表示
    this.chatModalOverlayTarget.classList.add('active');
    // モーダルコンテンツにアニメーションクラスを追加
    this.chatModalContentTarget.classList.add('open');
    document.body.style.overflow = 'hidden';
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
    const chatWidget = this.element; // このコントローラーの要素
    const chatContent = chatWidget.querySelector('.chat-content');
    const toggleButton = chatWidget.querySelector('.chat-toggle');
    
    if (chatContent && toggleButton) {
      if (chatContent.style.display === 'none') {
        chatContent.style.display = 'block';
        toggleButton.textContent = '−';
        chatWidget.classList.remove('collapsed');
      } else {
        chatContent.style.display = 'none';
        toggleButton.textContent = '+';
        chatWidget.classList.add('collapsed');
      }
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
