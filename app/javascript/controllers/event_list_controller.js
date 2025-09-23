// controllers/event_list_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["milestoneModalOverlay"]

  // 該当のモーダルを表示
  showMilestone(event) {
    event.preventDefault()
    const eventId = event.currentTarget.dataset.eventId
    const modal = this.milestoneModalOverlayTargets.find(
      (el) => el.dataset.eventId === eventId
    )
    modal.classList.add("active")
  }

  // オーバーレイクリックで閉じる
  modalOverlayClick(event) {
    if (event.target.classList.contains("modal-overlay")) {
      event.target.classList.remove("active")
    }
  }

  // ×ボタンで閉じる
  closeMilestoneModal(event) {
    const eventId = event.currentTarget.dataset.eventId
    const modal = this.milestoneModalOverlayTargets.find(
      (el) => el.dataset.eventId === eventId
    )
    modal.classList.remove("active")
  }
}
