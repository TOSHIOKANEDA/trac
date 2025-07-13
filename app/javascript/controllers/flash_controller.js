import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="flash"
export default class extends Controller {
  connect() {
    setTimeout(() => {
      this.element.style.animation = "slideOut 0.3s ease forwards"
      setTimeout(() => {
        this.element.remove()
      }, 300)
    }, 5000)
  }
}
