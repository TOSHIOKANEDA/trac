// app/javascript/controllers/event_file_index_controller.js

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "section",
    "badge", 
    "uploadSection",
    "filesList",
    "fileForm",
    "updateBtn"
  ]

  connect() {
    console.log("Event File Index Controller connected")
    this.initializeDragAndDrop()
    this.updateAllChecklists() // 初期表示時にチェックリストを更新
  }

  // チェックリストを更新する関数
  updateAllChecklists() {
    // 各セクションのチェックリストを更新
    this.sectionTargets.forEach(section => {
      this.updateChecklistForSection(section)
    })
  }

  // セクション内のチェックリストを更新
  updateChecklistForSection(sectionElement) {
    const sectionId = sectionElement.id
    
    // セクション内の全てのfile-type-selectを取得
    const fileTypeSelects = sectionElement.querySelectorAll('.file-type-select')
    const selectedFileTypes = new Set()
    
    // 選択されているファイルタイプを収集
    fileTypeSelects.forEach(select => {
      if (select.value && select.value !== '') {
        selectedFileTypes.add(select.value)
      }
    })
    
    // チェックリストのアイテムを更新
    const checklistId = sectionId.replace('Docs', 'Checklist')
    const checklist = document.getElementById(checklistId)
    
    if (checklist) {
      const checklistItems = checklist.querySelectorAll('.checklist-item')
      
      checklistItems.forEach(item => {
        const fileType = item.dataset.fileType
        const icon = item.querySelector('.checklist-icon')
        
        if (selectedFileTypes.has(fileType)) {
          // チェックを入れる
          icon.classList.remove('fa-square')
          icon.classList.add('fa-check-square', 'checked')
          item.classList.add('completed')
        } else {
          // チェックを外す
          icon.classList.remove('fa-check-square', 'checked')
          icon.classList.add('fa-square')
          item.classList.remove('completed')
        }
      })
    }
    
    // バッジの更新
    this.updateBadgeForSection(sectionElement, selectedFileTypes.size)
  }

  // バッジを更新
  updateBadgeForSection(sectionElement, completedCount) {
    const sectionId = sectionElement.id
    const badgeId = sectionId.replace('Docs', 'Badge')
    const badge = document.getElementById(badgeId)
    
    if (badge) {
      // チェックリストの総アイテム数を取得
      const checklistId = sectionId.replace('Docs', 'Checklist')
      const checklist = document.getElementById(checklistId)
      const totalCount = checklist ? checklist.querySelectorAll('.checklist-item').length : 0
      
      badge.textContent = `${completedCount}/${totalCount}`
      
      // 完了度に応じてバッジのスタイルを変更
      badge.classList.remove('badge-success', 'badge-warning', 'badge-secondary')
      if (completedCount === totalCount && totalCount > 0) {
        badge.classList.add('badge-success')
      } else if (completedCount > 0) {
        badge.classList.add('badge-warning')
      } else {
        badge.classList.add('badge-secondary')
      }
    }
  }

  // ファイル種類変更時の処理
  onVerifiedDocChange(event) {
    const select = event.currentTarget
    const section = select.closest('.file-section')
    
    // 該当セクションのチェックリストを更新
    if (section) {
      this.updateChecklistForSection(section)
    }
    
    console.log(`Verified Doc changed to: ${select.value}`)
  }

  initializeDragAndDrop() {
    if (this.hasUploadSectionTarget) {
      this.uploadSectionTargets.forEach(section => {
        section.addEventListener('dragover', this.handleDragOver.bind(this))
        section.addEventListener('dragleave', this.handleDragLeave.bind(this))
        section.addEventListener('drop', this.handleDrop.bind(this))
        section.addEventListener('dragenter', this.handleDragEnter.bind(this))
      })
    }
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    
    document.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }

  handleDragEnter(event) {
    event.preventDefault()
    event.stopPropagation()
    const uploadSection = event.currentTarget
    uploadSection.classList.add('drag-over')
  }

  handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  handleDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    const uploadSection = event.currentTarget
    const relatedTarget = event.relatedTarget
    if (!uploadSection.contains(relatedTarget)) {
      uploadSection.classList.remove('drag-over')
    }
  }

  async handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    
    const uploadSection = event.currentTarget
    uploadSection.classList.remove('drag-over')
    
    const files = Array.from(event.dataTransfer.files)
    
    if (files.length > 0) {
      const form = uploadSection.closest('form')
      const businessCategoryId = form.querySelector('input[name*="business_category_id"]').value
      
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.msg', '.eml']
      const validFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop().toLowerCase()
        return allowedExtensions.includes(extension)
      })
      
      if (validFiles.length === 0) {
        alert('対応していないファイル形式です。')
        return
      }
      
      await this.uploadFiles(validFiles, businessCategoryId, uploadSection)
    }
  }

  // ファイルアップロード処理
  async uploadFiles(files, businessCategoryId, form) {
    // URLからIDとタイプを判定
    const eventMatch = window.location.pathname.match(/events\/(\d+)/)
    const favoriteMatch = window.location.pathname.match(/favorites\/(\d+)/)
    
    let type, id, urlParamName

    if (eventMatch) {
      type = 'event'
      id = eventMatch[1]
      urlParamName = 'event_file[file]'
    } else if (favoriteMatch) {
      type = 'favorite'
      id = favoriteMatch[1]
      urlParamName = 'favorite_file[file]'
    } else {
      alert('アップロード対象が不明です。')
      return
    }

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append(urlParamName, file)
        formData.append(`${type}_file[business_category_id]`, businessCategoryId)
        
        const response = await fetch(`/${type}s/${id}/${type}_files`, {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`${type} file uploaded successfully:`, result)
        } else {
          console.error(`Upload failed for ${type} file:`, file.name)
        }
      }

      // 新しいファイルを反映
      window.location.reload()

    } catch (error) {
      console.error('Upload error:', error)
      alert('ファイルのアップロードに失敗しました。')
      this.hideUploadProgress(form)
    }
  }

  uploadFile(event) {
    if (event.target.closest('.upload-section')) {
      event.preventDefault()
      const uploadSection = event.currentTarget
      const fileInput = uploadSection.querySelector('input[type="file"]')
      if (fileInput) {
        fileInput.click()
      }
    }
  }

  async handleFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
      const uploadSection = event.target.closest('.upload-section')
      const form = event.target.closest('form')
      const businessCategoryId = form.querySelector('input[name*="business_category_id"]').value
      await this.uploadFiles(files, businessCategoryId, uploadSection)
    }
  }

  toggleSection(event) {
    event.preventDefault()
    const sectionId = event.currentTarget.dataset.sectionId
    const section = document.getElementById(sectionId)
    
    if (section) {
      section.classList.toggle('collapsed')
      const icon = event.currentTarget.querySelector('.collapse-icon')
      if (icon) {
        icon.style.transform = section.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)'
      }
    }
  }

  toggleAccessChip(event) {
    const chip = event.currentTarget
    const checkbox = chip.querySelector('input[type="checkbox"]')
    
    if (event.target.tagName !== 'INPUT') {
      event.preventDefault()
      checkbox.checked = !checkbox.checked
    }
    
    chip.classList.toggle('active', checkbox.checked)
  }
}
