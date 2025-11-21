import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

// ========== NOTIFICATION TYPES ==========

export interface Notification {
  id: number;
  user: string;
  user_name: string;
  restaurant: string;
  restaurant_name: string;
  notification_type: string;
  title: string;
  message: string;
  metadata: string;
  is_read: boolean;
  read_at: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  time_ago: string;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface MarkReadRequest {
  notification_ids: number[];
  mark_all: boolean;
}

export interface MarkReadResponse {
  notification_ids: number[];
  mark_all: boolean;
}

// ========== NOTIFICATION OPERATIONS ==========

// GET /notifications/ - Get all notifications with pagination
export const getAllNotifications = async (
  token: string,
  page?: number,
  page_size?: number
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (page_size) params.append('page_size', page_size.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/notifications/?${queryString}` : '/notifications/';
  
  const config = getConfig(url, "GET", token);
  const response = await bookiesAxiosInstance(config);
  
  console.log("🔔 NotificationService - Full response:", response);
  console.log("🔔 NotificationService - response.data:", response.data);
  
  // Handle the response data properly with type safety
  let responseData: any;
  
  // Check if data is in response.data or response itself
  if (response.data !== undefined && response.data !== null) {
    responseData = response.data;
  } else {
    responseData = response;
  }
  
  // Ensure we have a valid response structure
  if (responseData && typeof responseData === 'object') {
    // Check if it already has the correct structure
    if ('count' in responseData && 'results' in responseData) {
      return {
        count: Number(responseData.count) || 0,
        next: responseData.next || null,
        previous: responseData.previous || null,
        results: Array.isArray(responseData.results) ? responseData.results : []
      };
    }
    
    // If it's just an array, convert to our response format
    if (Array.isArray(responseData)) {
      return {
        count: responseData.length,
        next: null,
        previous: null,
        results: responseData
      };
    }
  }
  
  // Return empty response if no valid data
  return { count: 0, next: null, previous: null, results: [] };
};

// DELETE /notifications/{notification_id}/delete/ - Delete single notification
export const deleteNotification = async (
  notificationId: number,
  token: string
): Promise<void> => {
  const config = getConfig(
    `/notifications/${notificationId}/delete/`,
    "DELETE",
    token
  );
  
  console.log("🔔 NotificationService - Deleting notification:", notificationId);
  await bookiesAxiosInstance(config);
  console.log("🔔 NotificationService - Notification deleted successfully");
};

// DELETE /notifications/clear-all/ - Clear all notifications
export const clearAllNotifications = async (token: string): Promise<void> => {
  const config = getConfig("/notifications/clear-all/", "DELETE", token);
  
  console.log("🔔 NotificationService - Clearing all notifications");
  await bookiesAxiosInstance(config);
  console.log("🔔 NotificationService - All notifications cleared");
};

// POST /notifications/mark-read/ - Mark notifications as read
export const markNotificationsAsRead = async (
  data: MarkReadRequest,
  token: string
): Promise<MarkReadResponse> => {
  const config = getConfig("/notifications/mark-read/", "POST", token, data);
  
  console.log("🔔 NotificationService - Marking notifications as read:", data);
  const response = await bookiesAxiosInstance(config);
  console.log("🔔 NotificationService - Mark read response:", response);
  
  // Extract data from response
  let responseData: any;
  
  if (response.data !== undefined && response.data !== null) {
    responseData = response.data;
  } else {
    responseData = response;
  }
  
  // Ensure we return the correct structure
  if (responseData && typeof responseData === 'object') {
    return {
      notification_ids: Array.isArray(responseData.notification_ids) ? responseData.notification_ids : [],
      mark_all: Boolean(responseData.mark_all)
    };
  }
  
  // Return default structure if no valid data
  return {
    notification_ids: [],
    mark_all: false
  };
};

// GET /notifications/unread-count/ - Get unread notifications count
export const getUnreadCount = async (token: string): Promise<number> => {
  const config = getConfig("/notifications/unread-count/", "GET", token);
  
  console.log("🔔 NotificationService - Fetching unread count");
  const response = await bookiesAxiosInstance(config);
  console.log("🔔 NotificationService - Unread count full response:", response);
  console.log("🔔 NotificationService - Unread count response.data:", response.data);
  
  // Extract data from response
  let responseData: any;
  
  if (response.data !== undefined && response.data !== null) {
    responseData = response.data;
  } else {
    responseData = response;
  }
  
  // Handle different response formats
  if (typeof responseData === 'number') {
    return responseData;
  }
  
  if (responseData && typeof responseData === 'object') {
    // Try different possible property names
    if ('total_unread' in responseData && typeof responseData.total_unread === 'number') {
      return responseData.total_unread;
    }
    
    if ('count' in responseData && typeof responseData.count === 'number') {
      return responseData.count;
    }
    
    if ('unread_count' in responseData && typeof responseData.unread_count === 'number') {
      return responseData.unread_count;
    }
    
    // Look for any numeric value that might be the count
    for (const key in responseData) {
      if (typeof responseData[key] === 'number') {
        return responseData[key];
      }
    }
  }
  
  console.log("✅ NotificationService - No unread notifications, returning 0");
  return 0;
};