import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="tabs"
export default class extends Controller {
  static targets = ["tabButton", "tabContent"]

  connect() {
    // 初回ロード時にアクティブなタブを決定するロジックが必要な場合はここに追加します
  }

  // data-action="tabs#switchTab" から呼び出される
  switchTab(event) {
    const clickedButton = event.currentTarget
    // ボタンの data-target 属性から表示対象のコンテンツIDを取得
    const targetId = clickedButton.dataset.target 

    // 1. 全てのボタンからactiveクラスを削除
    this.tabButtonTargets.forEach(button => {
      button.classList.remove("active")
    })

    // 2. 全てのコンテンツからactiveクラスを削除し、hiddenクラスを追加して非表示にする
    this.tabContentTargets.forEach(content => {
      content.classList.remove("active")
      content.classList.add("hidden")
    })

    // 3. クリックされたボタンにactiveクラスを追加
    clickedButton.classList.add("active")
    
    // 4. 対応するコンテンツからhiddenクラスを削除し、activeクラスを追加して表示する
    const targetContent = this.tabContentTargets.find(content => content.id === targetId)
    if (targetContent) {
      targetContent.classList.remove("hidden")
      targetContent.classList.add("active")
    }
  }
}
