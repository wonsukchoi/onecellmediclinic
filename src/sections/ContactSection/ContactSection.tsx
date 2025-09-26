import React from 'react'
import ContactForm from '../../components/ContactForm'
import styles from './ContactSection.module.css'

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className="container">
        <ContactForm />
      </div>
    </section>
  )
}

export default ContactSection