import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Import Swiper CSS
import 'swiper/swiper-bundle.css'

// Detect scrollbar width and set CSS variable
function setScrollbarWidth() {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  document.body.appendChild(scrollDiv)
  
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
}

// Set scrollbar width on load
setScrollbarWidth()

// Update on resize (in case scrollbar appearance changes)
window.addEventListener('resize', setScrollbarWidth)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
