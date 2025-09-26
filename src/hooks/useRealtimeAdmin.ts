import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Appointment, ConsultationRequest } from '../types'

interface RealtimeUpdates {
  newAppointments: Appointment[]
  newConsultations: ConsultationRequest[]
  updatedAppointments: Appointment[]
  totalUpdates: number
}

export const useRealtimeAdmin = () => {
  const [updates, setUpdates] = useState<RealtimeUpdates>({
    newAppointments: [],
    newConsultations: [],
    updatedAppointments: [],
    totalUpdates: 0
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to appointments table changes
    const appointmentsSubscription = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('New appointment:', payload.new)
          setUpdates(prev => ({
            ...prev,
            newAppointments: [...prev.newAppointments, payload.new as Appointment],
            totalUpdates: prev.totalUpdates + 1
          }))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Updated appointment:', payload.new)
          setUpdates(prev => ({
            ...prev,
            updatedAppointments: [...prev.updatedAppointments, payload.new as Appointment],
            totalUpdates: prev.totalUpdates + 1
          }))
        }
      )
      .subscribe((status) => {
        console.log('Appointments subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Subscribe to consultation requests table changes
    const consultationsSubscription = supabase
      .channel('consultations_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_requests'
        },
        (payload) => {
          console.log('New consultation:', payload.new)
          setUpdates(prev => ({
            ...prev,
            newConsultations: [...prev.newConsultations, payload.new as ConsultationRequest],
            totalUpdates: prev.totalUpdates + 1
          }))
        }
      )
      .subscribe((status) => {
        console.log('Consultations subscription status:', status)
      })

    // Cleanup subscriptions on unmount
    return () => {
      appointmentsSubscription.unsubscribe()
      consultationsSubscription.unsubscribe()
    }
  }, [])

  const clearUpdates = () => {
    setUpdates({
      newAppointments: [],
      newConsultations: [],
      updatedAppointments: [],
      totalUpdates: 0
    })
  }

  const markAsRead = (type: 'appointments' | 'consultations' | 'all') => {
    setUpdates(prev => {
      switch (type) {
        case 'appointments':
          return {
            ...prev,
            newAppointments: [],
            totalUpdates: prev.totalUpdates - prev.newAppointments.length
          }
        case 'consultations':
          return {
            ...prev,
            newConsultations: [],
            totalUpdates: prev.totalUpdates - prev.newConsultations.length
          }
        case 'all':
          return {
            newAppointments: [],
            newConsultations: [],
            updatedAppointments: [],
            totalUpdates: 0
          }
        default:
          return prev
      }
    })
  }

  return {
    updates,
    isConnected,
    clearUpdates,
    markAsRead
  }
}