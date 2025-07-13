// app/javascript/controllers/hello_controller.js

import { Controller } from "@hotwired/stimulus"
import { Calendar } from '@fullcalendar/core'

// 必要なプラグインをインポート
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid' // ← 週表示プラグインをインポート
import listPlugin from '@fullcalendar/list'       // ← リスト表示プラグインをインポート

export default class extends Controller {
  connect() {
    const calendar = new Calendar(this.element, {
      // ↓ ここからオプションを更新
      plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ], // 配列にプラグインを追加

      // ヘッダーにボタンなどを配置
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek' // 月・週・リスト表示の切り替えボタン
      },

      initialView: 'dayGridMonth', // 初期表示を月表示に設定
      // ↑ ここまで更新

      // 日本語化したい場合は以下のオプションも追加
      locale: 'ja',
      buttonText: {
       today: '今日',
       month: '月',
       week: '週',
       list: 'リスト'
      },
    });
    calendar.render();
  }
}