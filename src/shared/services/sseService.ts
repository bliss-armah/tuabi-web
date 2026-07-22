import { getBaseUrl } from "@/config/api";

class SSEService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private userId: string | number | null = null;

  constructor() {
    // No need to store baseUrl in constructor, get it dynamically
  }

  /**
   * Get the current API base URL using the configuration system
   */
  private getBaseUrl(): string {
    return getBaseUrl();
  }

  /**
   * Check if the SSE endpoint is accessible and properly configured
   */
  async checkSSEEndpoint(): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = this.getBaseUrl();
      const testUrl = `${baseUrl}/sse/events`;

      const response = await fetch(testUrl, {
        method: "HEAD",
      });

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: `Server responded with ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error("Error testing SSE endpoint:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test SSE endpoint accessibility with cookie authentication
   */
  public async testSSEEndpointAccessibility(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const baseUrl = this.getBaseUrl();
      const testUrl = `${baseUrl}/sse/events`;

      const response = await fetch(testUrl, {
        method: "HEAD",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status === 401) {
        return {
          success: false,
          error: "Authentication required - please log in",
        };
      } else {
        return {
          success: false,
          error: `Server responded with ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      console.error("Error testing SSE endpoint:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Connect to SSE server with user authentication
   */
  async connect(userId: string | number): Promise<void> {
    if (this.isConnected() || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      // Build clean SSE endpoint URL - no tokens needed with cookie auth!
      const baseUrl = this.getBaseUrl();
      const sseUrl = new URL(`${baseUrl}/sse/events`);

      // Create EventSource connection with cookie authentication
      this.eventSource = new EventSource(sseUrl.toString(), {
        withCredentials: true, // CRITICAL: Enables HTTP-only cookie authentication
      });

      // Connection event handlers
      this.eventSource.onopen = () => {
        console.log("SSE Connected");
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Clear any existing reconnection timeout
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        console.error("SSE readyState:", this.eventSource?.readyState);
        console.error("SSE URL:", this.eventSource?.url);
        this.isConnecting = false;

        // Provide specific error messages based on common issues
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.error("SSE connection was closed. This could be due to:");
          console.error(
            "1. Server returning HTML instead of text/event-stream",
          );
          console.error("2. Authentication cookie expired");
          console.error("3. CORS problems (withCredentials not enabled)");
          console.error("4. Server endpoint not configured for SSE");

          // For authentication errors, redirect to login instead of reconnecting
          if (error && (error as any).status === 401) {
            console.error(
              "Authentication expired - but not logging out during testing",
            );
            // localStorage.removeItem("user");
            // window.location.href = "/login";
            // return;
          }

          this.handleReconnect();
        }
      };

      // Set up all event handlers
      this.setupEventHandlers();
    } catch (error) {
      console.error("Error connecting to SSE:", error);
      this.isConnecting = false;
    }
  }

  /**
   * Set up all event handlers for real-time notifications
   */
  private setupEventHandlers(): void {
    if (!this.eventSource) return;

    // Connection established event
    this.eventSource.addEventListener("connected", (_event) => {
      // Connection established - no logging needed
    });

    // Subscription-related events
    this.eventSource.addEventListener("subscriptionUpdate", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("subscription", data);
      this.notifyListeners("subscriptionUpdate", data);
    });

    this.eventSource.addEventListener("trialExpiring", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("subscription", data);
      this.notifyListeners("trialExpiring", data);
    });

    this.eventSource.addEventListener("subscriptionExpired", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("subscription", data);
      this.notifyListeners("subscriptionExpired", data);
    });

    // Reminder-related events
    this.eventSource.addEventListener("reminderOverdue", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("reminder", data);
      this.notifyListeners("reminderOverdue", data);
    });

    this.eventSource.addEventListener("reminderDue", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("reminder", data);
      this.notifyListeners("reminderDue", data);
    });

    this.eventSource.addEventListener("reminderCreated", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("reminder", data);
      this.notifyListeners("reminderCreated", data);
    });

    // Payment-related events
    this.eventSource.addEventListener("paymentReceived", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("payment", data);
      this.notifyListeners("paymentReceived", data);
    });

    this.eventSource.addEventListener("paymentOverdue", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("payment", data);
      this.notifyListeners("paymentOverdue", data);
    });

    // Debtor-related events
    this.eventSource.addEventListener("debtorUpdated", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("debtor", data);
      this.notifyListeners("debtorUpdated", data);
    });

    // General notification events
    this.eventSource.addEventListener("notification", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("general", data);
      this.notifyListeners("notification", data);
    });

    // Real-time notification updates for immediate UI sync
    this.eventSource.addEventListener("notificationCreated", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationUpdate("created", data);
    });

    this.eventSource.addEventListener("notificationRead", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationUpdate("read", data);
    });

    this.eventSource.addEventListener("notificationDeleted", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationUpdate("deleted", {
        id: data.notificationId || data.id,
      });
    });

    // Batch notification updates
    this.eventSource.addEventListener("notificationsMarkedRead", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationUpdate("bulk_read", {
        ids: data.notificationIds || data.ids,
      });
    });

    this.eventSource.addEventListener("allNotificationsRead", (_event) => {
      this.handleNotificationUpdate("all_read", {});
    });

    // System events
    this.eventSource.addEventListener("systemAlert", (event) => {
      const data = this.parseEventData(event);
      this.handleNotificationEvent("system", data);
      this.notifyListeners("systemAlert", data);
    });
  }

  /**
   * Parse event data from SSE MessageEvent
   */
  private parseEventData(event: MessageEvent): any {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      console.error("Error parsing SSE event data:", error);
      return { message: event.data };
    }
  }

  /**
   * Handle notification events from SSE and trigger appropriate UI updates
   */
  private handleNotificationEvent(type: string, data: any): void {
    // Show browser notification if available
    this.showSSENotification(type, data);

    // Trigger app-wide events for UI updates
    this.dispatchAppEvents(type, data);

    // Dispatch notification created event for count updates
    // This ensures the notification badge count updates immediately
    this.dispatchNotificationCreatedEvent(type, data);
  }

  /**
   * Dispatch notification created event for immediate UI count updates
   */
  private dispatchNotificationCreatedEvent(type: string, data: any): void {
    window.dispatchEvent(
      new CustomEvent("notificationCreated", {
        detail: {
          id:
            data.id ||
            data.reminderId ||
            data.debtorId ||
            `${type}-${Date.now()}`,
          type,
          data,
          timestamp: new Date().toISOString(),
        },
      }),
    );
  }

  /**
   * Handle real-time notification updates (create, read, delete)
   */
  private handleNotificationUpdate(action: string, data: any): void {
    // Dispatch specific notification update events
    window.dispatchEvent(
      new CustomEvent("notificationUpdate", {
        detail: { action, data, timestamp: new Date().toISOString() },
      }),
    );

    // Dispatch RTK Query cache invalidation events
    switch (action) {
      case "created":
        window.dispatchEvent(
          new CustomEvent("notificationCreated", { detail: data }),
        );
        break;
      case "read":
        window.dispatchEvent(
          new CustomEvent("notificationRead", { detail: data }),
        );
        break;
      case "deleted":
        window.dispatchEvent(
          new CustomEvent("notificationDeleted", { detail: data }),
        );
        break;
      case "bulk_read":
        window.dispatchEvent(
          new CustomEvent("notificationsBulkRead", { detail: data }),
        );
        break;
      case "all_read":
        window.dispatchEvent(
          new CustomEvent("allNotificationsRead", { detail: data }),
        );
        break;
    }

    // Also trigger general cache refresh
    window.dispatchEvent(
      new CustomEvent("refreshNotifications", { detail: { action, data } }),
    );
  }

  /**
   * Show browser notification for SSE events
   */
  private showSSENotification(type: string, data: any): void {
    if (Notification.permission !== "granted") return;

    let title = "Tuabi Notification";
    let body = "You have a new notification";
    let icon = "/fav.png";

    // Customize notification based on type
    switch (type) {
      case "reminder":
        title = "Reminder Alert";
        body = data.message || data.title || "You have a reminder notification";
        break;
      case "payment":
        title = "Payment Notification";
        body = data.message || data.title || "Payment status update";
        break;
      case "subscription":
        title = "Subscription Update";
        body =
          data.message || data.title || "Your subscription has been updated";
        break;
      case "debtor":
        title = "Debtor Update";
        body = data.message || data.title || "Debtor information updated";
        break;
      case "system":
        title = "System Alert";
        body = data.message || data.title || "System notification";
        break;
      default:
        title = data.title || title;
        body = data.message || body;
    }

    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: `sse-${type}`,
      requireInteraction: type === "system",
      data: { ...data, source: "sse", type },
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      this.handleNotificationClick(type, data);
    };

    // Auto close after 10 seconds (except system alerts)
    if (type !== "system") {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  /**
   * Handle notification click actions
   */
  private handleNotificationClick(type: string, data: any): void {
    // Navigate to appropriate page based on notification type
    if (data.clickAction) {
      window.location.href = data.clickAction;
      return;
    }

    switch (type) {
      case "reminder":
        if (data.debtorId) {
          window.location.href = `/debtors/${data.debtorId}`;
        } else {
          window.location.href = "/debtors";
        }
        break;
      case "payment":
        if (data.debtorId) {
          window.location.href = `/debtors/${data.debtorId}`;
        } else {
          window.location.href = "/debtors";
        }
        break;
      case "subscription":
        window.location.href = "/plans";
        break;
      case "debtor":
        if (data.debtorId) {
          window.location.href = `/debtors/${data.debtorId}`;
        } else {
          window.location.href = "/debtors";
        }
        break;
      default:
        window.location.href = "/";
    }
  }

  /**
   * Dispatch custom events for app-wide UI updates
   */
  private dispatchAppEvents(type: string, data: any): void {
    // Dispatch specific events based on notification type
    switch (type) {
      case "reminder":
        window.dispatchEvent(
          new CustomEvent("refreshReminders", { detail: data }),
        );
        if (data.debtorId) {
          window.dispatchEvent(
            new CustomEvent("refreshDebtors", { detail: data }),
          );
        }
        break;
      case "payment":
        window.dispatchEvent(
          new CustomEvent("refreshPayments", { detail: data }),
        );
        window.dispatchEvent(
          new CustomEvent("refreshDebtors", { detail: data }),
        );
        break;
      case "subscription":
        window.dispatchEvent(
          new CustomEvent("refreshSubscription", { detail: data }),
        );
        break;
      case "debtor":
        window.dispatchEvent(
          new CustomEvent("refreshDebtors", { detail: data }),
        );
        break;
      default:
        window.dispatchEvent(new CustomEvent("refreshData", { detail: data }));
    }

    // Always dispatch a general notification event for toast/UI updates
    window.dispatchEvent(
      new CustomEvent("sseNotification", {
        detail: { type, data, timestamp: new Date().toISOString() },
      }),
    );
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max SSE reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  /**
   * Notify registered listeners for specific event types
   */
  private notifyListeners(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in SSE listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to subscription update events
   */
  onSubscriptionUpdate(callback: (data: any) => void): () => void {
    return this.addEventListener("subscriptionUpdate", callback);
  }

  /**
   * Subscribe to trial expiring events
   */
  onTrialExpiring(callback: (data: any) => void): () => void {
    return this.addEventListener("trialExpiring", callback);
  }

  /**
   * Subscribe to subscription expired events
   */
  onSubscriptionExpired(callback: (data: any) => void): () => void {
    return this.addEventListener("subscriptionExpired", callback);
  }

  /**
   * Subscribe to reminder events
   */
  onReminderOverdue(callback: (data: any) => void): () => void {
    return this.addEventListener("reminderOverdue", callback);
  }

  onReminderDue(callback: (data: any) => void): () => void {
    return this.addEventListener("reminderDue", callback);
  }

  onReminderCreated(callback: (data: any) => void): () => void {
    return this.addEventListener("reminderCreated", callback);
  }

  /**
   * Subscribe to payment events
   */
  onPaymentReceived(callback: (data: any) => void): () => void {
    return this.addEventListener("paymentReceived", callback);
  }

  onPaymentOverdue(callback: (data: any) => void): () => void {
    return this.addEventListener("paymentOverdue", callback);
  }

  /**
   * Subscribe to debtor events
   */
  onDebtorUpdated(callback: (data: any) => void): () => void {
    return this.addEventListener("debtorUpdated", callback);
  }

  /**
   * Subscribe to general notification events
   */
  onNotification(callback: (data: any) => void): () => void {
    return this.addEventListener("notification", callback);
  }

  /**
   * Subscribe to system alert events
   */
  onSystemAlert(callback: (data: any) => void): () => void {
    return this.addEventListener("systemAlert", callback);
  }

  /**
   * Generic event listener registration
   */
  public addEventListener(
    eventType: string,
    callback: (data: any) => void,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Disconnect from SSE server
   */
  disconnect(): void {
    if (this.eventSource) {
      console.log("SSE Disconnected");
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.userId = null;
    this.listeners.clear();
  }

  /**
   * Check if SSE is connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }

  /**
   * Get detailed connection information for debugging
   */
  getConnectionInfo(): {
    isConnected: boolean;
    readyState: number;
    readyStateText: string;
    url: string | undefined;
    reconnectAttempts: number;
    isConnecting: boolean;
  } {
    const readyStateMap = {
      [EventSource.CONNECTING]: "CONNECTING",
      [EventSource.OPEN]: "OPEN",
      [EventSource.CLOSED]: "CLOSED",
    };

    const readyState = this.getConnectionState();

    return {
      isConnected: this.isConnected(),
      readyState,
      readyStateText:
        readyStateMap[readyState as keyof typeof readyStateMap] || "UNKNOWN",
      url: this.eventSource?.url,
      reconnectAttempts: this.reconnectAttempts,
      isConnecting: this.isConnecting,
    };
  }

  /**
   * Test notification dispatch (for debugging)
   * Simulates receiving a notification and updates the count
   */
  public testNotificationDispatch(type: string = "test", data: any = {}): void {
    const testNotification = {
      id: data.id || `test-${Date.now()}`,
      type,
      message: data.message || "Test notification",
      ...data,
    };

    this.handleNotificationEvent(type, testNotification);
  }

  /**
   * SSE doesn't support emit like Socket.IO, so this is a no-op for compatibility
   */
  emit(event: string, _data?: any): void {
    console.warn(
      `SSE does not support emit() - attempted to emit '${event}' event`,
    );
  }
}

// Export a singleton instance
export const sseService = new SSEService();
export default sseService;
