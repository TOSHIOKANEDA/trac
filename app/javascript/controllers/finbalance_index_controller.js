import BaseController from "./base_controller"

export default class extends BaseController {
  connect() {
    const portDataEl = document.getElementById("port-data"); // 港検索を表示
    this.portDataList = portDataEl ? JSON.parse(portDataEl.dataset.ports) : []
  }
}
