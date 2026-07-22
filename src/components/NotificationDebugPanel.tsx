import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useMarkAllAsReadMutation } from '@/notifications/notificationsApi';
import NotificationBadge from '@/notifications/NotificationBadge';

const NotificationDebugPanel: React.FC = () => {
  const { unreadCount, loading, error, forceRefresh, _debug } = useNotifications();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 19)]); // Keep last 20 events
  };

  // Listen to all SSE notification events for debugging
  useEffect(() => {
    const eventHandlers = [
      ['notificationCreated', '🆕 New notification'],
      ['notificationRead', '👁️ Notification read'],
      ['notificationDeleted', '🗑️ Notification deleted'],
      ['notificationsBulkRead', '📚 Bulk read'],
      ['allNotificationsRead', '✅ All read'],
      ['notificationUpdate', '🔄 General update'],
      ['refreshNotifications', '🔄 Refresh requested']
    ];

    const listeners = eventHandlers.map(([event, label]) => {
      const handler = (e: CustomEvent) => {
        addEvent(`${label}: ${JSON.stringify(e.detail).substring(0, 100)}`);
      };
      window.addEventListener(event, handler as EventListener);
      return { event, handler };
    });

    return () => {
      listeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler as EventListener);
      });
    };
  }, []);

  const simulateSSEEvent = (eventType: string) => {
    const mockData = {
      id: `mock-${Date.now()}`,
      title: 'Test Notification',
      message: 'This is a simulated notification',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    switch (eventType) {
      case 'created':
        window.dispatchEvent(new CustomEvent('notificationCreated', { detail: mockData }));
        break;
      case 'read':
        window.dispatchEvent(new CustomEvent('notificationRead', { detail: mockData }));
        break;
      case 'deleted':
        window.dispatchEvent(new CustomEvent('notificationDeleted', { detail: { id: mockData.id } }));
        break;
      case 'bulk_read':
        window.dispatchEvent(new CustomEvent('notificationsBulkRead', { detail: { ids: ['1', '2', '3'] } }));
        break;
      case 'all_read':
        window.dispatchEvent(new CustomEvent('allNotificationsRead', { detail: {} }));
        break;
    }
  };

  const testAPICall = async (action: string) => {
    try {
      switch (action) {
        case 'mark_read':
          // This would need a real notification ID
          addEvent('⚠️ API call needs real notification ID');
          break;
        case 'mark_all_read':
          await markAllAsRead().unwrap();
          addEvent('✅ API: All notifications marked as read');
          break;
        case 'force_refresh':
          await forceRefresh();
          addEvent('🔄 API: Force refreshed data');
          break;
      }
    } catch (error) {
      addEvent(`❌ API Error: ${error}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔧 Real-time Notification Debug Panel
      </h2>

      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">📊 Current State</h3>
          <div className="space-y-1 text-sm">
            <div>Real-time Count: <span className="font-mono font-bold">{unreadCount}</span></div>
            <div>API Count: <span className="font-mono">{_debug.apiCount}</span></div>
            <div>Loading: <span className={loading ? 'text-orange-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></div>
            <div>Error: <span className={error ? 'text-red-600' : 'text-green-600'}>{error || 'None'}</span></div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">🔔 Badge Preview</h3>
          <div className="flex items-center space-x-4">
            <NotificationBadge showDebug />
            <span className="text-sm text-gray-600">Live updating badge</span>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-800 mb-2">⚡ SSE Status</h3>
          <div className="text-sm">
            <div>Connected: <span className="text-green-600 font-bold">Unknown</span></div>
            <div className="text-xs text-gray-500 mt-1">Check browser console for connection status</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <h3 className="col-span-full font-bold text-gray-800 mb-2">🧪 Simulate SSE Events:</h3>

        <button
          onClick={() => simulateSSEEvent('created')}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          🆕 New Notification
        </button>

        <button
          onClick={() => simulateSSEEvent('read')}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          👁️ Mark Read
        </button>

        <button
          onClick={() => simulateSSEEvent('deleted')}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          🗑️ Delete
        </button>

        <button
          onClick={() => simulateSSEEvent('all_read')}
          className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          ✅ All Read
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <h3 className="col-span-full font-bold text-gray-800 mb-2">🔗 Test API Calls:</h3>

        <button
          onClick={() => testAPICall('mark_all_read')}
          className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
        >
          📤 API: Mark All Read
        </button>

        <button
          onClick={() => testAPICall('force_refresh')}
          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
        >
          🔄 Force Refresh
        </button>

        <button
          onClick={() => setEvents([])}
          className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
        >
          🧹 Clear Events
        </button>
      </div>

      {/* Event Log */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">📋 Real-time Event Log:</h3>
        <div className="max-h-64 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-gray-500">No events yet. Trigger some actions above or wait for real SSE events.</div>
          ) : (
            events.map((event, index) => (
              <div key={index} className="mb-1">{event}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">📋 How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
          <li>Watch the "Real-time Count" and "Badge Preview" above</li>
          <li>Click "🆕 New Notification" - count should increase immediately</li>
          <li>Click "👁️ Mark Read" - count should decrease immediately</li>
          <li>Click "✅ All Read" - count should go to 0</li>
          <li>Try "📤 API: Mark All Read" to test real API integration</li>
          <li>Check browser console for detailed SSE events</li>
          <li><strong>Real test:</strong> Send a push notification from your backend - it should update instantly!</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationDebugPanel;