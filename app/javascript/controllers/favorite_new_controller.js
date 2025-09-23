import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = ["cargoTableBody","operationsDropdown", "operationsDropdownContent"]

  connect() {
    this.setupDropdownClickOutside();
    const portDataEl = document.getElementById("port-data"); // 港検索を表示
    this.portDataList = portDataEl ? JSON.parse(portDataEl.dataset.ports) : []
  }


  // ドロップダウン外部クリックの設定
  setupDropdownClickOutside() {
    this.clickOutsideHandler = (favorite) => {
      if (this.hasOperationsDropdownTarget && !this.operationsDropdownTarget.contains(favorite.target)) {
        this.closeOperationsDropdown();
      }
    };
    document.addEventListener('click', this.clickOutsideHandler);
  }

  // 操作ドロップダウンの開閉
  toggleOperations(event) {  // favorite → event に修正
    event.preventDefault();
    if (!this.hasOperationsDropdownTarget || !this.hasOperationsDropdownContentTarget) return;
    
    const dropdown = this.operationsDropdownTarget;
    const content = this.operationsDropdownContentTarget;
    
    dropdown.classList.toggle('show');
    content.classList.toggle('show');
  }

  // 操作ドロップダウンを閉じる
  closeOperationsDropdown(event) {
    if (event) {
      event.preventDefault();
    }
    if (!this.hasOperationsDropdownTarget || !this.hasOperationsDropdownContentTarget) return;
    
    const dropdown = this.operationsDropdownTarget;
    const content = this.operationsDropdownContentTarget;
    
    dropdown.classList.remove('show');
    content.classList.remove('show');
  }

  // アコーディオン機能
  toggleSection(favorite) {
    const sectionId = favorite.currentTarget.dataset.section;
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.toggle('collapsed');
    }
  }

  // イベント伝播を停止（パネル内クリック時）
  stopPropagation(favorite) {
    favorite.stopPropagation();
  }

  // 貨物行を追加
  addCargoRow() {
    if (!this.hasCargoTableBodyTarget) return;
    const newIndex = new Date().getTime();
    
    const newRow = this.cargoTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td><input class="table-input" type="text" name="favorite[favorite_goods_attributes][${newIndex}][pkg]" id="favorite_favorite_goods_attributes_${newIndex}_pkg"></td>
      <td><input class="table-input" type="text" name="favorite[favorite_goods_attributes][${newIndex}][type_of_pkg]" id="favorite_favorite_goods_attributes_${newIndex}_type_of_pkg"></td>
      <td><input class="table-input" type="text" name="favorite[favorite_goods_attributes][${newIndex}][n_w]" id="favorite_favorite_goods_attributes_${newIndex}_n_w"></td>
      <td><input class="table-input" type="text" name="favorite[favorite_goods_attributes][${newIndex}][g_w]" id="favorite_favorite_goods_attributes_${newIndex}_g_w"></td>
      <td><input class="table-input" type="text" name="favorite[favorite_goods_attributes][${newIndex}][three_m]" id="favorite_favorite_goods_attributes_${newIndex}_three_m"></td>
      <td>
        <button type="button" class="delete-good-btn" title="貨物を削除" data-action="click->favorite-new#deleteRow" data-target-name="cargoTableBody">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
  }

  // フォーカス時の処理
  handleFocus(favorite) {
    favorite.target.style.transform = 'translateY(-2px)';
    favorite.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
  }

  // ブラー時の処理
  handleBlur(favorite) {
    favorite.target.style.transform = 'translateY(0)';
    favorite.target.style.boxShadow = 'none';
  }
}
