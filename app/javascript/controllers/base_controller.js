// controllers/base_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "portSearchInputBox",
    "portSearchModal",
    "portSearchModalInput",
    "portSearchResults"
  ]

  deleteRow(event) {
    const targetName = event.target.closest("button").dataset.targetName
    const tableBody = this[`${targetName}Target`]
    const row = event.target.closest("tr")

    if (tableBody.rows.length <= 1) {
      alert("最低1つは必要です。")
      return
    }

    if (confirm("この行を削除しますか？")) {
      // 既存レコードかどうかを判定（_destroyフィールドがあるかチェック）
      const destroyInput = row.querySelector('.destroy-flag, input[name*="_destroy"]')
      
      if (destroyInput) {
        // 既存レコード：_destroyをtrueにして視覚的に隠す
        destroyInput.value = 'true'
        row.style.display = 'none'  // 完全に隠す
      } else {
        // 新規レコード：DOM操作で削除
        row.remove()
      }
    }
  }

  connect() {
    // 港検索用データ（サブクラスで上書き可）
    this.portDataList = this.portDataList || []

    // モーダル外クリックで閉じる
    if (this.hasPortSearchModalTarget) {
      this._modalClickListener = (e) => {
        if (e.target === this.portSearchModalTarget) {
          this.closePortSearchModal()
        }
      }
      window.addEventListener("click", this._modalClickListener)
    }
  }

  disconnect() {
    if (this._modalClickListener) {
      window.removeEventListener("click", this._modalClickListener)
    }
  }

  showPortSearchModal(event) {
    // クリックされた入力欄を保持
    this.activePortInput = event.target

    // モーダル表示
    this.portSearchModalTarget.classList.add("port-modal-active")
    this.portSearchModalInputTarget.value = ""
    this.portSearchResultsTarget.innerHTML = ""
    this.portSearchModalInputTarget.focus()
  }

  // モーダル内で港を選択
  selectPort(name) {
    if (this.activePortInput) {
      this.activePortInput.value = name
    }
    this.closePortSearchModal()
  }

  closePortSearchModal() {
    this.portSearchModalTarget.classList.remove("port-modal-active")
    this.activePortInput = null
  }

  // 検索入力イベント
  searchPort(event) {
    if (!this.hasPortSearchResultsTarget) return

    const query = event.target.value.toLowerCase()
    this.portSearchResultsTarget.innerHTML = ""

    // Railsから渡された港データを使用
    const portDataElement = document.getElementById("port-data")
    const ports = portDataElement ? JSON.parse(portDataElement.dataset.ports) : []

    const filtered = ports.filter(item =>
      item.toLowerCase().includes(query)
    )

    filtered.forEach(item => {
      const li = document.createElement("li")
      li.textContent = item
      li.classList.add("port-search-result-item")
      li.addEventListener("click", () => this.selectPort(item))
      this.portSearchResultsTarget.appendChild(li)
    })
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

  // 進捗表示（案件一覧スタイルに統一）
  showMilestone(event) {
    console.log("hoge")
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
}
