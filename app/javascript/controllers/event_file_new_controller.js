// app/javascript/controllers/event_file_new_controller.js

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "section",
    "badge", 
    "uploadSection",
    "filesList",
    "totalUploadedCount",
    "totalCount"
  ]

  connect() {
    console.log("Event File New Controller connected")
    this.initializeSampleData()
    this.updateAllBadges()
    this.updateTotalCount()
    this.updateAllChecklists()
    this.updateAllTabCounts()
  }

  // サンプルデータの初期化
  initializeSampleData() {
    // 荷主セクションの初期化
    this.updateChecklistForSection('shipper')
    this.updateAvailableOptionsForSection('shipper')
    
    // フォワーダーセクションの初期化
    this.updateChecklistForSection('forwarder')
    this.updateAvailableOptionsForSection('forwarder')
    
    // 通関業者セクションの初期化
    this.updateChecklistForSection('customs')
    this.updateAvailableOptionsForSection('customs')
  }

  // セクションの開閉
  toggleSection(event) {
    event.preventDefault()
    const sectionId = event.currentTarget.dataset.sectionId
    const section = document.getElementById(sectionId)
    
    if (section) {
      section.classList.toggle('collapsed')
      
      // アイコンの回転アニメーション
      const icon = event.currentTarget.querySelector('.collapse-icon')
      if (icon) {
        icon.style.transform = section.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)'
      }
    }
  }

  // タブ切り替え機能
  switchTab(event) {
    event.preventDefault()
    const button = event.currentTarget
    const targetTabId = button.dataset.targetTab
    const tabContainer = button.parentElement
    const contentContainer = tabContainer.nextElementSibling.parentElement

    // タブボタンのアクティブ状態を更新
    tabContainer.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    button.classList.add('active')

    // タブコンテンツの表示を切り替え
    contentContainer.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active')
    })
    const targetTab = document.getElementById(targetTabId)
    if (targetTab) {
      targetTab.classList.add('active')
    }
  }

  // ファイルアップロード（複数ファイル対応）
  uploadFile(event) {
    event.preventDefault()
    const uploadSection = event.currentTarget
    const sectionType = this.getSectionTypeFromElement(uploadSection)
    
    // ファイル選択ダイアログを作成
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true // 複数ファイル選択を有効化
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls'
    
    input.onchange = (e) => {
      const files = e.target.files
      if (files.length > 0) {
        this.handleMultipleFileUpload(Array.from(files), sectionType, uploadSection)
      }
    }
    
    input.click()
  }

  // 複数ファイルアップロード処理
  handleMultipleFileUpload(files, sectionType, uploadSection) {
    const filesList = this.getNewFilesListForSection(sectionType)
    
    // 空の状態を非表示にする
    const emptyState = filesList.querySelector('.empty-state')
    if (emptyState) {
      emptyState.style.display = 'none'
    }
    
    // アップロードエリアの表示を更新
    uploadSection.classList.add('has-file')
    uploadSection.innerHTML = `
      <i class="fas fa-check-circle" style="color: #28a745; font-size: 36px;"></i>
      <div class="upload-text">${files.length}個のファイルをアップロード済み</div>
      <div class="upload-subtext">追加でアップロードする場合はクリック</div>
    `
    
    // 各ファイルに対してファイルアイテムを生成
    files.forEach(file => {
      const fileItem = this.createFileItem(file, sectionType)
      filesList.appendChild(fileItem)
    })
    
    // 新しいファイルが追加されたら、プルダウンオプションを更新
    this.updateAvailableOptionsForSection(sectionType)
    
    this.updateAllBadges()
    this.updateTotalCount()
    this.updateChecklistForSection(sectionType)
    this.updateTabCountsForSection(sectionType)
    
    // 新規ファイルタブに自動切り替え
    this.switchToNewFilesTab(sectionType)
  }

  // 新規ファイルタブに切り替え
  switchToNewFilesTab(sectionType) {
    const newFilesTab = document.querySelector(`[data-target-tab="${sectionType}NewFiles"]`)
    if (newFilesTab) {
      newFilesTab.click()
    }
  }

  // ファイルアイテムを動的に生成
  createFileItem(file, sectionType) {
    const fileItem = document.createElement('div')
    fileItem.className = 'file-item uploaded'
    
    const fileName = file.name
    const fileSize = this.formatFileSize(file.size)
    const fileIcon = this.getFileIcon(fileName)
    
    // ファイル種類のオプションをセクションに応じて設定
    const fileTypeOptions = this.getFileTypeOptions(sectionType)
    
    fileItem.innerHTML = `
      <div class="file-item-header">
        <select class="file-type-select" data-action="change->event-file-new#onFileTypeChange">
          <option value="">ファイル種類を選択</option>
          ${fileTypeOptions}
        </select>
        <span class="required-mark">*必須</span>
        <button class="delete-file-btn" data-action="click->event-file-new#deleteFileItem" title="ファイルを削除">
          <i class="fas fa-trash"></i>
        </button>
        <span class="status-indicator uploaded"></span>
      </div>
      <div class="file-info-section">
        <div class="uploaded-file-info">
          <div class="file-name-display">
            <i class="fas ${fileIcon}"></i>
            <span class="file-name">${fileName}</span>
          </div>
          <div class="file-size">${fileSize}</div>
        </div>
      </div>
      <div class="access-control">
        <div class="access-label">アクセス権限</div>
        <div class="access-chips">
          <label class="access-chip" data-action="click->event-file-new#toggleAccessChip">
            <input type="checkbox">
            <span>通関業者</span>
          </label>
          <label class="access-chip" data-action="click->event-file-new#toggleAccessChip">
            <input type="checkbox">
            <span>荷主</span>
          </label>
          <label class="access-chip" data-action="click->event-file-new#toggleAccessChip">
            <input type="checkbox">
            <span>Agent</span>
          </label>
        </div>
      </div>
    `
    
    return fileItem
  }

  // セクション別ファイル種類オプション
  getFileTypeOptions(sectionType) {
    const options = {
      'shipper': [
        { value: 'invoice', text: 'インボイス' },
        { value: 'packing_list', text: 'パッキングリスト' },
        { value: 'certificate', text: '証明書' },
        { value: 'contract', text: '契約書' },
        { value: 'van_photos', text: 'バン写真' },
        { value: 'other', text: 'その他' }
      ],
      'forwarder': [
        { value: 'bl', text: '船荷証券（B/L）' },
        { value: 'manifest', text: 'マニフェスト' },
        { value: 'booking', text: 'ブッキング確認書' },
        { value: 'freight_invoice', text: '運賃請求書' },
        { value: 'other', text: 'その他' }
      ],
      'customs': [
        { value: 'declaration', text: '輸入申告書' },
        { value: 'permit', text: '許可書' },
        { value: 'inspection', text: '検査結果書' },
        { value: 'duty_payment', text: '関税納付書' },
        { value: 'other', text: 'その他' }
      ]
    }
    
    return options[sectionType]?.map(option => 
      `<option value="${option.value}">${option.text}</option>`
    ).join('') || ''
  }

  // ファイル種類変更時の処理
  onFileTypeChange(event) {
    const select = event.currentTarget
    const fileType = select.value
    const sectionType = this.getSectionTypeFromElement(select)
    
    // チェックリストを更新
    this.updateChecklistForSection(sectionType)
    
    // セクション内の他のプルダウンで利用可能なオプションを更新
    this.updateAvailableOptionsForSection(sectionType)
    
    console.log(`ファイル種類が変更されました: ${fileType} (セクション: ${sectionType})`)
  }

  // ファイルアイテム削除
  deleteFileItem(event) {
    event.preventDefault()
    
    if (confirm('このファイルを削除してもよろしいですか？')) {
      const fileItem = event.currentTarget.closest('.file-item')
      const sectionType = this.getSectionTypeFromElement(fileItem)
      const fileContainer = fileItem.closest('.tab-content')
      
      fileItem.remove()
      this.updateAllBadges()
      this.updateTotalCount()
      this.updateChecklistForSection(sectionType)
      this.updateAvailableOptionsForSection(sectionType)
      this.updateTabCountsForSection(sectionType)
      
      // 新規アップロードエリアでファイルがなくなった場合、空の状態を表示
      if (fileContainer && fileContainer.id.includes('NewFiles')) {
        const remainingFiles = fileContainer.querySelectorAll('.file-item')
        if (remainingFiles.length === 0) {
          const emptyState = fileContainer.querySelector('.empty-state')
          if (emptyState) {
            emptyState.style.display = 'block'
          }
          this.resetUploadArea(sectionType)
        }
      }
    }
  }

  // アクセス権限チップのトグル
  toggleAccessChip(event) {
    const chip = event.currentTarget
    const checkbox = chip.querySelector('input[type="checkbox"]')
    
    // クリックされた要素がinputでない場合のみチェックボックスを切り替え
    if (event.target.tagName !== 'INPUT') {
      event.preventDefault()
      checkbox.checked = !checkbox.checked
    }
    
    // activeクラスの切り替え
    chip.classList.toggle('active', checkbox.checked)
  }

  // セクションのチェックリストを更新
  updateChecklistForSection(sectionType) {
    const checklistItems = document.querySelectorAll(`#${sectionType}Checklist .checklist-item`)
    const newFileTypes = this.getSelectedFileTypesForSection(sectionType, 'new')
    const existingFileTypes = this.getSelectedFileTypesForSection(sectionType, 'existing')
    const allSelectedTypes = [...newFileTypes, ...existingFileTypes]
    
    checklistItems.forEach(item => {
      const fileType = item.dataset.fileType
      const icon = item.querySelector('.checklist-icon')
      
      if (allSelectedTypes.includes(fileType)) {
        icon.className = 'fas fa-check-square checklist-icon checked'
        item.classList.add('completed')
      } else {
        icon.className = 'fas fa-square checklist-icon'
        item.classList.remove('completed')
      }
    })
  }

  // 全チェックリストを更新
  updateAllChecklists() {
    ['shipper', 'forwarder', 'customs'].forEach(sectionType => {
      this.updateChecklistForSection(sectionType)
    })
  }

  // セクション内で選択済みのファイル種類を取得（新規・既存を区別）
  getSelectedFileTypesForSection(sectionType, fileCategory = 'all') {
    const selectedTypes = []
    
    if (fileCategory === 'all' || fileCategory === 'new') {
      // 新しくアップロードしたファイル
      const newFilesList = document.getElementById(`${sectionType}NewFiles`)
      if (newFilesList) {
        newFilesList.querySelectorAll('.file-type-select').forEach(select => {
          if (select.value && select.value !== '') {
            selectedTypes.push(select.value)
          }
        })
      }
    }
    
    if (fileCategory === 'all' || fileCategory === 'existing') {
      // 以前からアップロードされたファイル
      const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
      if (existingFilesList) {
        existingFilesList.querySelectorAll('.file-type-select').forEach(select => {
          if (select.value && select.value !== '') {
            selectedTypes.push(select.value)
          }
        })
      }
    }
    
    return selectedTypes
  }

  // セクション内で利用可能なプルダウンオプションを更新
  updateAvailableOptionsForSection(sectionType) {
    const allSelectedTypes = this.getSelectedFileTypesForSection(sectionType, 'all')
    const allOptions = this.getFileTypeOptions(sectionType)
    
    // 新規アップロードファイルのプルダウンを更新
    const newFilesList = document.getElementById(`${sectionType}NewFiles`)
    if (newFilesList) {
      this.updateSelectOptions(newFilesList, allSelectedTypes, allOptions)
    }
    
    // 既存ファイルのプルダウンを更新
    const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
    if (existingFilesList) {
      this.updateSelectOptions(existingFilesList, allSelectedTypes, allOptions)
    }
  }

  // セレクトボックスのオプションを更新
  updateSelectOptions(container, selectedTypes, allOptions) {
    container.querySelectorAll('.file-type-select').forEach(select => {
      const currentValue = select.value
      const options = allOptions.split('</option>').filter(opt => opt.trim())
      
      // プルダウンを再構築
      select.innerHTML = '<option value="">ファイル種類を選択</option>'
      
      options.forEach(optionHtml => {
        if (!optionHtml.trim()) return
        
        const optionMatch = optionHtml.match(/value="([^"]*)"[^>]*>([^<]*)/)
        if (optionMatch) {
          const value = optionMatch[1]
          const text = optionMatch[2]
          
          // バン写真と「その他」は常に表示、それ以外は重複チェック
          const shouldShow = value === 'van_photos' || value === 'other' || 
                           !selectedTypes.includes(value) || value === currentValue
          
          if (shouldShow) {
            const option = document.createElement('option')
            option.value = value
            option.textContent = text
            if (value === currentValue) {
              option.selected = true
            }
            select.appendChild(option)
          }
        }
      })
    })
  }

  // 全セクションのバッジを更新
  updateAllBadges() {
    const sections = ['shipper', 'forwarder', 'customs']
    
    sections.forEach(sectionType => {
      // 新規アップロードファイル
      const newFilesList = document.getElementById(`${sectionType}NewFiles`)
      const newUploadedItems = newFilesList ? newFilesList.querySelectorAll('.file-item.uploaded').length : 0
      const newTotalItems = newFilesList ? newFilesList.querySelectorAll('.file-item').length : 0
      
      // 既存ファイル
      const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
      const existingUploadedItems = existingFilesList ? existingFilesList.querySelectorAll('.file-item.uploaded').length : 0
      const existingTotalItems = existingFilesList ? existingFilesList.querySelectorAll('.file-item').length : 0
      
      const totalUploaded = newUploadedItems + existingUploadedItems
      const totalItems = newTotalItems + existingTotalItems
      
      const badge = document.getElementById(`${sectionType}Badge`)
      if (badge) {
        badge.textContent = `${totalUploaded}/${totalItems}`
      }
    })
  }

  // 全体のアップロード数を更新
  updateTotalCount() {
    const sections = ['shipper', 'forwarder', 'customs']
    let totalUploaded = 0
    let totalFiles = 0
    
    sections.forEach(sectionType => {
      // 新規アップロードファイル
      const newFilesList = document.getElementById(`${sectionType}NewFiles`)
      const newUploadedItems = newFilesList ? newFilesList.querySelectorAll('.file-item.uploaded').length : 0
      const newTotalItems = newFilesList ? newFilesList.querySelectorAll('.file-item').length : 0
      
      // 既存ファイル
      const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
      const existingUploadedItems = existingFilesList ? existingFilesList.querySelectorAll('.file-item.uploaded').length : 0
      const existingTotalItems = existingFilesList ? existingFilesList.querySelectorAll('.file-item').length : 0
      
      totalUploaded += newUploadedItems + existingUploadedItems
      totalFiles += newTotalItems + existingTotalItems
    })
    
    if (this.hasTotalUploadedCountTarget && this.hasTotalCountTarget) {
      this.totalUploadedCountTarget.textContent = totalUploaded
      this.totalCountTarget.textContent = totalFiles
    }
  }

  // タブの件数を更新
  updateTabCountsForSection(sectionType) {
    // 新規ファイル数を更新
    const newFilesList = document.getElementById(`${sectionType}NewFiles`)
    const newFilesCount = newFilesList ? newFilesList.querySelectorAll('.file-item').length : 0
    const newFilesTab = document.querySelector(`[data-target-tab="${sectionType}NewFiles"]`)
    if (newFilesTab) {
      const countSpan = newFilesTab.querySelector('[data-count-target="newFiles"]')
      if (countSpan) {
        countSpan.textContent = newFilesCount
      }
    }
    
    // 既存ファイル数を更新
    const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
    const existingFilesCount = existingFilesList ? existingFilesList.querySelectorAll('.file-item').length : 0
    const existingFilesTab = document.querySelector(`[data-target-tab="${sectionType}ExistingFiles"]`)
    if (existingFilesTab) {
      const countSpan = existingFilesTab.querySelector('[data-count-target="existingFiles"]')
      if (countSpan) {
        countSpan.textContent = existingFilesCount
      }
    }
  }

  // 全セクションのタブ件数を更新
  updateAllTabCounts() {
    ['shipper', 'forwarder', 'customs'].forEach(sectionType => {
      this.updateTabCountsForSection(sectionType)
    })
  }

  // 全ファイルダウンロード
  downloadAll(event) {
    event.preventDefault()
    
    // 実際のダウンロード処理をここに実装
    // 例: APIを呼び出してZIPファイルを生成・ダウンロード
    
    alert('全ファイルのダウンロードを開始します')
  }

  // 変更を保存
  saveChanges(event) {
    event.preventDefault()
    
    // 保存処理をここに実装
    const formData = this.collectFormData()
    
    // APIへの送信処理（例）
    // fetch('/api/save-file-settings', {
    //   method: 'POST',
    //   body: JSON.stringify(formData),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
    //   }
    // }).then(response => {
    //   if (response.ok) {
    //     alert('変更を保存しました')
    //   }
    // })
    
    console.log('保存データ:', formData)
    alert('変更を保存しました')
  }

  // フォームデータを収集
  collectFormData() {
    const sections = ['shipper', 'forwarder', 'customs']
    const formData = {
      sections: {}
    }
    
    sections.forEach(sectionType => {
      formData.sections[sectionType] = {
        newFiles: [],
        existingFiles: []
      }
      
      // 新規アップロードファイル
      const newFilesList = document.getElementById(`${sectionType}NewFiles`)
      if (newFilesList) {
        const newFileItems = newFilesList.querySelectorAll('.file-item')
        newFileItems.forEach((item, index) => {
          const fileData = this.extractFileData(item, index)
          formData.sections[sectionType].newFiles.push(fileData)
        })
      }
      
      // 既存ファイル
      const existingFilesList = document.getElementById(`${sectionType}ExistingFiles`)
      if (existingFilesList) {
        const existingFileItems = existingFilesList.querySelectorAll('.file-item')
        existingFileItems.forEach((item, index) => {
          const fileData = this.extractFileData(item, index)
          formData.sections[sectionType].existingFiles.push(fileData)
        })
      }
    })
    
    return formData
  }

  // ファイルアイテムからデータを抽出
  extractFileData(item, index) {
    const select = item.querySelector('.file-type-select')
    const isUploaded = item.classList.contains('uploaded')
    const fileName = item.querySelector('.file-name')?.textContent || ''
    const fileSize = item.querySelector('.file-size')?.textContent || ''
    const permissions = []
    
    item.querySelectorAll('.access-chip input:checked').forEach(checkbox => {
      permissions.push(checkbox.nextElementSibling.textContent.trim())
    })
    
    return {
      index: index,
      fileName: fileName,
      fileSize: fileSize,
      fileType: select?.value || '',
      uploaded: isUploaded,
      permissions: permissions
    }
  }

  // ヘルパーメソッド：要素からセクションタイプを取得
  getSectionTypeFromElement(element) {
    const section = element.closest('.file-section')
    if (!section) return ''
    
    if (section.id.includes('shipper')) return 'shipper'
    if (section.id.includes('forwarder')) return 'forwarder'
    if (section.id.includes('customs')) return 'customs'
    return ''
  }

  // ヘルパーメソッド：セクションの新規ファイルリストを取得
  getNewFilesListForSection(sectionType) {
    return document.getElementById(`${sectionType}NewFiles`)
  }

  // アップロードエリアをリセット
  resetUploadArea(sectionType) {
    const uploadSection = document.querySelector(`#${sectionType}Docs .upload-section`)
    if (uploadSection) {
      uploadSection.classList.remove('has-file')
      uploadSection.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <div class="upload-text">ファイルをアップロード</div>
        <div class="upload-subtext">複数ファイル同時選択可能</div>
      `
    }
  }

  // ファイルサイズをフォーマット
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  }

  // ファイルタイプに応じたアイコンを取得
  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase()
    
    const iconMap = {
      'pdf': 'fa-file-pdf',
      'doc': 'fa-file-word',
      'docx': 'fa-file-word',
      'xls': 'fa-file-excel',
      'xlsx': 'fa-file-excel',
      'ppt': 'fa-file-powerpoint',
      'pptx': 'fa-file-powerpoint',
      'jpg': 'fa-file-image',
      'jpeg': 'fa-file-image',
      'png': 'fa-file-image',
      'gif': 'fa-file-image',
      'zip': 'fa-file-archive',
      'rar': 'fa-file-archive',
      'txt': 'fa-file-alt',
      'csv': 'fa-file-csv'
    }
    
    return iconMap[extension] || 'fa-file'
  }
}