import BaseController from "./base_controller"
import ChatAjaxController from "./chat_ajax_controller"
import consumer from "../channels/consumer"

export default class extends BaseController {
  static targets = [
    "containerTableBody", "cargoTableBody",
    "milestoneModalOverlay", "milestoneModal", "milestoneContent",
    "operationsDropdown", "operationsDropdownContent",
    "chatModal", "chatModalOverlay", "chatForm", "chatNameInput","chatModalContent",
    "participantInput", "participantsList", "participantSelect"
  ]

  static values = { 
    chatId: Number,
    eventId: Number 
  }

  connect() {
    this.setupDropdownClickOutside();
    this.fileCount = 3;
    this.participants = []; // チャット参加者を管理
    const portDataEl = document.getElementById("port-data"); // 港検索を表示
    this.portDataList = portDataEl ? JSON.parse(portDataEl.dataset.ports) : []

    if (this.hasChatIdValue && this.hasEventIdValue) {
      this.setupChatChannel()
    }
    if (this.hasParticipantSelectTarget){
      this.updateChatParticipantSelectOptions();
    }
    this.chatAjax = new ChatAjaxController(this);
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

  // 選択肢の表示/非表示を更新
  updateChatParticipantSelectOptions() {
    const select = this.participantSelectTarget;
    if (!select) return;

    // 現在選択済みのuser_idを取得
    const selectedUserIds = this.getSelectedUserIds();

    // 全てのオプションをリセット（最初のプロンプトは除く）
    Array.from(select.options).slice(1).forEach(option => {
      if (selectedUserIds.includes(option.value)) {
        option.style.display = 'none';
      } else {
        option.style.display = 'block';
      }
    });
  }

  getSelectedUserIds() {
  const selectedIds = [];
  
  // fields_forの既存参加者（削除されていないもの）
  const existingParticipants = document.querySelectorAll('input[name*="[chat_users_attributes]"][name*="[user_id]"]');
  existingParticipants.forEach(input => {
    const participantItem = input.closest('.participant-item');
    const destroyField = participantItem.querySelector('input[name*="[_destroy]"]');
    
    // _destroyがfalseまたは存在しない場合のみ選択済みとみなす
    if (!destroyField || destroyField.value !== 'true') {
      selectedIds.push(input.value);
    }
  });
  
  return selectedIds;
  }

  // 新規参加者用のインデックスを管理
  get newParticipantIndex() {
    if (!this._newParticipantIndex) {
      this._newParticipantIndex = 1000; // 既存レコードと重複しないように大きな数から開始
    }
    return this._newParticipantIndex++;
  }

  addParticipant() {
    const select = this.participantSelectTarget;
    const userId = select.value;
    const selectedOption = select.options[select.selectedIndex];

    if (!userId) {
      this.showNotification('参加者を選択してください', 'warning');
      return;
    }

    const name = selectedOption.dataset.name;
    const company = selectedOption.dataset.company;

    // 重複チェック
    const existingParticipant = document.querySelector(`input[name*="[chat_users_attributes]"][value="${userId}"]`);
    if (existingParticipant) {
      this.showNotification('この参加者は既に追加されています', 'warning');
      return;
    }

    // 新しいfields_for形式のフィールドを動的に作成
    const container = document.getElementById('participants-container');
    const index = this.newParticipantIndex;
    
    const participantHTML = `
      <div class="participant-item" data-new-participant="true">
        <input type="hidden" name="chat[chat_users_attributes][${index}][user_id]" value="${userId}">
        <div class="participant-info">
          <div class="participant-avatar">${name.charAt(0).toUpperCase()}</div>
          <div class="participant-details">
            <div class="participant-name">${name}</div>
            <div class="participant-company">${company}</div>
          </div>
        </div>
        <button type="button" class="remove-participant" data-action="click->event-new#removeNewParticipant">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', participantHTML);
    
    // セレクトボックスをリセット
    select.selectedIndex = 0;
    this.updateChatParticipantSelectOptions();
    this.showNotification(`${name}を参加者に追加しました`, 'success');
  }

  // 既存参加者の削除
  removeExistingParticipant(event) {
    const button = event.currentTarget;
    const participantItem = button.closest('.participant-item');
    const destroyField = participantItem.querySelector('.destroy-field');
    
    // _destroyフィールドをtrueに設定（削除マーク）
    destroyField.value = true;
    participantItem.style.display = 'none';
    this.updateChatParticipantSelectOptions();
    this.showNotification('参加者を削除しました', 'success');
  }

  // 新規参加者の削除
  removeNewParticipant(event) {
    const button = event.currentTarget;
    const participantItem = button.closest('.participant-item');
    
    // 要素を完全に削除
    participantItem.remove();
    this.updateChatParticipantSelectOptions();
    this.showNotification('参加者を削除しました', 'success');
  }

  handleSubmitClick(event) {
    // 既に処理中なら無視
    if (this.isSubmitting) {
      event.preventDefault();
      return;
    }

    // 処理中フラグを設定
    this.isSubmitting = true;
    
    // 3秒後にフラグをリセット（エラー時の保険）
    setTimeout(() => {
      this.isSubmitting = false;
      // ボタンを再有効化
      event.target.disabled = false;
      event.target.value = "作成";
    }, 3000);
  }

  createChat(event) {
    event.preventDefault();
    this.chatAjax.cleanupInvalidDOMElements();
    // バリデーション
    if (!this.chatAjax.validateChatForm()) {
      return;
    }
    
    // データの準備
    const chatData = this.chatAjax.prepareChatData(event);
    if (!chatData) {
      return;
    }
    
    // フォーム送信
    this.chatAjax.submitChatForm(chatData);
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
    const chatWidget = event.currentTarget.closest('.chat-widget')
    
    if (chatWidget.classList.contains('minimized')) {
      // 展開
      chatWidget.classList.remove('minimized')
      chatWidget.classList.add('expanded')
      
      // チャット内容を最下部にスクロール
      setTimeout(() => {
        const chatContent = chatWidget.querySelector('.chat-content')
        if (chatContent) {
          chatContent.scrollTop = chatContent.scrollHeight
        }
      }, 300)
      
    } else {
      // 最小化
      chatWidget.classList.remove('expanded')
      chatWidget.classList.add('minimized')
    }
  }

  // イベント伝播を停止（パネル内クリック時）
  stopPropagation(event) {
    event.stopPropagation();
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
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][n_w]" id="event_event_goods_attributes_${newIndex}_n_w"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][g_w]" id="event_event_goods_attributes_${newIndex}_g_w"></td>
      <td><input class="table-input" type="text" name="event[event_goods_attributes][${newIndex}][three_m]" id="event_event_goods_attributes_${newIndex}_three_m"></td>
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

  toggleChatFromButton(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const chatId = button.dataset.chatId;
    const chatName = button.dataset.chatName;

    const chatWidget = document.querySelector(`[data-event-new-chat-id-value="${chatId}"]`);

    if (!chatWidget) {
      console.error(`Chat widget not found for chat_id: ${chatId}`);
      return;
    }

    if (this.currentOpenChatId === parseInt(chatId)) {
      this.closeChatWidget(chatWidget);
      this.currentOpenChatId = null;
      return;
    }

    if (this.currentOpenChatId !== null) {
      const previousChatWidget = document.querySelector(`[data-event-new-chat-id-value="${this.currentOpenChatId}"]`);
      if (previousChatWidget) {
        this.closeChatWidget(previousChatWidget);
      }
    }

    this.openChatWidget(chatWidget);
    this.currentOpenChatId = parseInt(chatId);
  }

  openChatWidget(chatWidget) {
    chatWidget.classList.remove('minimized');
    chatWidget.classList.add('expanded');
    
    chatWidget.style.display = 'block';

    const chatContent = chatWidget.querySelector('.chat-content');
    const chatInput = chatWidget.querySelector('.chat-input');
    if (chatContent) chatContent.style.display = 'block';
    if (chatInput) chatInput.style.display = 'flex';

    const toggleButton = chatWidget.querySelector('.chat-toggle');
    if (toggleButton) toggleButton.textContent = '−';

    setTimeout(() => {
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }, 300);
  }

  closeChatWidget(chatWidget) {
    chatWidget.classList.remove('expanded');
    chatWidget.classList.add('minimized');

    const chatContent = chatWidget.querySelector('.chat-content');
    const chatInput = chatWidget.querySelector('.chat-input');
    if (chatContent) chatContent.style.display = 'none';
    if (chatInput) chatInput.style.display = 'none';

    const toggleButton = chatWidget.querySelector('.chat-toggle');
    if (toggleButton) toggleButton.textContent = '＋';
  }

// ============================================
// ✨ チャット表示/非表示制御（修正版）
// ============================================
// 要件：
// - デフォルト: visibility: hidden (非表示)
// - ボタン押下: 該当チャットを表示、他を非表示
// - 「−」ボタン押下: そのチャットを非表示
// - 別ボタン押下: 前のチャットを非表示、新しいチャットを表示

toggleChat(event) {
  // 「−」ボタン押下時の処理（チャットヘッダーの toggle button）
  const chatWidget = event.currentTarget.closest('.chat-widget')
  const chatId = parseInt(chatWidget.dataset.eventNewChatIdValue)
  
  if (chatWidget.style.visibility === 'hidden' || chatWidget.style.visibility === '') {
    // 現在非表示 → 表示に変更
    this.openChatWidget(chatWidget)
    this.currentOpenChatId = chatId
  } else {
    // 現在表示中 → 非表示に変更
    this.closeChatWidget(chatWidget)
    this.currentOpenChatId = null
  }
}

toggleChatFromButton(event) {
  // ヘッダーのボタン押下時の処理
  event.preventDefault();
  const button = event.currentTarget;
  const chatId = button.dataset.chatId;
  const chatName = button.dataset.chatName;

  const chatWidget = document.querySelector(`[data-event-new-chat-id-value="${chatId}"]`);

  if (!chatWidget) {
    console.error(`Chat widget not found for chat_id: ${chatId}`);
    return;
  }

  // 同じボタンが既に開いている場合 → 非表示にする
  if (this.currentOpenChatId === parseInt(chatId)) {
    this.closeChatWidget(chatWidget);
    this.currentOpenChatId = null;
    return;
  }

  // 別のチャットが開いている場合 → そちらを非表示にする
  if (this.currentOpenChatId !== null) {
    const previousChatWidget = document.querySelector(`[data-event-new-chat-id-value="${this.currentOpenChatId}"]`);
    if (previousChatWidget) {
      this.closeChatWidget(previousChatWidget);
    }
  }

  // 新しいチャットを表示する
  this.openChatWidget(chatWidget);
  this.currentOpenChatId = parseInt(chatId);
}

  openChatWidget(chatWidget) {
  // チャットを表示する
  chatWidget.classList.remove('minimized');
  chatWidget.classList.add('expanded');
  
  // visibility: hidden を削除して表示
  chatWidget.style.visibility = 'visible';

  // コンテンツと入力欄を表示
  const chatContent = chatWidget.querySelector('.chat-content');
  const chatInput = chatWidget.querySelector('.chat-input');
  if (chatContent) chatContent.style.display = 'block';
  if (chatInput) chatInput.style.display = 'flex';

  // スクロール位置を一番下に
  setTimeout(() => {
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }, 300);
  }

  closeChatWidget(chatWidget) {
    // チャットを非表示にする
    chatWidget.classList.remove('expanded');
    chatWidget.classList.add('minimized');

    // visibility: hidden で非表示（レイアウトスペースは確保）
    chatWidget.style.visibility = 'hidden';

    // コンテンツと入力欄を非表示
    const chatContent = chatWidget.querySelector('.chat-content');
    const chatInput = chatWidget.querySelector('.chat-input');
    if (chatContent) chatContent.style.display = 'none';
    if (chatInput) chatInput.style.display = 'none';
  }
}
