import { supabase } from './supabase';
import { getAuthHeadersFast, SUPABASE_CONFIG } from '../utils/fast-auth';
import type {
  UserProfile,
  MedicalRecord,
  Prescription,
  PaymentHistory,
  ConsultationNote,
  MemberLoginFormData,
  MemberSignupFormData,
  MemberDashboardData,
  Appointment,
  ApiResponse
} from '../types';

export class MemberService {
  // Authentication methods
  static async signUp(formData: MemberSignupFormData): Promise<ApiResponse<{ user: unknown; session: unknown }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            role: 'patient'
          },
          emailRedirectTo: `${window.location.origin}/member/verify-email`
        }
      });

      if (error) throw error;

      // Create member profile
      if (data.user) {
        await this.createMemberProfile({
          id: data.user.id,
          email: formData.email,
          full_name: formData.name,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          membership_type: 'basic',
          member_since: new Date().toISOString(),
          total_visits: 0
        });
      }

      return { success: true, data };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async signIn(formData: MemberLoginFormData): Promise<ApiResponse<{ user: unknown; session: unknown }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async signOut(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async resetPassword(email: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/member/reset-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updatePassword(newPassword: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Member profile methods
  static async createMemberProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'create_profile',
            profileData
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create member profile');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getMemberProfile(memberId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_profile',
            userId: memberId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get member profile');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateMemberProfile(memberId: string, profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'update_profile',
            userId: memberId,
            profileData
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update member profile');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Dashboard data
  static async getMemberDashboardData(memberId: string): Promise<ApiResponse<MemberDashboardData>> {
    try {
      const [
        profileResult,
        appointmentsResult,
        medicalRecordsResult,
        prescriptionsResult,
        paymentsResult
      ] = await Promise.all([
        this.getMemberProfile(memberId),
        this.getMemberAppointments(memberId, { limit: 5, upcoming: true }),
        this.getMemberMedicalRecords(memberId, { limit: 5 }),
        this.getMemberPrescriptions(memberId, { status: 'active', limit: 5 }),
        this.getMemberPaymentHistory(memberId, { limit: 5 })
      ]);

      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      const dashboardData: MemberDashboardData = {
        profile: profileResult.data!,
        upcomingAppointments: appointmentsResult.data || [],
        recentMedicalRecords: medicalRecordsResult.data || [],
        activePrescriptions: prescriptionsResult.data || [],
        recentPayments: paymentsResult.data || [],
        unreadNotifications: 0, // TODO: Implement notifications
        membershipStatus: {
          type: profileResult.data!.membership_type || 'basic',
          benefits: this.getMembershipBenefits(profileResult.data!.membership_type || 'basic'),
          expiryDate: undefined // For premium/VIP memberships
        }
      };

      return { success: true, data: dashboardData };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Appointments
  static async getMemberAppointments(
    memberId: string,
    options: { limit?: number; upcoming?: boolean } = {}
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_member_appointments',
            userId: memberId,
            options
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get member appointments');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Medical records
  static async getMemberMedicalRecords(
    memberId: string,
    options: { limit?: number } = {}
  ): Promise<ApiResponse<MedicalRecord[]>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_medical_records',
            userId: memberId,
            options
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get medical records');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Prescriptions
  static async getMemberPrescriptions(
    memberId: string,
    options: { status?: string; limit?: number } = {}
  ): Promise<ApiResponse<Prescription[]>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_prescriptions',
            userId: memberId,
            options
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get prescriptions');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Payment history
  static async getMemberPaymentHistory(
    memberId: string,
    options: { limit?: number } = {}
  ): Promise<ApiResponse<PaymentHistory[]>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_payment_history',
            userId: memberId,
            options
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get payment history');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Consultation notes
  static async getMemberConsultationNotes(
    memberId: string,
    options: { limit?: number } = {}
  ): Promise<ApiResponse<ConsultationNote[]>> {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/member-operations`,
        {
          method: 'POST',
          headers: getAuthHeadersFast(),
          body: JSON.stringify({
            action: 'get_consultation_notes',
            userId: memberId,
            options
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation notes');
      }

      return result;
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  private static getMembershipBenefits(type: 'basic' | 'premium' | 'vip'): string[] {
    const benefits = {
      basic: [
        '기본 진료 예약',
        '온라인 상담',
        '진료 기록 조회',
        '처방전 조회'
      ],
      premium: [
        '우선 예약',
        '전용 상담 라인',
        '정기 건강 검진 할인',
        'VIP 대기실 이용',
        '전담 코디네이터 배정'
      ],
      vip: [
        '당일 예약 가능',
        '24시간 응급 상담',
        '모든 시술 최대 할인',
        '개인 맞춤 케어 프로그램',
        '프리미엄 시설 이용',
        '전용 주차 공간'
      ]
    };

    return benefits[type] || benefits.basic;
  }

  // Current user helper
  static async getCurrentMember(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) return { success: true, data: null };

      // Check if user has patient role
      if (user.user_metadata?.role !== 'patient') {
        return { success: true, data: null };
      }

      const profileResult = await this.getMemberProfile(user.id);
      return profileResult;
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Email verification
  static async resendVerificationEmail(): Promise<ApiResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: `${window.location.origin}/member/verify-email`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}