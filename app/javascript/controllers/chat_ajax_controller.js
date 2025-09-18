// app/assets/javascripts/controllers/chat_ajax_controller.js
export default class ChatAjaxController {
  constructor(mainController) {
    this.mainController = mainController;
  }

  cleanupInvalidDOMElements() {
    const form = document.querySelector('[data-event-new-target="chatForm"]');
    const participantItems = form.querySelectorAll('.participant-item');
    
    participantItems.forEach(item => {
      const idInput = item.querySelector('input[name*="[id]"]');
      const userIdInput = item.querySelector('input[name*="[user_id]"]');
      
      // IDはあるがuser_idがない、または表示されていない要素を削除
      if ((idInput?.value && !userIdInput?.value) || item.style.display === 'none') {
        console.log('Removing invalid element:', { id: idInput?.value, userId: userIdInput?.value });
        item.remove();
      }
    });
  }

  // バリデーション
  validateChatForm() {
    const chatName = this.mainController.chatNameInputTarget.value.trim();
    if (!chatName) {
      this.mainController.showNotification('チャット名を入力してください', 'warning');
      return false;
    }

    const allParticipants = document.querySelectorAll('input[name*="[chat_users_attributes]"][name*="[user_id]"]');
    const destroyedParticipants = document.querySelectorAll('input[name*="[_destroy]"][value="true"]');
    const activeParticipantsCount = allParticipants.length - destroyedParticipants.length;
    
    if (activeParticipantsCount === 0) {
      this.mainController.showNotification('少なくとも1人の参加者を追加してください', 'warning');
      return false;
    }

    return true;
  }

  // チャットデータの準備
  prepareChatData(event) {
    const form = event.target;
    const chatName = this.mainController.chatNameInputTarget.value.trim();
    
    // 新規作成用のtemporary-chatを探す
    let otherChat = document.getElementById('temporary-chat');
    let isNewChat = true;
    let eventId, chatId;

    if (otherChat) {
      // 新規作成の場合
      eventId = otherChat.dataset.eventNewEventIdValue;
      chatId = otherChat.dataset.eventNewChatIdValue;
    } else {
      // 既存チャット更新の場合
      isNewChat = false;
      const actionUrl = form.action;
      const urlParts = actionUrl.match(/\/events\/(\d+)\/chats\/(\d+)/);
      
      if (urlParts) {
        eventId = urlParts[1];
        chatId = urlParts[2];
        otherChat = document.querySelector(`[data-event-new-chat-id-value="${chatId}"]`);
      }
      
      if (!otherChat) {
        this.mainController.showNotification('チャット要素が見つかりません', 'error');
        return null;
      }
    }

    const formData = new FormData(form);
    formData.set('chat[visible]', 'true');

    return {
      form,
      formData,
      chatName,
      isNewChat,
      eventId,
      chatId,
      otherChat
    };
  }

  // フォーム送信
  async submitChatForm(chatData) {
    const { form, formData } = chatData;
    
    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();
      this.mainController.isSubmitting = false;

      if (data.status === 'success') {
        this.handleChatSuccess(chatData, data);
      } else {
        // 具体的なエラー内容を表示
        const errorMessage = this.parseErrorMessages(data.errors);
        this.mainController.showNotification(errorMessage, 'warning');
        
        // 重複エラーの場合は、画面をリフレッシュして同期を取る
        if (this.isDuplicateError(data.errors)) {
          this.handleDuplicateError();
        }
      }
    } catch (error) {
      this.mainController.isSubmitting = false;
      this.handleChatError(error);
    }
  }

  // 削除時にDOM要素を完全に削除
  removeExistingParticipant(event) {
    const button = event.currentTarget;
    const participantItem = button.closest('.participant-item');
    
    // DOM要素を完全に削除（_destroyは使わない）
    participantItem.remove();
    
    this.updateChatParticipantSelectOptions();
    this.showNotification('参加者を削除しました', 'success');
  }

  // エラー処理
  handleChatError(error) {
    console.error('Error:', error);
    this.mainController.showNotification('チャットの処理に失敗しました', 'error');
  }

  parseErrorMessages(errors) {
    if (Array.isArray(errors)) {
      if (errors.some(err => err.includes('すでに存在します'))) {
        return '参加者設定に失敗しました。自動で画面を更新し、最新の状態に同期します。';
      }
      return errors.join(', ');
    }
    return 'エラーが発生しました';
  }

  isDuplicateError(errors) {
    return Array.isArray(errors) && errors.some(err => err.includes('すでに存在します'));
  }

  handleDuplicateError() {
    // 3秒後に画面をリロードして同期を取る
    setTimeout(() => {
      this.mainController.showNotification('画面を更新しています...', 'info');
      window.location.reload();
    }, 3000);
  }

  // 成功時の処理
  handleChatSuccess(chatData, responseData) {
    const { chatName, isNewChat, eventId, chatId, otherChat } = chatData;
    
    // UIの更新
    this.updateChatUI(otherChat, chatName);
    
    // Action Cable送信
    this.sendChatMessage(otherChat, chatName, isNewChat, eventId, chatId);
    
    // 新規作成時の処理
    if (isNewChat) {
      otherChat.style.display = 'block';
      otherChat.removeAttribute('id');
    }
    
    const actionMessage = isNewChat ? '作成しました' : '更新しました';
    this.mainController.showNotification(`「${chatName}」チャットを${actionMessage}`, 'success');
    this.mainController.closeChatCreation();
  }

  // UIの更新
  updateChatUI(otherChat, chatName) {
    const chatHeader = otherChat.querySelector('.chat-header span');
    if (chatHeader) {
      chatHeader.innerHTML = `<i class="fas fa-comments"></i> ${chatName}`;
    }
  }

  // Action Cableでメッセージ送信
  sendChatMessage(otherChat, chatName, isNewChat, eventId, chatId) {
    const allParticipants = document.querySelectorAll('input[name*="[chat_users_attributes]"][name*="[user_id]"]');
    const participantNames = this.getParticipantNames(allParticipants);
    
    const chatController = this.mainController.application.getControllerForElementAndIdentifier(otherChat, 'event-new');
    
    if (chatController && chatController.chatChannel) {
      const message = isNewChat 
        ? `${chatName}が作成されました。\n参加者: ${participantNames}`
        : `${chatName}が更新されました。\n参加者: ${participantNames}`;
        
      chatController.chatChannel.send({
        message: message,
        chat_name: chatName,
        event_id: eventId,
        chat_id: chatId
      });
    }
  }

  // 参加者名の取得
  getParticipantNames(allParticipants) {
    const activeParticipants = Array.from(allParticipants).filter(input => {
      const participantItem = input.closest('.participant-item');
      const destroyField = participantItem.querySelector('input[name*="[_destroy]"]');
      return !destroyField || destroyField.value !== 'true';
    });
    
    return activeParticipants.map(input => {
      const participantItem = input.closest('.participant-item');
      const nameElement = participantItem.querySelector('.participant-name');
      const companyElement = participantItem.querySelector('.participant-company');
      return `${nameElement.textContent}（${companyElement.textContent}）`;
    }).join(', ');
  }
}
