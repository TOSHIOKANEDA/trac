/**
 * JapaneseHolidays
 * 日本の祝日データを管理
 * 
 * 運用チム向けに祝日を一元管理可能な構成
 * - 年ごとに祝日データを管理
 * - 将来的にDB化することも容易
 */
export class JapaneseHolidays {
  /**
   * 祝日データ
   * 形式: { month: 月, day: 日, name: '祝日名' }
   */
  static HOLIDAYS = {
    2025: [
      { month: 1, day: 1, name: '元日' },
      { month: 1, day: 13, name: '成人の日' },
      { month: 2, day: 11, name: '建国記念の日' },
      { month: 2, day: 23, name: '天皇誕生日' },
      { month: 3, day: 20, name: 'vernal equinox' },
      { month: 4, day: 29, name: '昭和の日' },
      { month: 5, day: 3, name: '憲法記念日' },
      { month: 5, day: 4, name: 'みどりの日' },
      { month: 5, day: 5, name: 'こどもの日' },
      { month: 7, day: 21, name: '敬老の日' },
      { month: 8, day: 11, name: '山の日' },
      { month: 9, day: 15, name: '敬老の日' },
      { month: 9, day: 23, name: 'autumnal equinox' },
      { month: 10, day: 13, name: 'スポーツの日' },
      { month: 11, day: 3, name: '文化の日' },
      { month: 11, day: 23, name: '勤労感謝の日' }
    ],
    2026: [
      { month: 1, day: 1, name: '元日' },
      { month: 1, day: 12, name: '成人の日' },
      { month: 2, day: 11, name: '建国記念の日' },
      { month: 2, day: 23, name: '天皇誕生日' },
      { month: 3, day: 20, name: 'vernal equinox' },
      { month: 4, day: 29, name: '昭和の日' },
      { month: 5, day: 3, name: '憲法記念日' },
      { month: 5, day: 4, name: 'みどりの日' },
      { month: 5, day: 5, name: 'こどもの日' },
      { month: 7, day: 20, name: 'サマーの日' },
      { month: 8, day: 11, name: '山の日' },
      { month: 9, day: 21, name: '敬老の日' },
      { month: 9, day: 22, name: 'autumnal equinox' },
      { month: 10, day: 12, name: 'スポーツの日' },
      { month: 11, day: 3, name: '文化の日' },
      { month: 11, day: 23, name: '勤労感謝の日' }
    ]
  };

  /**
   * 指定日付が祝日かどうかを判定
   * @param {Date} date
   * @returns {Object|null} 祝日の場合はオブジェクト、そうでなければnull
   */
  static isHoliday(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const yearHolidays = this.HOLIDAYS[year];
    if (!yearHolidays) {
      return null;
    }

    const holiday = yearHolidays.find(h => h.month === month && h.day === day);
    return holiday || null;
  }

  /**
   * 指定年の祝日一覧を取得
   * @param {number} year
   * @returns {Array}
   */
  static getHolidaysByYear(year) {
    return this.HOLIDAYS[year] || [];
  }

  /**
   * 祝日を追加
   * @param {number} year
   * @param {number} month
   * @param {number} day
   * @param {string} name
   */
  static addHoliday(year, month, day, name) {
    if (!this.HOLIDAYS[year]) {
      this.HOLIDAYS[year] = [];
    }

    // 重複チェック
    const exists = this.HOLIDAYS[year].some(h => h.month === month && h.day === day);
    if (!exists) {
      this.HOLIDAYS[year].push({ month, day, name });
      // 日付でソート
      this.HOLIDAYS[year].sort((a, b) => a.month * 100 + a.day - (b.month * 100 + b.day));
    }
  }
}

export default JapaneseHolidays;