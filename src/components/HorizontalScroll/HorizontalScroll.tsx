import React, { useRef, useEffect, useState, ReactNode } from 'react'
import styles from './HorizontalScroll.module.css'

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  showIndicators?: boolean
  itemWidth?: number
  gap?: number
  backgroundColor?: string
  visibleItems?: {
    desktop: number
    tablet: number
    mobile: number
  }
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className = '',
  showIndicators = true,
  itemWidth = 300,
  gap = 20,
  backgroundColor = '#ffffff',
  visibleItems = { desktop: 4, tablet: 3, mobile: 2 }
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  const [currentVisibleItems, setCurrentVisibleItems] = useState(visibleItems.desktop)

  useEffect(() => {
    const updateScrollMetrics = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const maxScrollLeft = container.scrollWidth - container.clientWidth
        setMaxScroll(maxScrollLeft)

        // Update visible items based on screen size
        const width = window.innerWidth
        if (width <= 768) {
          setCurrentVisibleItems(visibleItems.mobile)
        } else if (width <= 1024) {
          setCurrentVisibleItems(visibleItems.tablet)
        } else {
          setCurrentVisibleItems(visibleItems.desktop)
        }
      }
    }

    updateScrollMetrics()
    window.addEventListener('resize', updateScrollMetrics)
    return () => window.removeEventListener('resize', updateScrollMetrics)
  }, [children, visibleItems])

  // Handle mouse wheel to horizontal scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // Already horizontal scroll

      e.preventDefault()
      const scrollAmount = e.deltaY * 0.5
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // Handle scroll position tracking
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft)
    }
  }

  // Touch/mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.pageX,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return

    e.preventDefault()
    const x = e.pageX
    const walk = (x - dragStart.x) * 2
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.touches[0].pageX,
      scrollLeft: scrollContainerRef.current?.scrollLeft || 0
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return

    const x = e.touches[0].pageX
    const walk = (x - dragStart.x) * 2
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Navigation functions
  const scrollToPosition = (position: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: position, behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    const scrollAmount = (itemWidth + gap) * currentVisibleItems
    const newPosition = Math.min(scrollPosition + scrollAmount, maxScroll)
    scrollToPosition(newPosition)
  }

  const scrollPrev = () => {
    const scrollAmount = (itemWidth + gap) * currentVisibleItems
    const newPosition = Math.max(scrollPosition - scrollAmount, 0)
    scrollToPosition(newPosition)
  }

  // Calculate progress for indicators
  const scrollProgress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0
  const canScrollLeft = scrollPosition > 0
  const canScrollRight = scrollPosition < maxScroll

  return (
    <div
      className={`${styles.horizontalScrollWrapper} ${className}`}
      style={{
        '--fade-color': backgroundColor
      } as React.CSSProperties}
    >
      {/* Navigation Arrows */}
      <button
        className={`${styles.navButton} ${styles.navPrev} ${!canScrollLeft ? styles.disabled : ''}`}
        onClick={scrollPrev}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className={`${styles.navButton} ${styles.navNext} ${!canScrollRight ? styles.disabled : ''}`}
        onClick={scrollNext}
        disabled={!canScrollRight}
        aria-label="Scroll right"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={`${styles.scrollContainer} ${isDragging ? styles.dragging : ''}`}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          '--item-width': `${itemWidth}px`,
          '--gap': `${gap}px`,
          '--visible-items': currentVisibleItems
        } as React.CSSProperties}
      >
        {children}
      </div>

      {/* Scroll Indicators */}
      {showIndicators && maxScroll > 0 && (
        <div className={styles.scrollIndicators}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <div className={styles.scrollInfo}>
            <span>{Math.round(scrollProgress)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HorizontalScroll