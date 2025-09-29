import React, { createContext, useContext, type ReactNode } from "react";
import { getAuthHeaders, SUPABASE_CONFIG } from "../utils/fast-auth";
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
} from "../types";

async function callEdgeFunction(
  functionName: string,
  action: string,
  params?: Record<string, unknown>,
  data?: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${SUPABASE_CONFIG.url}/functions/v1/${functionName}`,
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

interface CMSContextType {
  getPages: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PageStatus;
    template?: string;
    sort?: { field: string; direction: 'asc' | 'desc' };
  }) => Promise<ApiResponse<{ data: DynamicPage[]; total: number; page: number; limit: number; totalPages: number }>>;
  getPageById: (id: string) => Promise<ApiResponse<DynamicPage>>;
  getPageBySlug: (slug: string) => Promise<ApiResponse<DynamicPage>>;
  createPage: (pageData: PageFormData) => Promise<ApiResponse<DynamicPage>>;
  updatePage: (id: string, pageData: Partial<PageFormData>) => Promise<ApiResponse<DynamicPage>>;
  deletePage: (id: string) => Promise<ApiResponse<void>>;
  incrementPageViews: (slug: string) => Promise<ApiResponse<void>>;

  getPageBlocks: (pageId: string) => Promise<ApiResponse<PageBlock[]>>;
  createBlock: (pageId: string, blockData: BlockFormData) => Promise<ApiResponse<PageBlock>>;
  updateBlock: (id: string, blockData: Partial<BlockFormData>) => Promise<ApiResponse<PageBlock>>;
  deleteBlock: (id: string) => Promise<ApiResponse<void>>;
  reorderBlocks: (pageId: string, blockIds: string[]) => Promise<ApiResponse<void>>;

  getNavigation: (language?: string) => Promise<ApiResponse<HeaderNavigation[]>>;
  getAllNavigationItems: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: string | null;
  }) => Promise<ApiResponse<{ data: HeaderNavigation[]; total: number; page: number; limit: number; totalPages: number }>>;
  createNavigationItem: (navData: NavigationFormData) => Promise<ApiResponse<HeaderNavigation>>;
  updateNavigationItem: (id: string, navData: Partial<NavigationFormData>) => Promise<ApiResponse<HeaderNavigation>>;
  deleteNavigationItem: (id: string) => Promise<ApiResponse<void>>;
  reorderNavigationItems: (items: { id: string; sort_order: number }[]) => Promise<ApiResponse<void>>;

  getTemplates: () => Promise<ApiResponse<PageTemplate[]>>;
  getAllTemplates: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }) => Promise<ApiResponse<{ data: PageTemplate[]; total: number; page: number; limit: number; totalPages: number }>>;

  trackPageView: (pageId: string, analytics: Partial<PageAnalytics>) => Promise<ApiResponse<void>>;
  getPageAnalytics: (pageId: string, params?: {
    from?: string;
    to?: string;
  }) => Promise<ApiResponse<{ views: number; unique_visitors: number; avg_time_on_page: number; bounce_rate: number }>>;

  generateSlug: (title: string) => string;
  validateSlug: (slug: string, excludeId?: string) => Promise<boolean>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

interface CMSProviderProps {
  children: ReactNode;
}

export const CMSProvider: React.FC<CMSProviderProps> = ({ children }) => {
  const getPages = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: PageStatus;
    template?: string;
    sort?: { field: string; direction: 'asc' | 'desc' };
  } = {}): Promise<ApiResponse<{ data: DynamicPage[]; total: number; page: number; limit: number; totalPages: number }>> => {
    return callEdgeFunction('manage-cms-pages', 'list', params) as Promise<ApiResponse<{ data: DynamicPage[]; total: number; page: number; limit: number; totalPages: number }>>;
  };

  const getPageById = async (id: string): Promise<ApiResponse<DynamicPage>> => {
    return callEdgeFunction('manage-cms-pages', 'get', { id });
  };

  const getPageBySlug = async (slug: string): Promise<ApiResponse<DynamicPage>> => {
    return callEdgeFunction('manage-cms-pages', 'get', { slug });
  };

  const createPage = async (pageData: PageFormData): Promise<ApiResponse<DynamicPage>> => {
    return callEdgeFunction('manage-cms-pages', 'create', undefined, pageData);
  };

  const updatePage = async (id: string, pageData: Partial<PageFormData>): Promise<ApiResponse<DynamicPage>> => {
    return callEdgeFunction('manage-cms-pages', 'update', { id }, pageData);
  };

  const deletePage = async (id: string): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-pages', 'delete', { id });
  };

  const incrementPageViews = async (slug: string): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-pages', 'increment_views', { slug });
  };

  const getPageBlocks = async (pageId: string): Promise<ApiResponse<PageBlock[]>> => {
    return callEdgeFunction('manage-cms-blocks', 'list', { page_id: pageId });
  };

  const createBlock = async (pageId: string, blockData: BlockFormData): Promise<ApiResponse<PageBlock>> => {
    return callEdgeFunction('manage-cms-blocks', 'create', { page_id: pageId }, blockData);
  };

  const updateBlock = async (id: string, blockData: Partial<BlockFormData>): Promise<ApiResponse<PageBlock>> => {
    return callEdgeFunction('manage-cms-blocks', 'update', { id }, blockData);
  };

  const deleteBlock = async (id: string): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-blocks', 'delete', { id });
  };

  const reorderBlocks = async (_pageId: string, blockIds: string[]): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-blocks', 'reorder', { block_ids: blockIds });
  };

  const getNavigation = async (language: string = 'kr'): Promise<ApiResponse<HeaderNavigation[]>> => {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/manage-cms-navigation`,
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getAllNavigationItems = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: string | null;
  } = {}): Promise<ApiResponse<{ data: HeaderNavigation[]; total: number; page: number; limit: number; totalPages: number }>> => {
    return callEdgeFunction('manage-cms-navigation', 'list', params);
  };

  const createNavigationItem = async (navData: NavigationFormData): Promise<ApiResponse<HeaderNavigation>> => {
    return callEdgeFunction('manage-cms-navigation', 'create', undefined, navData);
  };

  const updateNavigationItem = async (id: string, navData: Partial<NavigationFormData>): Promise<ApiResponse<HeaderNavigation>> => {
    return callEdgeFunction('manage-cms-navigation', 'update', { id }, navData);
  };

  const deleteNavigationItem = async (id: string): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-navigation', 'delete', { id });
  };

  const reorderNavigationItems = async (items: { id: string; sort_order: number }[]): Promise<ApiResponse<void>> => {
    return callEdgeFunction('manage-cms-navigation', 'reorder', { items });
  };

  const getTemplates = async (): Promise<ApiResponse<PageTemplate[]>> => {
    return callEdgeFunction('manage-cms-templates', 'active');
  };

  const getAllTemplates = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  } = {}): Promise<ApiResponse<{ data: PageTemplate[]; total: number; page: number; limit: number; totalPages: number }>> => {
    return callEdgeFunction('manage-cms-templates', 'list', params);
  };

  const trackPageView = async (pageId: string, analytics: Partial<PageAnalytics>): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/analytics-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
          },
          body: JSON.stringify({
            action: 'track_page_view',
            pageId,
            analytics
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to track page view');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getPageAnalytics = async (pageId: string, params: {
    from?: string;
    to?: string;
  } = {}): Promise<ApiResponse<{ views: number; unique_visitors: number; avg_time_on_page: number; bounce_rate: number }>> => {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/analytics-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
          },
          body: JSON.stringify({
            action: 'get_page_analytics',
            pageId,
            params
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get page analytics');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateSlug = async (slug: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${SUPABASE_CONFIG.url}/functions/v1/analytics-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
          },
          body: JSON.stringify({
            action: 'validate_slug',
            params: { slug, excludeId }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return false;
      }

      return result.data?.isUnique || false;
    } catch {
      return false;
    }
  };

  const value: CMSContextType = {
    getPages,
    getPageById,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    incrementPageViews,
    getPageBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    getNavigation,
    getAllNavigationItems,
    createNavigationItem,
    updateNavigationItem,
    deleteNavigationItem,
    reorderNavigationItems,
    getTemplates,
    getAllTemplates,
    trackPageView,
    getPageAnalytics,
    generateSlug,
    validateSlug,
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};

export default CMSContext;