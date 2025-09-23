/**
 * DataGenerator
 * テストデータの生成を責務とするクラス（修正版）
 * - API からイベントデータを取得
 * - 定数管理
 */
export class DataGenerator {
  /**
   * API からプロジェクトデータを取得
   * @returns {Promise<Array>}
   */
  static async generateProjects() {
    try {
      const response = await fetch('/events.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken()
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      const jsonData = await response.json();
      console.log('📡 Events fetched from API:', jsonData);

      // API レスポンスを data_generator の形式に変換
      if (jsonData.success && Array.isArray(jsonData.data)) {
        return jsonData.data
          .map(event => this.normalizeEventData(event))
          .filter(event => event !== null);  // ✅ etd か eta がない場合は除外
      } else {
        console.warn('⚠️ Unexpected API response format:', jsonData);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching events from API:', error);
      // フォールバック：ダミーデータを返す（開発時の確認用）
      console.warn('⚠️ Falling back to empty data. Check API endpoint.');
      return [];
    }
  }

  /**
   * API データを内部形式に正規化
   * etd か eta がない場合は null を返す（フィルタリング対象）
   * @param {Object} event - API から取得したイベントデータ
   * @returns {Object|null} - 正規化されたプロジェクトデータ、またはフィルタリング対象の場合は null
   */
  static normalizeEventData(event) {
    // ✅ etd と eta の両方が必須
    if (!event.etd || !event.eta) {
      console.warn(`⚠️ Event skipped (missing etd or eta):`, event);
      return null;  // このイベントを除外
    }

    const containerSummary = this.formatContainerSummary(event.container_summary || {});
    return {
      id: event.id || 'N/A',
      event_id: event.event_id,  // ✅ edit リンク用に追加
      bl_no: `${event.id || 'N/A'}`,
      mbl_no: event.mbl || 'N/A',
      hbl_no: event.hbl || 'N/A',
      assignee: event.assignee || 'N/A',
      origin: event.origin || 'N/A',
      destination: event.destination || 'N/A',
      originPortCode: event.origin_code || 'N/A',
      destinationPortCode: event.destination_code || 'N/A',
      shipper: event.shipper || 'N/A',
      cnee: event.cnee || 'N/A',
      etd: new Date(event.etd),  // ✅ 既に etd は存在することが保証
      eta: new Date(event.eta),  // ✅ 既に eta は存在することが保証
      mode: event.mode || 'N/A',
      term: event.term || 'N/A',
      container: containerSummary.countLabel,   // 「複数」 or 「20GP x 1, 20RF x 1」
      modal_container: containerSummary.detail, // 「20GP x 1, 20RF x 1, 40HC x 2」など
      vessel1: event.vessel1 || 'N/A',
      voyage1: event.voyage1 || 'N/A',
      vessel1_etd: new Date(),
      vessel1_eta: new Date(),
      ts_location: 'Singapore',
      vessel2: 'TBD',
      voyage2: 'TBD',
      vessel2_etd: new Date(),
      vessel2_eta: new Date()
    };
  }

  /**
   * CSRF トークンを取得（Railsフォーム保護対応）
   * @returns {string}
   */
  static getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
  }

  static formatContainerSummary(summary) {
    const entries = Object.entries(summary);
    if (entries.length === 0) return { countLabel: 'なし', detail: 'なし' };

    // "20GP x 2, 40HCRF x 1" のような表現を生成
    const detail = entries.map(([k, v]) => `${k} x ${v}`).join(', ');
    const entryCount = entries.map(([type, count]) => `${type} x ${count}`).join(', ');
    const countLabel = entryCount > 2 ? '複数' : detail;

    return { countLabel, detail };
  }
}

export default DataGenerator;
