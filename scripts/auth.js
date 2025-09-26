// Authentication System with Supabase
import { db, onAuthStateChange } from '../config/supabase.js'

class AuthManager {
  constructor() {
    this.currentUser = null
    this.initializeAuth()
  }

  initializeAuth() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAuth())
    } else {
      this.setupAuth()
    }
  }

  setupAuth() {
    this.createAuthForms()
    this.attachEventListeners()
    this.setupAuthStateListener()
    this.checkCurrentUser()
  }

  createAuthForms() {
    // Create login form
    this.createLoginForm()
    // Create signup form  
    this.createSignupForm()
    // Create user menu
    this.createUserMenu()
  }

  createLoginForm() {
    let loginForm = document.getElementById('login-form-modal')
    if (loginForm) return

    const formHTML = `
      <div id="login-form-modal" class="auth-form-container">
        <div class="auth-form-overlay"></div>
        <div class="auth-form-modal">
          <div class="auth-form-header">
            <h2>로그인</h2>
            <button class="auth-form-close" aria-label="Close form">&times;</button>
          </div>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-email">이메일</label>
              <input type="email" id="login-email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="login-password">비밀번호</label>
              <input type="password" id="login-password" name="password" required>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <span class="btn-text">로그인</span>
                <span class="btn-loading" style="display: none;">로그인 중...</span>
              </button>
            </div>
            
            <div class="auth-links">
              <p>계정이 없으신가요? <button type="button" class="link-btn" data-show-signup>회원가입</button></p>
            </div>
          </form>
          
          <div id="login-success" class="auth-message success" style="display: none;">
            <h3>로그인 성공!</h3>
            <p>환영합니다.</p>
          </div>
          
          <div id="login-error" class="auth-message error" style="display: none;">
            <h3>로그인 실패</h3>
            <p>이메일 또는 비밀번호를 확인해주세요.</p>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', formHTML)
  }

  createSignupForm() {
    let signupForm = document.getElementById('signup-form-modal')
    if (signupForm) return

    const formHTML = `
      <div id="signup-form-modal" class="auth-form-container">
        <div class="auth-form-overlay"></div>
        <div class="auth-form-modal">
          <div class="auth-form-header">
            <h2>회원가입</h2>
            <button class="auth-form-close" aria-label="Close form">&times;</button>
          </div>
          <form id="signup-form" class="auth-form">
            <div class="form-group">
              <label for="signup-name">이름</label>
              <input type="text" id="signup-name" name="fullName" required>
            </div>
            
            <div class="form-group">
              <label for="signup-email">이메일</label>
              <input type="email" id="signup-email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="signup-phone">연락처</label>
              <input type="tel" id="signup-phone" name="phone">
            </div>
            
            <div class="form-group">
              <label for="signup-password">비밀번호</label>
              <input type="password" id="signup-password" name="password" required minlength="6">
            </div>
            
            <div class="form-group">
              <label for="signup-confirm">비밀번호 확인</label>
              <input type="password" id="signup-confirm" name="confirmPassword" required minlength="6">
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <span class="btn-text">회원가입</span>
                <span class="btn-loading" style="display: none;">가입 중...</span>
              </button>
            </div>
            
            <div class="auth-links">
              <p>이미 계정이 있으신가요? <button type="button" class="link-btn" data-show-login>로그인</button></p>
            </div>
          </form>
          
          <div id="signup-success" class="auth-message success" style="display: none;">
            <h3>회원가입 완료!</h3>
            <p>이메일을 확인하여 계정을 활성화해주세요.</p>
          </div>
          
          <div id="signup-error" class="auth-message error" style="display: none;">
            <h3>회원가입 실패</h3>
            <p>입력 정보를 확인해주세요.</p>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', formHTML)
  }

  createUserMenu() {
    // Add user menu to header if not exists
    const header = document.querySelector('.site-header .header__inner')
    if (!header || document.getElementById('user-menu')) return

    const userMenuHTML = `
      <div id="user-menu" class="user-menu" style="display: none;">
        <button class="user-menu-trigger">
          <span class="user-name">사용자</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H1z"/>
          </svg>
        </button>
        <div class="user-menu-dropdown">
          <a href="#" class="menu-item" data-my-appointments>내 예약</a>
          <a href="#" class="menu-item" data-my-profile>프로필</a>
          <button class="menu-item" data-logout>로그아웃</button>
        </div>
      </div>
      
      <div id="auth-buttons" class="auth-buttons">
        <button class="btn-auth" data-show-login>로그인</button>
        <button class="btn-auth btn-signup" data-show-signup>회원가입</button>
      </div>
    `

    header.insertAdjacentHTML('beforeend', userMenuHTML)
    this.addAuthStyles()
  }

  addAuthStyles() {
    const styles = `
      <style>
        .auth-form-container {
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

        .auth-form-container.active {
          display: flex;
        }

        .auth-form-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .auth-form-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 1001;
        }

        .auth-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .auth-form-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .auth-form-close {
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

        .auth-form-close:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .auth-form {
          padding: 0 24px 24px;
        }

        .auth-form .form-group {
          margin-bottom: 20px;
        }

        .auth-form label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
        }

        .auth-form input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .auth-form input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          margin: 32px 0 24px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-links {
          text-align: center;
          margin-top: 20px;
        }

        .auth-links p {
          margin: 0;
          color: #6b7280;
        }

        .link-btn {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          text-decoration: underline;
          font-size: inherit;
        }

        .link-btn:hover {
          color: #2563eb;
        }

        .auth-message {
          padding: 24px;
          text-align: center;
        }

        .auth-message.success {
          color: #065f46;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
        }

        .auth-message.error {
          color: #991b1b;
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }

        .auth-message h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        .auth-message p {
          margin: 0;
        }

        .auth-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-auth {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-size: 14px;
        }

        .btn-auth:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-auth.btn-signup {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-auth.btn-signup:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .user-menu {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-menu-trigger:hover {
          background: #e5e7eb;
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          display: none;
          z-index: 1000;
        }

        .user-menu.active .user-menu-dropdown {
          display: block;
        }

        .menu-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          text-decoration: none;
          color: #374151;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: 14px;
        }

        .menu-item:hover {
          background: #f3f4f6;
        }

        .menu-item:first-child {
          border-radius: 8px 8px 0 0;
        }

        .menu-item:last-child {
          border-radius: 0 0 8px 8px;
        }

        @media (max-width: 640px) {
          .auth-buttons {
            gap: 8px;
          }
          
          .btn-auth {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
      </style>
    `

    document.head.insertAdjacentHTML('beforeend', styles)
  }

  attachEventListeners() {
    // Login form events
    this.attachLoginFormEvents()
    // Signup form events
    this.attachSignupFormEvents()
    // Auth button events
    this.attachAuthButtonEvents()
    // User menu events
    this.attachUserMenuEvents()
  }

  attachLoginFormEvents() {
    const loginForm = document.getElementById('login-form')
    const loginClose = document.querySelector('#login-form-modal .auth-form-close')
    const loginOverlay = document.querySelector('#login-form-modal .auth-form-overlay')
    const showSignupBtn = document.querySelector('#login-form-modal [data-show-signup]')

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e))
    }

    [loginClose, loginOverlay].forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.closeAuthForms())
      }
    })

    if (showSignupBtn) {
      showSignupBtn.addEventListener('click', () => {
        this.closeAuthForms()
        this.showSignupForm()
      })
    }
  }

  attachSignupFormEvents() {
    const signupForm = document.getElementById('signup-form')
    const signupClose = document.querySelector('#signup-form-modal .auth-form-close')
    const signupOverlay = document.querySelector('#signup-form-modal .auth-form-overlay')
    const showLoginBtn = document.querySelector('#signup-form-modal [data-show-login]')

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e))
    }

    [signupClose, signupOverlay].forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.closeAuthForms())
      }
    })

    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        this.closeAuthForms()
        this.showLoginForm()
      })
    }
  }

  attachAuthButtonEvents() {
    const loginBtn = document.querySelector('[data-show-login]')
    const signupBtn = document.querySelector('[data-show-signup]')

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginForm())
    }

    if (signupBtn) {
      signupBtn.addEventListener('click', () => this.showSignupForm())
    }
  }

  attachUserMenuEvents() {
    const userMenuTrigger = document.querySelector('.user-menu-trigger')
    const logoutBtn = document.querySelector('[data-logout]')
    const userMenu = document.getElementById('user-menu')

    if (userMenuTrigger) {
      userMenuTrigger.addEventListener('click', () => {
        userMenu?.classList.toggle('active')
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout())
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (userMenu && !userMenu.contains(e.target)) {
        userMenu.classList.remove('active')
      }
    })
  }

  setupAuthStateListener() {
    onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.currentUser = session.user
        this.updateUIForLoggedInUser()
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null
        this.updateUIForLoggedOutUser()
      }
    })
  }

  async checkCurrentUser() {
    const result = await db.getCurrentUser()
    if (result.success && result.user) {
      this.currentUser = result.user
      this.updateUIForLoggedInUser()
    } else {
      this.updateUIForLoggedOutUser()
    }
  }

  updateUIForLoggedInUser() {
    const authButtons = document.getElementById('auth-buttons')
    const userMenu = document.getElementById('user-menu')
    const userName = document.querySelector('.user-name')

    if (authButtons) authButtons.style.display = 'none'
    if (userMenu) userMenu.style.display = 'block'
    if (userName && this.currentUser) {
      userName.textContent = this.currentUser.user_metadata?.full_name || this.currentUser.email
    }
  }

  updateUIForLoggedOutUser() {
    const authButtons = document.getElementById('auth-buttons')
    const userMenu = document.getElementById('user-menu')

    if (authButtons) authButtons.style.display = 'flex'
    if (userMenu) userMenu.style.display = 'none'
  }

  showLoginForm() {
    const loginModal = document.getElementById('login-form-modal')
    if (loginModal) {
      loginModal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
  }

  showSignupForm() {
    const signupModal = document.getElementById('signup-form-modal')
    if (signupModal) {
      signupModal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
  }

  closeAuthForms() {
    const loginModal = document.getElementById('login-form-modal')
    const signupModal = document.getElementById('signup-form-modal')

    if (loginModal) loginModal.classList.remove('active')
    if (signupModal) signupModal.classList.remove('active')
    
    document.body.style.overflow = ''
    this.resetAuthForms()
  }

  resetAuthForms() {
    const loginForm = document.getElementById('login-form')
    const signupForm = document.getElementById('signup-form')
    const messages = document.querySelectorAll('.auth-message')

    if (loginForm) {
      loginForm.reset()
      loginForm.style.display = 'block'
    }
    if (signupForm) {
      signupForm.reset()
      signupForm.style.display = 'block'
    }

    messages.forEach(msg => msg.style.display = 'none')
  }

  async handleLogin(e) {
    e.preventDefault()
    
    const form = e.target
    const submitBtn = form.querySelector('.btn-primary')
    const btnText = submitBtn.querySelector('.btn-text')
    const btnLoading = submitBtn.querySelector('.btn-loading')
    
    submitBtn.disabled = true
    btnText.style.display = 'none'
    btnLoading.style.display = 'inline'
    
    try {
      const formData = new FormData(form)
      const email = formData.get('email')
      const password = formData.get('password')
      
      const result = await db.signIn(email, password)
      
      if (result.success) {
        this.showLoginSuccess()
        setTimeout(() => this.closeAuthForms(), 2000)
      } else {
        this.showLoginError(result.error)
      }
      
    } catch (error) {
      console.error('Login error:', error)
      this.showLoginError('로그인 중 오류가 발생했습니다.')
    } finally {
      submitBtn.disabled = false
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
    }
  }

  async handleSignup(e) {
    e.preventDefault()
    
    const form = e.target
    const submitBtn = form.querySelector('.btn-primary')
    const btnText = submitBtn.querySelector('.btn-text')
    const btnLoading = submitBtn.querySelector('.btn-loading')
    
    const formData = new FormData(form)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    if (password !== confirmPassword) {
      this.showSignupError('비밀번호가 일치하지 않습니다.')
      return
    }
    
    submitBtn.disabled = true
    btnText.style.display = 'none'
    btnLoading.style.display = 'inline'
    
    try {
      const email = formData.get('email')
      const userData = {
        full_name: formData.get('fullName'),
        phone: formData.get('phone')
      }
      
      const result = await db.signUp(email, password, userData)
      
      if (result.success) {
        this.showSignupSuccess()
        setTimeout(() => this.closeAuthForms(), 3000)
      } else {
        this.showSignupError(result.error)
      }
      
    } catch (error) {
      console.error('Signup error:', error)
      this.showSignupError('회원가입 중 오류가 발생했습니다.')
    } finally {
      submitBtn.disabled = false
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
    }
  }

  async handleLogout() {
    try {
      const result = await db.signOut()
      if (result.success) {
        // UI will be updated by the auth state listener
        console.log('Logged out successfully')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  showLoginSuccess() {
    const form = document.getElementById('login-form')
    const successMsg = document.getElementById('login-success')
    
    if (form) form.style.display = 'none'
    if (successMsg) successMsg.style.display = 'block'
  }

  showLoginError(errorMessage = '로그인에 실패했습니다.') {
    const errorMsg = document.getElementById('login-error')
    if (errorMsg) {
      const errorText = errorMsg.querySelector('p')
      if (errorText) errorText.textContent = errorMessage
      errorMsg.style.display = 'block'
    }
    
    setTimeout(() => {
      if (errorMsg) errorMsg.style.display = 'none'
    }, 5000)
  }

  showSignupSuccess() {
    const form = document.getElementById('signup-form')
    const successMsg = document.getElementById('signup-success')
    
    if (form) form.style.display = 'none'
    if (successMsg) successMsg.style.display = 'block'
  }

  showSignupError(errorMessage = '회원가입에 실패했습니다.') {
    const errorMsg = document.getElementById('signup-error')
    if (errorMsg) {
      const errorText = errorMsg.querySelector('p')
      if (errorText) errorText.textContent = errorMessage
      errorMsg.style.display = 'block'
    }
    
    setTimeout(() => {
      if (errorMsg) errorMsg.style.display = 'none'
    }, 5000)
  }

  // Public methods for external use
  getCurrentUser() {
    return this.currentUser
  }

  isLoggedIn() {
    return !!this.currentUser
  }
}

const authManager = new AuthManager()
export default authManager
