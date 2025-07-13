import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = [
    "contactTableBody", "companyName", "partnerTypes", "partnerTypeCheckbox", "address",
    "companyDescription", "tradingTerms"
  ]

  connect() {
    this.setupFormInteractions();
    this.addContactInputEventListeners(this.contactTableBodyTarget.querySelector('tr'));
  }

  // 連絡先行を追加
  addContactRow() {
    // 現在の時刻をユニークなインデックスとして使用（Railsの推奨方法）
    const newIndex = new Date().getTime();
    
    const newRow = this.contactTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td>
        <input class="table-input contact-name-input" 
              placeholder="例: 山田 一郎" 
              required="required" 
              type="text" 
              name="company[users_attributes][${newIndex}][name]" 
              id="company_users_attributes_${newIndex}_name">
      </td>
      <td>
        <select class="table-input contact-role-select" 
                required 
                name="company[users_attributes][${newIndex}][role]" 
                id="company_users_attributes_${newIndex}_role">
          <option value="">選択してください</option>
          <option value="admin">管理者</option>
          <option value="editor">編集者</option>
          <option value="viewer">閲覧者</option>
        </select>
      </td>
      <td>
        <input type="text" 
              class="table-input contact-dept-input" 
              placeholder="例: 貿易部"
              name="company[users_attributes][${newIndex}][department]" 
              id="company_users_attributes_${newIndex}_department">
      </td>
      <td>
        <input type="email" 
              class="table-input contact-email-input" 
              placeholder="例: yamada@company.com" 
              required
              name="company[users_attributes][${newIndex}][email]" 
              id="company_users_attributes_${newIndex}_email">
      </td>
      <td>
        <input type="tel" 
              class="table-input contact-phone-input" 
              placeholder="例: 0312345678"
              name="company[users_attributes][${newIndex}][phone]" 
              id="company_users_attributes_${newIndex}_phone">
      </td>
      <td>
        <input type="hidden" 
              name="company[users_attributes][${newIndex}][_destroy]" 
              value="0" 
              id="company_users_attributes_${newIndex}__destroy">
        <button type="button" 
                class="delete-contact-btn" 
                title="連絡先を削除" 
                data-action="click->contractor-new#deleteRow" data-target-name="contactTableBody">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    this.addContactInputEventListeners(newRow);
  }

  // 連絡先入力フィールドにイベントリスナーを追加
  addContactInputEventListeners(row) {
    row.querySelectorAll('.table-input').forEach(input => {
      input.addEventListener('focus', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
      });
      
      input.addEventListener('blur', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });

      input.addEventListener('input', function() {
        this.classList.remove('form-error');
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      });
    });
  }

  // 選択された取引先タイプを取得
  getSelectedPartnerTypes() {
    const selectedTypes = [];
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      if (checkbox.checked) {
        selectedTypes.push(checkbox.value);
      }
    });
    return selectedTypes;
  }

  // フォームバリデーション
  validateForm() {
    const requiredFields = [
      { element: this.companyNameTarget, name: '会社名' },
      { element: this.addressTarget, name: '住所' }
    ];

    let isValid = true;

    // 既存のエラー表示をクリア
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // 基本項目のバリデーション
    requiredFields.forEach(field => {
      const value = field.element.value.trim();

      if (!value) {
        isValid = false;
        field.element.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `${field.name}は必須項目です`;
        field.element.parentNode.appendChild(errorDiv);
      }
    });

    // 取引先タイプのバリデーション
    const selectedTypes = this.getSelectedPartnerTypes();
    if (selectedTypes.length === 0) {
      isValid = false;
      this.partnerTypesTarget.classList.add('form-error');
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = '取引先タイプを最低1つ選択してください';
      this.partnerTypesTarget.parentNode.appendChild(errorDiv);
    }

    // 連絡先テーブルのバリデーション
    const contactRows = this.contactTableBodyTarget.querySelectorAll('tr');
    let hasValidContact = false;

    contactRows.forEach((row) => {
      const nameInput = row.querySelector('.contact-name-input');
      const emailInput = row.querySelector('.contact-email-input');
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      // 担当者名のチェック
      if (!name) {
        isValid = false;
        nameInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = '担当者名は必須です';
        nameInput.parentNode.appendChild(errorDiv);
      } else {
        hasValidContact = true;
      }

      // メールアドレスのチェック
      if (!email) {
        isValid = false;
        emailInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'メールアドレスは必須です';
        emailInput.parentNode.appendChild(errorDiv);
      } else if (!this.isValidEmail(email)) {
        isValid = false;
        emailInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = '正しいメールアドレスの形式で入力してください';
        emailInput.parentNode.appendChild(errorDiv);
      } else {
        hasValidContact = true;
      }
    });

    if (!hasValidContact) {
      isValid = false;
      alert('最低1人の有効な連絡先（担当者名とメールアドレス）が必要です。');
    }

    return isValid;
  }

  // メールアドレス検証
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 保存処理
  savePartner(event) {
    if (!this.validateForm()) {
      alert('入力内容に不備があります。赤字の項目を確認してください。');
      return;
    }

    // 連絡先データを収集
    const contacts = [];
    const contactRows = this.contactTableBodyTarget.querySelectorAll('tr');
    
    contactRows.forEach(row => {
      const name = row.querySelector('.contact-name-input').value.trim();
      const title = row.querySelector('.contact-dept-input').value.trim();
      const email = row.querySelector('.contact-email-input').value.trim();
      const phone = row.querySelector('.contact-phone-input').value.trim();
      
      if (name && email) {
        contacts.push({
          name: name,
          title: title,
          email: email,
          phone: phone
        });
      }
    });

    // 選択された取引先タイプを取得
    const selectedPartnerTypes = this.getSelectedPartnerTypes();

    // フォームデータ収集
    const formData = {
      companyName: this.companyNameTarget.value.trim(),
      partnerTypes: selectedPartnerTypes, // 配列として保存
      address: this.addressTarget.value.trim(),
      companyDescription: this.companyDescriptionTarget.value.trim(),
      contacts: contacts,
      status: document.querySelector('input[name="status"]:checked').value,
      tradingTerms: this.tradingTermsTarget.value.trim()
    };

    // 保存ボタンのアニメーション
    const saveButton = event.currentTarget;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登録中...';
    saveButton.disabled = true;

    // 実際の処理では、ここでサーバーにデータを送信
    setTimeout(() => {
      saveButton.innerHTML = '<i class="fas fa-check"></i> 登録完了';
      
      setTimeout(() => {
        alert(`取引先が正常に登録されました。\n選択されたタイプ: ${selectedPartnerTypes.join(', ')}`);
        console.log('登録データ:', formData);
        
        // フォームをリセット
        this.resetForm();
        saveButton.innerHTML = '<i class="fas fa-save"></i> 登録';
        saveButton.disabled = false;
      }, 1000);
    }, 2000);
  }

  // フォームリセット
  resetForm() {
    // テキスト入力フィールドをリセット
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.value = '';
      el.classList.remove('form-error');
    });
    
    // チェックボックスをリセット
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // エラーメッセージを削除
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelector('input[name="status"][value="active"]').checked = true;
    
    // チェックボックスグループのエラー状態をクリア
    this.partnerTypesTarget.classList.remove('form-error');
    
    // 連絡先テーブルをリセット（1行のみ残す）
    this.contactTableBodyTarget.innerHTML = `
      <tr>
        <td><input type="text" class="table-input contact-name-input" placeholder="例: 山田 一郎" required></td>
        <td><input type="text" class="table-input contact-dept-input" placeholder="例: 営業部長"></td>
        <td><input type="email" class="table-input contact-email-input" placeholder="例: yamada@company.com" required></td>
        <td><input type="tel" class="table-input contact-phone-input" placeholder="例: +81-3-1234-5678"></td>
        <td>
          <button type="button" class="delete-contact-btn" title="連絡先を削除" data-action="click->contractor-new#deleteContactRow">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
    
    // 新しい行にイベントリスナーを追加
    this.addContactInputEventListeners(this.contactTableBodyTarget.querySelector('tr'));
  }

  // フォーム要素のインタラクション設定
  setupFormInteractions() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('focus', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
      });
      
      input.addEventListener('blur', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });

      // エラー状態をクリア
      input.addEventListener('input', function() {
        this.classList.remove('form-error');
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      });
    });

    // チェックボックスのイベントリスナー設定
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // チェックボックスが選択された時にエラー状態をクリア
        this.partnerTypesTarget.classList.remove('form-error');
        const errorMsg = this.partnerTypesTarget.parentNode.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.remove();
        }
      });
    });
  }
}
