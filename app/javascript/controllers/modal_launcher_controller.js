// modal_launcher_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  open() {
    $('#modal-overlay').show();
  }
}
