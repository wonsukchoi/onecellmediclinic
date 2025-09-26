// Appointment Booking System with Supabase Integration
import { db } from '../config/supabase.js'

class AppointmentBookingManager {
  constructor() {
    this.initializeBooking()
  }

  initializeBooking() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupBooking())
    } else {
      this.setupBooking()
    }
  }

  setupBooking() {
    this.createBookingForm()
    this.attachEventListeners()
  }

  createBookingForm() {
    let bookingForm = document.getElementById('appointment-booking-form')
    if (bookingForm) return

    const formHTML = `
      <div id="appointment-booking-form" class="booking-form-container">
        <div class="booking-form-overlay"></div>
        <div class="booking-form-modal">
          <div class="booking-form-header">
            <h2>예약하기</h2>
            <button class="booking-form-close" aria-label="Close form">&times;</button>
          </div>
          <form id="booking-form" class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label for="booking-name">이름 *</label>
                <input type="text" id="booking-name" name="patientName" required>
              </div>
              
              <div class="form-group">
                <label for="booking-email">이메일 *</label>
                <input type="email" id="booking-email" name="patientEmail" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="booking-phone">연락처 *</label>
                <input type="tel" id="booking-phone" name="patientPhone" required>
              </div>
              
              <div class="form-group">
                <label for="booking-service">진료과목 *</label>
                <select id="booking-service" name="serviceType" required>
                  <option value="">진료과목 선택</option>
                  <option value="plastic-surgery">성형외과</option>
                  <option value="dermatology">피부과</option>
                  <option value="consultation">상담</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="booking-date">희망 날짜 *</label>
                <input type="date" id="booking-date" name="preferredDate" required>
              </div>
              
              <div class="form-group">
                <label for="booking-time">희망 시간 *</label>
                <select id="booking-time" name="preferredTime" required>
                  <option value="">시간 선택</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="booking-notes">특이사항 / 요청사항</label>
              <textarea id="booking-notes" name="notes" rows="3" placeholder="알레르기, 복용중인 약물, 특별한 요청사항 등을 적어주세요..."></textarea>
            </div>
            
            <div class="booking-notice">
              <p><strong>예약 안내:</strong></p>
              <ul>
                <li>예약 확정은 병원에서 연락드린 후 완료됩니다.</li>
                <li>응급상황 시 예약이 변경될 수 있습니다.</li>
                <li>예약 변경이나 취소는 최소 24시간 전에 연락해주세요.</li>
              </ul>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-cancel">취소</button>
              <button type="submit" class="btn-submit">
                <span class="btn-text">예약 신청</span>
                <span class="btn-loading" style="display: none;">신청 중...</span>
              </button>
            </div>
          </form>
          
          <div id="booking-success" class="form-message success" style="display: none;">
            <h3>예약 신청이 완료되었습니다!</h3>
            <p>빠른 시일 내에 예약 확정 연락을 드리겠습니다.</p>
          </div>
          
          <div id="booking-error" class="form-message error" style="display: none;">
            <h3>예약 신청 중 오류가 발생했습니다.</h3>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', formHTML)
    this.addBookingFormStyles()
    this.setMinDate()
  }

  addBookingFormStyles() {
    const styles = `
      <style>
        .booking-form-container {
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

        .booking-form-container.active {
          display: flex;
        }

        .booking-form-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .booking-form-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 1001;
        }

        .booking-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .booking-form-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .booking-form-close {
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

        .booking-form-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .booking-form {
          padding: 0 24px 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
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

        .booking-notice {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }

        .booking-notice p {
          margin: 0 0 8px 0;
          color: #0c4a6e;
          font-weight: 600;
        }

        .booking-notice ul {
          margin: 0;
          padding-left: 20px;
          color: #0369a1;
        }

        .booking-notice li {
          margin-bottom: 4px;
          font-size: 14px;
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
          background: #059669;
          color: white;
          position: relative;
        }

        .btn-submit:hover:not(:disabled) {
          background: #047857;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .booking-form-modal {
            margin: 0;
            border-radius: 0;
            height: 100vh;
            max-height: none;
          }
          
          .booking-form-container {
            padding: 0;
          }
        }
      </style>
    `

    document.head.insertAdjacentHTML('beforeend', styles)
  }

  setMinDate() {
    const dateInput = document.getElementById('booking-date')
    if (dateInput) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateInput.min = tomorrow.toISOString().split('T')[0]
    }
  }

  attachEventListeners() {
    const form = document.getElementById('booking-form')
    const closeBtn = document.querySelector('.booking-form-close')
    const cancelBtn = document.querySelector('.booking-form .btn-cancel')
    const overlay = document.querySelector('.booking-form-overlay')
    const container = document.getElementById('appointment-booking-form')

    if (form) {
      form.addEventListener('submit', (e) => this.handleBookingSubmit(e))
    }

    [closeBtn, cancelBtn, overlay].forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.closeBookingForm())
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container?.classList.contains('active')) {
        this.closeBookingForm()
      }
    })

    // Add to existing booking buttons
    this.attachToBookingButtons()
  }

  attachToBookingButtons() {
    const bookingButtons = document.querySelectorAll('[data-booking], .btn-booking, .appointment-btn')
    
    bookingButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        this.openBookingForm()
      })
    })
  }

  openBookingForm() {
    const container = document.getElementById('appointment-booking-form')
    if (container) {
      container.classList.add('active')
      document.body.style.overflow = 'hidden'
      
      setTimeout(() => {
        const firstInput = container.querySelector('input')
        if (firstInput) firstInput.focus()
      }, 100)
    }
  }

  closeBookingForm() {
    const container = document.getElementById('appointment-booking-form')
    if (container) {
      container.classList.remove('active')
      document.body.style.overflow = ''
      this.resetBookingForm()
    }
  }

  resetBookingForm() {
    const form = document.getElementById('booking-form')
    const successMsg = document.getElementById('booking-success')
    const errorMsg = document.getElementById('booking-error')
    
    if (form) {
      form.reset()
      form.style.display = 'block'
    }
    if (successMsg) successMsg.style.display = 'none'
    if (errorMsg) errorMsg.style.display = 'none'
    
    this.setMinDate()
  }

  async handleBookingSubmit(e) {
    e.preventDefault()
    
    const form = e.target
    const submitBtn = form.querySelector('.btn-submit')
    const btnText = submitBtn.querySelector('.btn-text')
    const btnLoading = submitBtn.querySelector('.btn-loading')
    
    submitBtn.disabled = true
    btnText.style.display = 'none'
    btnLoading.style.display = 'inline'
    
    try {
      const formData = new FormData(form)
      const data = {
        patientName: formData.get('patientName'),
        patientEmail: formData.get('patientEmail'),
        patientPhone: formData.get('patientPhone'),
        serviceType: formData.get('serviceType'),
        preferredDate: formData.get('preferredDate'),
        preferredTime: formData.get('preferredTime'),
        notes: formData.get('notes')
      }
      
      const result = await db.bookAppointment(data)
      
      if (result.success) {
        this.showBookingSuccess()
      } else {
        this.showBookingError(result.error)
      }
      
    } catch (error) {
      console.error('Booking submission error:', error)
      this.showBookingError('네트워크 오류가 발생했습니다.')
    } finally {
      submitBtn.disabled = false
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
    }
  }

  showBookingSuccess() {
    const form = document.getElementById('booking-form')
    const successMsg = document.getElementById('booking-success')
    
    if (form) form.style.display = 'none'
    if (successMsg) successMsg.style.display = 'block'
    
    setTimeout(() => {
      this.closeBookingForm()
    }, 4000)
  }

  showBookingError(errorMessage = '오류가 발생했습니다.') {
    const errorMsg = document.getElementById('booking-error')
    if (errorMsg) {
      const errorText = errorMsg.querySelector('p')
      if (errorText) errorText.textContent = errorMessage
      errorMsg.style.display = 'block'
    }
    
    setTimeout(() => {
      if (errorMsg) errorMsg.style.display = 'none'
    }, 5000)
  }
}

const appointmentBookingManager = new AppointmentBookingManager()
export default appointmentBookingManager
