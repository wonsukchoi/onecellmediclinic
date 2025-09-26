// Event Banner System with Supabase Integration
import { db } from '../config/supabase.js'

class EventBannerManager {
  constructor() {
    this.activeBanners = []
    this.currentBannerIndex = 0
    this.bannerTimer = null
    this.initializeBanners()
  }

  initializeBanners() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupBanners())
    } else {
      this.setupBanners()
    }
  }

  setupBanners() {
    this.createBannerContainer()
    this.addBannerStyles()
  }

  createBannerContainer() {
    let bannerContainer = document.getElementById('event-banner-container')
    if (bannerContainer) return

    const containerHTML = `
      <div id="event-banner-container" class="banner-container">
        <div class="banner-modal">
          <div class="banner-content">
            <button class="banner-close" aria-label="Close banner">&times;</button>
            <div class="banner-image">
              <img id="banner-img" src="" alt="">
            </div>
            <div class="banner-info">
              <h3 id="banner-title"></h3>
              <p id="banner-description"></p>
              <div class="banner-actions">
                <button id="banner-cta" class="btn-banner-cta"></button>
                <button class="btn-banner-later">나중에 보기</button>
              </div>
            </div>
          </div>
          <div class="banner-pagination">
            <div class="banner-dots"></div>
            <div class="banner-timer">
              <div class="timer-bar"></div>
            </div>
          </div>
        </div>
        <div class="banner-overlay"></div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', containerHTML)
    this.attachBannerEvents()
  }

  addBannerStyles() {
    const styles = `
      <style>
        .banner-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1100;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .banner-container.active {
          display: flex;
        }

        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
        }

        .banner-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          z-index: 1101;
          animation: bannerSlideIn 0.4s ease-out;
        }

        @keyframes bannerSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .banner-content {
          position: relative;
        }

        .banner-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .banner-close:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.1);
        }

        .banner-image {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .banner-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-info {
          padding: 24px;
        }

        .banner-info h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
        }

        .banner-info p {
          margin: 0 0 24px 0;
          color: #6b7280;
          line-height: 1.6;
          font-size: 16px;
        }

        .banner-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-banner-cta {
          flex: 1;
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-banner-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-banner-later {
          padding: 14px 24px;
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-banner-later:hover {
          background: #f9fafb;
          color: #374151;
        }

        .banner-pagination {
          padding: 16px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .banner-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .banner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .banner-dot.active {
          background: #667eea;
          transform: scale(1.2);
        }

        .banner-timer {
          height: 3px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .timer-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          width: 0%;
          transition: width 0.1s linear;
        }

        @media (max-width: 640px) {
          .banner-modal {
            margin: 0;
            border-radius: 0;
            height: 100vh;
            max-height: none;
          }
          
          .banner-container {
            padding: 0;
          }
          
          .banner-image {
            height: 250px;
          }
          
          .banner-info h3 {
            font-size: 20px;
          }
          
          .banner-actions {
            flex-direction: column;
          }
        }

        /* Animation for banner transitions */
        .banner-content.slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }

        .banner-content.slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideOut {
          to {
            opacity: 0;
            transform: translateX(-20px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      </style>
    `

    document.head.insertAdjacentHTML('beforeend', styles)
  }

  attachBannerEvents() {
    const container = document.getElementById('event-banner-container')
    const closeBtn = container.querySelector('.banner-close')
    const laterBtn = container.querySelector('.btn-banner-later')
    const ctaBtn = container.querySelector('#banner-cta')
    const overlay = container.querySelector('.banner-overlay')

    // Close banner events
    [closeBtn, laterBtn, overlay].forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.closeBanner())
      }
    })

    // CTA button event
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => this.handleBannerCTA())
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container.classList.contains('active')) {
        this.closeBanner()
      }
    })

    // Pause timer on hover
    const modal = container.querySelector('.banner-modal')
    if (modal) {
      modal.addEventListener('mouseenter', () => this.pauseTimer())
      modal.addEventListener('mouseleave', () => this.resumeTimer())
    }
  }

  async checkAndDisplayBanners() {
    try {
      const result = await db.getActiveEventBanners()
      
      if (result.success && result.data && result.data.length > 0) {
        this.activeBanners = result.data
        this.showBanner()
      }
    } catch (error) {
      console.error('Error fetching event banners:', error)
    }
  }

  showBanner() {
    if (this.activeBanners.length === 0) return

    const container = document.getElementById('event-banner-container')
    if (!container) return

    // Check if banner was recently dismissed
    const lastDismissed = localStorage.getItem('banner-last-dismissed')
    const now = new Date().getTime()
    const oneHour = 60 * 60 * 1000

    if (lastDismissed && (now - parseInt(lastDismissed)) < oneHour) {
      return // Don't show banner if dismissed within last hour
    }

    this.currentBannerIndex = 0
    this.updateBannerContent()
    this.createBannerDots()
    container.classList.add('active')
    document.body.style.overflow = 'hidden'
    
    // Start auto-rotation if multiple banners
    if (this.activeBanners.length > 1) {
      this.startBannerRotation()
    }
  }

  updateBannerContent() {
    const banner = this.activeBanners[this.currentBannerIndex]
    if (!banner) return

    const img = document.getElementById('banner-img')
    const title = document.getElementById('banner-title')
    const description = document.getElementById('banner-description')
    const ctaBtn = document.getElementById('banner-cta')

    if (img) {
      if (banner.image_url) {
        img.src = banner.image_url
        img.alt = banner.title
      } else {
        img.style.display = 'none'
      }
    }

    if (title) title.textContent = banner.title
    if (description) description.textContent = banner.description
    if (ctaBtn) {
      ctaBtn.textContent = banner.button_text || '자세히 보기'
      ctaBtn.dataset.url = banner.link_url || '#'
    }

    this.updateBannerDots()
  }

  createBannerDots() {
    const dotsContainer = document.querySelector('.banner-dots')
    if (!dotsContainer || this.activeBanners.length <= 1) return

    dotsContainer.innerHTML = ''
    
    this.activeBanners.forEach((_, index) => {
      const dot = document.createElement('div')
      dot.className = 'banner-dot'
      if (index === this.currentBannerIndex) {
        dot.classList.add('active')
      }
      
      dot.addEventListener('click', () => {
        this.currentBannerIndex = index
        this.updateBannerContent()
        this.restartTimer()
      })
      
      dotsContainer.appendChild(dot)
    })
  }

  updateBannerDots() {
    const dots = document.querySelectorAll('.banner-dot')
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentBannerIndex)
    })
  }

  startBannerRotation() {
    this.stopBannerRotation()
    this.startTimer()
    
    this.bannerTimer = setInterval(() => {
      this.nextBanner()
    }, 8000) // 8 seconds per banner
  }

  stopBannerRotation() {
    if (this.bannerTimer) {
      clearInterval(this.bannerTimer)
      this.bannerTimer = null
    }
    this.stopTimer()
  }

  restartTimer() {
    this.stopBannerRotation()
    this.startBannerRotation()
  }

  startTimer() {
    const timerBar = document.querySelector('.timer-bar')
    if (!timerBar) return

    timerBar.style.width = '0%'
    timerBar.style.transition = 'width 8s linear'
    
    // Use setTimeout to ensure the transition starts
    setTimeout(() => {
      timerBar.style.width = '100%'
    }, 50)
  }

  stopTimer() {
    const timerBar = document.querySelector('.timer-bar')
    if (timerBar) {
      timerBar.style.transition = 'none'
      timerBar.style.width = '0%'
    }
  }

  pauseTimer() {
    const timerBar = document.querySelector('.timer-bar')
    if (timerBar) {
      const currentWidth = timerBar.getBoundingClientRect().width
      const containerWidth = timerBar.parentElement.getBoundingClientRect().width
      const percentage = (currentWidth / containerWidth) * 100
      
      timerBar.style.transition = 'none'
      timerBar.style.width = percentage + '%'
    }
  }

  resumeTimer() {
    const timerBar = document.querySelector('.timer-bar')
    if (timerBar) {
      const currentWidth = parseFloat(timerBar.style.width) || 0
      const remainingTime = (8000 * (100 - currentWidth)) / 100
      
      timerBar.style.transition = `width ${remainingTime}ms linear`
      timerBar.style.width = '100%'
    }
  }

  nextBanner() {
    if (this.activeBanners.length <= 1) return

    const content = document.querySelector('.banner-content')
    if (content) {
      content.classList.add('slide-out')
      
      setTimeout(() => {
        this.currentBannerIndex = (this.currentBannerIndex + 1) % this.activeBanners.length
        this.updateBannerContent()
        content.classList.remove('slide-out')
        content.classList.add('slide-in')
        
        setTimeout(() => {
          content.classList.remove('slide-in')
        }, 300)
      }, 300)
    }
    
    this.startTimer()
  }

  closeBanner() {
    const container = document.getElementById('event-banner-container')
    if (container) {
      container.classList.remove('active')
      document.body.style.overflow = ''
      this.stopBannerRotation()
      
      // Remember that banner was dismissed
      localStorage.setItem('banner-last-dismissed', new Date().getTime().toString())
    }
  }

  handleBannerCTA() {
    const ctaBtn = document.getElementById('banner-cta')
    const url = ctaBtn?.dataset.url
    
    if (url && url !== '#') {
      if (url.startsWith('http')) {
        window.open(url, '_blank')
      } else {
        window.location.href = url
      }
    } else {
      // If no URL, trigger contact form
      if (window.contactFormManager) {
        this.closeBanner()
        window.contactFormManager.openForm()
      }
    }
  }

  // Public methods for manual control
  showBannersManually(banners) {
    this.activeBanners = banners
    this.showBanner()
  }

  addBanner(banner) {
    this.activeBanners.push(banner)
    if (this.activeBanners.length === 1) {
      this.showBanner()
    } else {
      this.createBannerDots()
    }
  }

  getCurrentBanner() {
    return this.activeBanners[this.currentBannerIndex]
  }
}

const eventBannerManager = new EventBannerManager()
export default eventBannerManager
