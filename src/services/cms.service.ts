import { supabase } from './supabase';
import type {
  ApiResponse,
  DynamicPage,
  PageBlock,
  HeaderNavigation,
  PageTemplate,
  PageAnalytics,
  PageFormData,
  BlockFormData,
  NavigationFormData,
  PageStatus
} from '../types';

/**
 * Helper function to make edge function calls
 */
async function callEdgeFunction(
  functionName: string,
  action: string,
  params?: any,
  data?: any
): Promise<ApiResponse<any>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const supabaseUrl = "https://weqqkknwpgremfugcbvz.supabase.co";

    const response = await fetch(
      `${supabaseUrl}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, params, data })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName} edge function:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * CMS Service for managing dynamic pages, header navigation, and content blocks
 */
export class CMSService {

  // Dynamic Pages Management
  static async getPages(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PageStatus;
    template?: string;
    sort?: { field: string; direction: 'asc' | 'desc' };
  } = {}): Promise<ApiResponse<{ data: DynamicPage[]; total: number; page: number; limit: number; totalPages: number }>> {
    return callEdgeFunction('manage-cms-pages', 'list', params);
  }

  static async getPageById(id: string): Promise<ApiResponse<DynamicPage>> {
    return callEdgeFunction('manage-cms-pages', 'get', { id });
  }

  static async getPageBySlug(slug: string): Promise<ApiResponse<DynamicPage>> {
    return callEdgeFunction('manage-cms-pages', 'get', { slug });
  }

  static async createPage(pageData: PageFormData): Promise<ApiResponse<DynamicPage>> {
    return callEdgeFunction('manage-cms-pages', 'create', undefined, pageData);
  }

  static async updatePage(id: string, pageData: Partial<PageFormData>): Promise<ApiResponse<DynamicPage>> {
    return callEdgeFunction('manage-cms-pages', 'update', { id }, pageData);
  }

  static async deletePage(id: string): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-pages', 'delete', { id });
  }

  static async incrementPageViews(slug: string): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-pages', 'increment_views', { slug });
  }

  // Page Blocks Management
  static async getPageBlocks(pageId: string): Promise<ApiResponse<PageBlock[]>> {
    return callEdgeFunction('manage-cms-blocks', 'list', { page_id: pageId });
  }

  static async createBlock(pageId: string, blockData: BlockFormData): Promise<ApiResponse<PageBlock>> {
    return callEdgeFunction('manage-cms-blocks', 'create', { page_id: pageId }, blockData);
  }

  static async updateBlock(id: string, blockData: Partial<BlockFormData>): Promise<ApiResponse<PageBlock>> {
    return callEdgeFunction('manage-cms-blocks', 'update', { id }, blockData);
  }

  static async deleteBlock(id: string): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-blocks', 'delete', { id });
  }

  static async reorderBlocks(_pageId: string, blockIds: string[]): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-blocks', 'reorder', { block_ids: blockIds });
  }

  // Header Navigation Management - Public endpoint (no auth required)
  static async getNavigation(language: string = 'kr'): Promise<ApiResponse<HeaderNavigation[]>> {
    try {
      const supabaseUrl = "https://weqqkknwpgremfugcbvz.supabase.co";

      // Make public request without authentication headers
      const response = await fetch(
        `${supabaseUrl}/functions/v1/manage-cms-navigation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'hierarchy', params: { language } })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error calling manage-cms-navigation edge function:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAllNavigationItems(params: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: string | null;
  } = {}): Promise<ApiResponse<{ data: HeaderNavigation[]; total: number; page: number; limit: number; totalPages: number }>> {
    return callEdgeFunction('manage-cms-navigation', 'list', params);
  }

  static async createNavigationItem(navData: NavigationFormData): Promise<ApiResponse<HeaderNavigation>> {
    return callEdgeFunction('manage-cms-navigation', 'create', undefined, navData);
  }

  static async updateNavigationItem(id: string, navData: Partial<NavigationFormData>): Promise<ApiResponse<HeaderNavigation>> {
    return callEdgeFunction('manage-cms-navigation', 'update', { id }, navData);
  }

  static async deleteNavigationItem(id: string): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-navigation', 'delete', { id });
  }

  static async reorderNavigationItems(items: { id: string; sort_order: number }[]): Promise<ApiResponse<void>> {
    return callEdgeFunction('manage-cms-navigation', 'reorder', { items });
  }

  // Page Templates Management
  static async getTemplates(): Promise<ApiResponse<PageTemplate[]>> {
    return callEdgeFunction('manage-cms-templates', 'active');
  }

  static async getAllTemplates(params: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  } = {}): Promise<ApiResponse<{ data: PageTemplate[]; total: number; page: number; limit: number; totalPages: number }>> {
    return callEdgeFunction('manage-cms-templates', 'list', params);
  }

  // Analytics
  static async trackPageView(pageId: string, analytics: Partial<PageAnalytics>): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('page_analytics')
        .insert({
          page_id: pageId,
          ...analytics
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error tracking page view:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getPageAnalytics(pageId: string, params: {
    from?: string;
    to?: string;
  } = {}): Promise<ApiResponse<{ views: number; unique_visitors: number; avg_time_on_page: number; bounce_rate: number }>> {
    try {
      const { from, to } = params;

      let query = supabase
        .from('page_analytics')
        .select('*')
        .eq('page_id', pageId);

      if (from) {
        query = query.gte('visited_at', from);
      }
      if (to) {
        query = query.lte('visited_at', to);
      }

      const { data, error } = await query;

      if (error) throw error;

      const analytics = data as PageAnalytics[];
      const views = analytics.length;
      const unique_visitors = new Set(analytics.map(a => a.visitor_ip)).size;
      const avg_time_on_page = analytics.reduce((sum, a) => sum + (a.time_on_page || 0), 0) / views || 0;
      const bounce_rate = (analytics.filter(a => a.bounce).length / views) * 100 || 0;

      return {
        success: true,
        data: {
          views,
          unique_visitors,
          avg_time_on_page,
          bounce_rate
        }
      };
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility methods
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  static async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      // For now, keep direct database call for slug validation as it's a simple query
      // and doesn't need the complexity of an edge function
      let query = supabase
        .from('dynamic_pages')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.length === 0;
    } catch (error) {
      console.error('Error validating slug:', error);
      return false;
    }
  }
}

export default CMSService;