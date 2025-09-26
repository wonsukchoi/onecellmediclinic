// Enhanced Contact Form with Supabase Integration
import { db } from '../config/supabase.js'

class ContactFormManager {
  constructor() {
    this.initializeForm()
  }

  initializeForm() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupForm())
    } else {
      this.setupForm()
    }
  }

  setupForm() {
    // Create enhanced contact form
    this.createContactForm()
    this.attachEventListeners()
  }

  createContactForm() {
    // Check if contact form already exists
    let contactForm = document.getElementById('enhanced-contact-form')
    if (contactForm) return

    // Create the form HTML
    const formHTML = `
      <div id="enhanced-contact-form" class="contact-form-container">
        <div class="contact-form-overlay"></div>
        <div class="contact-form-modal">
          <div class="contact-form-header">
            <h2>문의하기</h2>
            <button class="contact-form-close" aria-label="Close form">&times;</button>
          </div>
          <form id="contact-form" class="contact-form">
            <div class="form-group">
              <label for="contact-name">이름 *</label>
              <input type="text" id="contact-name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="contact-email">이메일 *</label>
              <input type="email" id="contact-email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="contact-phone">연락처</label>
              <input type="tel" id="contact-phone" name="phone">
            </div>
            
            <div class="form-group">
              <label for="contact-service">관심 서비스</label>
              <select id="contact-service" name="serviceType">
                <option value="">서비스 선택</option>
                <option value="plastic-surgery">성형외과</option>
                <option value="dermatology">피부과</option>
                <option value="consultation">상담</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="contact-preferred">선호 연락 방법</label>
              <select id="contact-preferred" name="preferredContact">
                <option value="email">이메일</option>
                <option value="phone">전화</option>
                <option value="both">둘 다</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="contact-message">문의 내용 *</label>
              <textarea id="contact-message" name="message" rows="4" required placeholder="문의하실 내용을 자세히 적어주세요..."></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel">취소</button>
              <button type="submit" class="btn-submit">
                <span class="btn-text">문의 보내기</span>
                <span class="btn-loading" style="display: none;">보내는 중...</span>
              </button>
            </div>
          </form>
          
          <div id="form-success" class="form-message success" style="display: none;">
            <h3>문의가 성공적으로 전송되었습니다!</h3>
            <p>빠른 시일 내에 연락드리겠습니다.</p>
          </div>
          
          <div id="form-error" class="form-message error" style="display: none;">
            <h3>문의 전송 중 오류가 발생했습니다.</h3>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </div>
    `

    // Insert form into body
    document.body.insertAdjacentHTML('beforeend', formHTML)

    // Add styles
    this.addContactFormStyles()
  }

  addContactFormStyles() {
    const styles = `
      <style>
        .contact-form-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .contact-form-container.active {
          display: flex;
        }

        .contact-form-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .contact-form-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 1001;
        }

        .contact-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .contact-form-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .contact-form-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .contact-form-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .contact-form {
          padding: 0 24px 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
        }

        .btn-cancel,
        .btn-submit {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 16px;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-submit {
          background: #3b82f6;
          color: white;
          position: relative;
        }

        .btn-submit:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-message {
          padding: 24px;
          text-align: center;
        }

        .form-message.success {
          color: #065f46;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
        }

        .form-message.error {
          color: #991b1b;
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }

        .form-message h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .form-message p {
          margin: 0;
        }

        @media (max-width: 640px) {
          .contact-form-modal {
            margin: 0;
            border-radius: 0;
            height: 100vh;
            max-height: none;
          }
          
          .contact-form-container {
            padding: 0;
          }
        }
      </style>
    `

    document.head.insertAdjacentHTML('beforeend', styles)
  }

  attachEventListeners() {
    const form = document.getElementById('contact-form')
    const closeBtn = document.querySelector('.contact-form-close')
    const cancelBtn = document.querySelector('.btn-cancel')
    const overlay = document.querySelector('.contact-form-overlay')
    const container = document.getElementById('enhanced-contact-form')

    // Form submission
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e))
    }

    // Close form events
    [closeBtn, cancelBtn, overlay].forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.closeForm())
      }
    })

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container?.classList.contains('active')) {
        this.closeForm()
      }
    })

    // Add click listeners to existing contact buttons
    this.attachToExistingButtons()
  }

  attachToExistingButtons() {
    // Find existing contact/consultation buttons and attach click handlers
    const contactButtons = document.querySelectorAll('[data-contact], .btn-cta, .consult-cta, .quick-rail__btn')
    
    contactButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        this.openForm()
      })
    })
  }

  openForm() {
    const container = document.getElementById('enhanced-contact-form')
    if (container) {
      container.classList.add('active')
      document.body.style.overflow = 'hidden'
      
      // Focus first input
      setTimeout(() => {
        const firstInput = container.querySelector('input')
        if (firstInput) firstInput.focus()
      }, 100)
    }
  }

  closeForm() {
    const container = document.getElementById('enhanced-contact-form')
    if (container) {
      container.classList.remove('active')
      document.body.style.overflow = ''
      this.resetForm()
    }
  }

  resetForm() {
    const form = document.getElementById('contact-form')
    const successMsg = document.getElementById('form-success')
    const errorMsg = document.getElementById('form-error')
    
    if (form) {
      form.reset()
      form.style.display = 'block'
    }
    if (successMsg) successMsg.style.display = 'none'
    if (errorMsg) errorMsg.style.display = 'none'
  }

  async handleFormSubmit(e) {
    e.preventDefault()
    
    const form = e.target
    const submitBtn = form.querySelector('.btn-submit')
    const btnText = submitBtn.querySelector('.btn-text')
    const btnLoading = submitBtn.querySelector('.btn-loading')
    
    // Disable submit button and show loading
    submitBtn.disabled = true
    btnText.style.display = 'none'
    btnLoading.style.display = 'inline'
    
    try {
      // Get form data
      const formData = new FormData(form)
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        serviceType: formData.get('serviceType'),
        preferredContact: formData.get('preferredContact'),
        message: formData.get('message')
      }
      
      // Submit to Supabase
      const result = await db.submitContactForm(data)
      
      if (result.success) {
        this.showSuccess()
      } else {
        this.showError(result.error)
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      this.showError('네트워크 오류가 발생했습니다.')
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
    }
  }

  showSuccess() {
    const form = document.getElementById('contact-form')
    const successMsg = document.getElementById('form-success')
    
    if (form) form.style.display = 'none'
    if (successMsg) successMsg.style.display = 'block'
    
    // Auto close after 3 seconds
    setTimeout(() => {
      this.closeForm()
    }, 3000)
  }

  showError(errorMessage = '오류가 발생했습니다.') {
    const errorMsg = document.getElementById('form-error')
    if (errorMsg) {
      const errorText = errorMsg.querySelector('p')
      if (errorText) errorText.textContent = errorMessage
      errorMsg.style.display = 'block'
    }
    
    // Hide error after 5 seconds
    setTimeout(() => {
      if (errorMsg) errorMsg.style.display = 'none'
    }, 5000)
  }
}

// Initialize contact form when script loads
const contactFormManager = new ContactFormManager()

// Export for use in other scripts
export default contactFormManager
