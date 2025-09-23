import BaseController from "./base_controller"

export default class extends BaseController {
  connect() {
    // 初期表示時に合計を計算
    this.formatNumberWithComma()
  }
}
