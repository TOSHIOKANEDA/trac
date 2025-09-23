import BaseController from "./base_controller"

export default class extends BaseController {
  static targets = [
    "contactTableBody", "companyName", "partnerTypes", "partnerTypeCheckbox", "address",
    "companyDescription", "tradingTerms", "industryRadio", "carrierType", "carrierScacInput"
  ]

  connect() {
    this.setupFormInteractions();
    this.setupCategoryHandlers();
    this.setupCarrierHandlers();
    // Initialize display based on current checkbox states (for edit page)
    this.updateCategoryDisplay();
    
    const firstContactRow = this.contactTableBodyTarget.querySelector('tr');
    if (firstContactRow) {
      this.addContactInputEventListeners(firstContactRow);
    }
  }

  // Setup category change event handlers
  setupCategoryHandlers() {
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.handleCategoryChange();
      });
    });
  }

  // Setup carrier type (Ship/Air) handlers
  setupCarrierHandlers() {
    this.carrierTypeTargets.forEach(radio => {
      radio.addEventListener('change', () => {
        this.handleCarrierTypeChange();
      });
    });
  }

  // Handle carrier type change (Ship vs Air)
  handleCarrierTypeChange() {
    const selectedCarrierType = this.getSelectedCarrierType();
    const scacInput = this.carrierScacInputTarget;

    if (selectedCarrierType === 'true') {
      // Air selected: disable SCAC input and set to "AIR"
      scacInput.value = 'AIR';
      scacInput.disabled = true;
      scacInput.style.opacity = '0.6';
      scacInput.style.cursor = 'not-allowed';
    } else {
      // Ship selected: enable SCAC input
      scacInput.disabled = false;
      scacInput.style.opacity = '1';
      scacInput.style.cursor = 'auto';
      scacInput.value = '';
      scacInput.focus();
    }
  }

  // Get selected carrier type
  getSelectedCarrierType() {
    const selected = this.carrierTypeTargets.find(radio => radio.checked);
    return selected ? selected.value : null;
  }

  // Handle category change event
  handleCategoryChange() {
    this.updateCategoryDisplay();
  }

  // Update display based on selected categories
  updateCategoryDisplay() {
    const selectedTypes = this.getSelectedPartnerTypes();
    const hasCarrier = selectedTypes.some(type => type === 'carrier');
    const hasOther = selectedTypes.some(type => type === 'other');

    // CARRIER logic: disable other checkboxes when CARRIER is selected
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      if (hasCarrier) {
        if (checkbox.dataset.categoryType !== 'carrier') {
          checkbox.disabled = true;
          checkbox.checked = false;
        }
      } else {
        checkbox.disabled = false;
      }
    });

    // Show/hide Carrier Type section (Ship/Air radio buttons)
    const carrierTypeSection = document.getElementById('carrier-type-section');
    if (carrierTypeSection) {
      if (hasCarrier) {
        carrierTypeSection.style.display = 'block';
      } else {
        carrierTypeSection.style.display = 'none';
      }
    }

    // Show/hide SCAC section
    const carrierScacSection = document.getElementById('carrier-scac-section');
    if (carrierScacSection) {
      if (hasCarrier) {
        carrierScacSection.style.display = 'block';
      } else {
        carrierScacSection.style.display = 'none';
      }
    }

    // Show/hide Industry section
    const otherIndustrySection = document.getElementById('other-industry-section');
    if (otherIndustrySection) {
      if (hasOther) {
        otherIndustrySection.style.display = 'block';
      } else {
        otherIndustrySection.style.display = 'none';
        // Uncheck all industry radios when OTHER is deselected
        this.industryRadioTargets.forEach(radio => {
          radio.checked = false;
        });
      }
    }

    // Clear error state
    if (this.partnerTypesTarget) {
      this.partnerTypesTarget.classList.remove('form-error');
      const errorMsg = this.partnerTypesTarget.parentNode.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  }

  // Get selected partner types
  getSelectedPartnerTypes() {
    const selectedTypes = [];
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      if (checkbox.checked) {
        selectedTypes.push(checkbox.dataset.categoryType);
      }
    });
    return selectedTypes;
  }

  // Add contact row
  addContactRow() {
    const newIndex = new Date().getTime();
    
    const newRow = this.contactTableBodyTarget.insertRow();
    newRow.innerHTML = `
      <td>
        <input class="table-input contact-name-input" 
              placeholder="Example: Yamada Ichiro" 
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
          <option value="">Select</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </td>
      <td>
        <input type="text" 
              class="table-input contact-dept-input" 
              placeholder="Example: Sales Dept"
              name="company[users_attributes][${newIndex}][dept]" 
              id="company_users_attributes_${newIndex}_dept">
      </td>
      <td>
        <input type="email" 
              class="table-input contact-email-input" 
              placeholder="Example: yamada@company.com" 
              required
              name="company[users_attributes][${newIndex}][email]" 
              id="company_users_attributes_${newIndex}_email">
      </td>
      <td>
        <input type="tel" 
              class="table-input contact-phone-input" 
              placeholder="Example: 0312345678"
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
                title="Delete contact" 
                data-action="click->contractor-new#deleteRow" data-target-name="contactTableBody">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    this.addContactInputEventListeners(newRow);
  }

  // Add event listeners to contact inputs
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

  // Form validation
  validateForm() {
    const requiredFields = [
      { element: this.companyNameTarget, name: 'Company Name' },
      { element: this.addressTarget, name: 'Address' }
    ];

    let isValid = true;

    // Clear existing errors
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // Validate required fields
    requiredFields.forEach(field => {
      const value = field.element.value.trim();

      if (!value) {
        isValid = false;
        field.element.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `${field.name} is required`;
        field.element.parentNode.appendChild(errorDiv);
      }
    });

    // Validate partner types
    const selectedTypes = this.getSelectedPartnerTypes();
    if (selectedTypes.length === 0) {
      isValid = false;
      this.partnerTypesTarget.classList.add('form-error');
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Please select at least one partner type';
      this.partnerTypesTarget.parentNode.appendChild(errorDiv);
    }

    // Validate CARRIER (SCAC or Air selection)
    const hasCarrier = selectedTypes.some(type => type === 'carrier');
    if (hasCarrier) {
      // Check if carrier type is selected
      const selectedCarrierType = this.getSelectedCarrierType();
      if (!selectedCarrierType) {
        isValid = false;
        const carrierTypeSection = document.getElementById('carrier-type-section');
        if (carrierTypeSection) {
          carrierTypeSection.classList.add('form-error');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = 'Please select Ship or Air for Carrier';
          carrierTypeSection.appendChild(errorDiv);
        }
      }

      // If Ship is selected, SCAC is required
      if (selectedCarrierType === 'false') {
        const scacInput = this.carrierScacInputTarget;
        if (!scacInput || !scacInput.value.trim()) {
          isValid = false;
          if (scacInput) {
            scacInput.classList.add('form-error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'SCAC is required for Ship';
            scacInput.parentNode.appendChild(errorDiv);
          }
        }
      }
    }

    // Validate OTHER Industry
    const hasOther = selectedTypes.some(type => type === 'other');
    if (hasOther) {
      const checkedIndustry = this.industryRadioTargets.find(radio => radio.checked);
      if (!checkedIndustry) {
        isValid = false;
        const industrySection = document.getElementById('other-industry-section');
        if (industrySection) {
          industrySection.classList.add('form-error');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = 'Industry selection is required for Other';
          industrySection.appendChild(errorDiv);
        }
      }
    }

    // Validate contacts table
    const contactRows = this.contactTableBodyTarget.querySelectorAll('tr');
    let hasValidContact = false;

    contactRows.forEach((row) => {
      const nameInput = row.querySelector('.contact-name-input');
      const emailInput = row.querySelector('.contact-email-input');
      
      if (!nameInput || !emailInput) return;
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();

      // Validate contact name
      if (!name) {
        isValid = false;
        nameInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Contact name is required';
        nameInput.parentNode.appendChild(errorDiv);
      } else {
        hasValidContact = true;
      }

      // Validate contact email
      if (!email) {
        isValid = false;
        emailInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Email address is required';
        emailInput.parentNode.appendChild(errorDiv);
      } else if (!this.isValidEmail(email)) {
        isValid = false;
        emailInput.classList.add('form-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Please enter a valid email address';
        emailInput.parentNode.appendChild(errorDiv);
      } else {
        hasValidContact = true;
      }
    });

    if (!hasValidContact) {
      isValid = false;
      alert('At least one valid contact (name and email) is required');
    }

    return isValid;
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Save partner
  savePartner(event) {
    if (!this.validateForm()) {
      alert('Please check the errors below');
      return;
    }

    // Collect contact data
    const contacts = [];
    const contactRows = this.contactTableBodyTarget.querySelectorAll('tr');
    
    contactRows.forEach(row => {
      const nameInput = row.querySelector('.contact-name-input');
      const deptInput = row.querySelector('.contact-dept-input');
      const emailInput = row.querySelector('.contact-email-input');
      const phoneInput = row.querySelector('.contact-phone-input');
      
      if (!nameInput || !emailInput) return;
      
      const name = nameInput.value.trim();
      const title = deptInput ? deptInput.value.trim() : '';
      const email = emailInput.value.trim();
      const phone = phoneInput ? phoneInput.value.trim() : '';
      
      if (name && email) {
        contacts.push({
          name: name,
          title: title,
          email: email,
          phone: phone
        });
      }
    });

    // Get selected partner types
    const selectedPartnerTypes = this.getSelectedPartnerTypes();

    // Collect form data
    const formData = {
      companyName: this.companyNameTarget.value.trim(),
      partnerTypes: selectedPartnerTypes,
      address: this.addressTarget.value.trim(),
      companyDescription: this.companyDescriptionTarget.value.trim(),
      contacts: contacts,
      status: document.querySelector('input[name="status"]:checked')?.value || 'active',
      tradingTerms: this.tradingTermsTarget.value.trim()
    };

    // Animate save button
    const saveButton = event.currentTarget;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveButton.disabled = true;

    setTimeout(() => {
      saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
      
      setTimeout(() => {
        alert(`Saved successfully.\nSelected types: ${selectedPartnerTypes.join(', ')}`);
        console.log('Form data:', formData);
        
        this.resetForm();
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
        saveButton.disabled = false;
      }, 1000);
    }, 2000);
  }

  // Reset form
  resetForm() {
    // Reset text inputs
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.value = '';
      el.classList.remove('form-error');
      el.disabled = false;
      el.style.opacity = '1';
      el.style.cursor = 'auto';
    });
    
    // Reset checkboxes
    this.partnerTypeCheckboxTargets.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = false;
    });

    // Reset radios
    this.carrierTypeTargets.forEach(radio => {
      radio.checked = false;
    });
    this.industryRadioTargets.forEach(radio => {
      radio.checked = false;
    });
    
    // Remove error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelector('input[name="status"][value="active"]').checked = true;
    
    // Clear error state
    if (this.partnerTypesTarget) {
      this.partnerTypesTarget.classList.remove('form-error');
    }
    
    // Reset contacts table
    this.contactTableBodyTarget.innerHTML = `
      <tr>
        <td><input type="text" class="table-input contact-name-input" placeholder="Example: Yamada Ichiro" required></td>
        <td><input type="text" class="table-input contact-dept-input" placeholder="Example: Sales Manager"></td>
        <td><input type="email" class="table-input contact-email-input" placeholder="Example: yamada@company.com" required></td>
        <td><input type="tel" class="table-input contact-phone-input" placeholder="Example: +81-3-1234-5678"></td>
        <td>
          <button type="button" class="delete-contact-btn" title="Delete contact" data-action="click->contractor-new#deleteContactRow">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
    
    const firstRow = this.contactTableBodyTarget.querySelector('tr');
    if (firstRow) {
      this.addContactInputEventListeners(firstRow);
    }
    
    // Hide sections
    const carrierTypeSection = document.getElementById('carrier-type-section');
    const carrierScacSection = document.getElementById('carrier-scac-section');
    const otherIndustrySection = document.getElementById('other-industry-section');
    if (carrierTypeSection) carrierTypeSection.style.display = 'none';
    if (carrierScacSection) carrierScacSection.style.display = 'none';
    if (otherIndustrySection) otherIndustrySection.style.display = 'none';
  }

  // Setup form interactions
  setupFormInteractions() {
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('focus', function() {
        if (!this.disabled) {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
        }
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

  // Delete row
  deleteRow(event) {
    const button = event.target.closest('.delete-contact-btn');
    const row = button.closest('tr');
    row.remove();
  }
}
