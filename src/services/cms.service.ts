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
    try {
      const { page = 1, limit = 20, search, status, template, sort } = params;

      let query = supabase
        .from('dynamic_pages')
        .select(`
          *,
          blocks:page_blocks(
            id, block_type, title, content, styles, sort_order, is_visible
          )
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,keywords.ilike.%${search}%`);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (template) {
        query = query.eq('template_id', template);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as DynamicPage[],
          total: count || 0,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching pages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getPageById(id: string): Promise<ApiResponse<DynamicPage>> {
    try {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select(`
          *,
          blocks:page_blocks(
            id, block_type, title, content, styles, sort_order, is_visible
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data: data as DynamicPage };
    } catch (error) {
      console.error('Error fetching page by id:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getPageBySlug(slug: string): Promise<ApiResponse<DynamicPage>> {
    try {
      const { data, error } = await supabase
        .rpc('get_page_by_slug', { page_slug: slug })
        .single();

      if (error) throw error;

      return { success: true, data: data as DynamicPage };
    } catch (error) {
      console.error('Error fetching page by slug:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createPage(pageData: PageFormData): Promise<ApiResponse<DynamicPage>> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('dynamic_pages')
        .insert({
          ...pageData,
          author_id: user?.id,
          published_at: pageData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as DynamicPage };
    } catch (error) {
      console.error('Error creating page:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updatePage(id: string, pageData: Partial<PageFormData>): Promise<ApiResponse<DynamicPage>> {
    try {
      const updateData: any = { ...pageData };

      // Update published_at when status changes to published
      if (pageData.status === 'published') {
        updateData.published_at = new Date().toISOString();
      } else if (pageData.status === 'draft') {
        updateData.published_at = null;
      }

      const { data, error } = await supabase
        .from('dynamic_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as DynamicPage };
    } catch (error) {
      console.error('Error updating page:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deletePage(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('dynamic_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting page:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async incrementPageViews(slug: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.rpc('increment_page_views', { page_slug: slug });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error incrementing page views:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Page Blocks Management
  static async getPageBlocks(pageId: string): Promise<ApiResponse<PageBlock[]>> {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order');

      if (error) throw error;

      return { success: true, data: data as PageBlock[] };
    } catch (error) {
      console.error('Error fetching page blocks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createBlock(pageId: string, blockData: BlockFormData): Promise<ApiResponse<PageBlock>> {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .insert({
          ...blockData,
          page_id: pageId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as PageBlock };
    } catch (error) {
      console.error('Error creating block:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateBlock(id: string, blockData: Partial<BlockFormData>): Promise<ApiResponse<PageBlock>> {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .update(blockData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as PageBlock };
    } catch (error) {
      console.error('Error updating block:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deleteBlock(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('page_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting block:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async reorderBlocks(_pageId: string, blockIds: string[]): Promise<ApiResponse<void>> {
    try {
      const updates = blockIds.map((id, index) => ({
        id,
        data: { sort_order: index + 1 }
      }));

      const promises = updates.map(({ id, data }) =>
        supabase.from('page_blocks').update(data).eq('id', id)
      );

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      console.error('Error reordering blocks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Header Navigation Management
  static async getNavigation(): Promise<ApiResponse<HeaderNavigation[]>> {
    try {
      const { data, error } = await supabase.rpc('get_navigation_hierarchy');

      if (error) throw error;

      return { success: true, data: data as HeaderNavigation[] };
    } catch (error) {
      console.error('Error fetching navigation:', error);
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
    try {
      const { page = 1, limit = 50, search, parent_id } = params;

      let query = supabase
        .from('header_navigation')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.ilike('label', `%${search}%`);
      }
      if (parent_id !== undefined) {
        if (parent_id === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', parent_id);
        }
      }

      // Apply sorting
      query = query.order('sort_order');

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as HeaderNavigation[],
          total: count || 0,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createNavigationItem(navData: NavigationFormData): Promise<ApiResponse<HeaderNavigation>> {
    try {
      const { data, error } = await supabase
        .from('header_navigation')
        .insert(navData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as HeaderNavigation };
    } catch (error) {
      console.error('Error creating navigation item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateNavigationItem(id: string, navData: Partial<NavigationFormData>): Promise<ApiResponse<HeaderNavigation>> {
    try {
      const { data, error } = await supabase
        .from('header_navigation')
        .update(navData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as HeaderNavigation };
    } catch (error) {
      console.error('Error updating navigation item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async deleteNavigationItem(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('header_navigation')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async reorderNavigationItems(items: { id: string; sort_order: number }[]): Promise<ApiResponse<void>> {
    try {
      const promises = items.map(({ id, sort_order }) =>
        supabase.from('header_navigation').update({ sort_order }).eq('id', id)
      );

      await Promise.all(promises);

      return { success: true };
    } catch (error) {
      console.error('Error reordering navigation items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Page Templates Management
  static async getTemplates(): Promise<ApiResponse<PageTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return { success: true, data: data as PageTemplate[] };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAllTemplates(params: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  } = {}): Promise<ApiResponse<{ data: PageTemplate[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const { page = 1, limit = 20, search, is_active } = params;

      let query = supabase
        .from('page_templates')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active);
      }

      // Apply sorting
      query = query.order('name');

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: {
          data: data as PageTemplate[],
          total: count || 0,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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