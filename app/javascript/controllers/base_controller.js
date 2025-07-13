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

}
