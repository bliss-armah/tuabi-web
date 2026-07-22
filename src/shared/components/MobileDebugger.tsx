import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { getBaseUrl } from "@/config/api";

interface MobileDebuggerProps {
  showByDefault?: boolean;
  className?: string;
}

export default function MobileDebugger({
  showByDefault = false,
  className = "",
}: MobileDebuggerProps) {
  const [isVisible, setIsVisible] = useState(showByDefault);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  useEffect(() => {
    const collectDebugInfo = () => {
      const userAgent = navigator.userAgent;
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      const info = {
        // Device Info
        userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,

        // Screen & Viewport
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },

        // Browser Detection
        browsers: {
          isIOS: /iPad|iPhone|iPod/.test(userAgent),
          isAndroid: /Android/.test(userAgent),
          isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
          isChrome: /Chrome/.test(userAgent),
          isFirefox: /Firefox/.test(userAgent),
          isMobile: /Mobi|Android/i.test(userAgent),
          isStandalone: (window.navigator as any).standalone === true,
          isPWA: window.matchMedia("(display-mode: standalone)").matches,
        },

        // CSS Support
        cssSupport: {
          dvh: CSS.supports("height", "100dvh"),
          svh: CSS.supports("height", "100svh"),
          lvh: CSS.supports("height", "100lvh"),
          safeAreaInsets: CSS.supports(
            "padding",
            "env(safe-area-inset-bottom)",
          ),
          viewportFit: CSS.supports("viewport-fit", "cover"),
        },

        // Network
        connection: connection
          ? {
              type: connection.type,
              effectiveType: connection.effectiveType,
              downlink: connection.downlink,
              rtt: connection.rtt,
              saveData: connection.saveData,
            }
          : null,

        // Storage
        localStorage: {
          available: !!window.localStorage,
          userExists: !!localStorage.getItem("user"),
          itemCount: Object.keys(localStorage).length,
        },

        // Permissions
        permissions: {
          notifications: Notification.permission,
        },

        // Environment
        environment: {
          protocol: window.location.protocol,
          host: window.location.host,
          pathname: window.location.pathname,
          apiBaseUrl: getBaseUrl(),
        },

        // API Connectivity
        apiConnectivity: {
          baseUrl: getBaseUrl(),
          canReachLocalhost: window.location.hostname === "localhost",
          currentHostname: window.location.hostname,
          isLocalNetwork:
            /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(
              window.location.hostname,
            ),
        },

        timestamp: new Date().toISOString(),
      };

      setDebugInfo(info);
      return info;
    };

    collectDebugInfo();

    // Update on resize
    const handleResize = () => {
      setTimeout(collectDebugInfo, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Multi-tap activation (5 taps within 2 seconds)
  const handleHeaderTap = () => {
    const now = Date.now();

    if (now - lastTapTime > 2000) {
      setTapCount(1);
    } else {
      setTapCount((prev) => prev + 1);
    }

    setLastTapTime(now);

    if (tapCount >= 4) {
      // 5th tap
      setIsVisible(true);
      setTapCount(0);
    }
  };

  if (!debugInfo) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getPotentialIssues = () => {
    const issues: string[] = [];

    if (debugInfo.browsers.isIOS && !debugInfo.cssSupport.dvh) {
      issues.push("iOS viewport height issues (no dvh support)");
    }

    if (debugInfo.browsers.isSafari && debugInfo.viewport.height < 500) {
      issues.push("Safari address bar may be affecting viewport");
    }

    if (!debugInfo.localStorage.available) {
      issues.push("LocalStorage not available");
    }

    if (!debugInfo.localStorage.userExists) {
      issues.push("User data not found in localStorage");
    }

    if (debugInfo.viewport.devicePixelRatio > 3) {
      issues.push("Very high pixel density may affect rendering");
    }

    if (
      debugInfo.connection?.effectiveType === "slow-2g" ||
      debugInfo.connection?.effectiveType === "2g"
    ) {
      issues.push("Very slow network connection");
    }

    if (
      debugInfo.browsers.isMobile &&
      debugInfo.apiConnectivity?.baseUrl?.includes("localhost")
    ) {
      issues.push(
        "API URL uses localhost - mobile devices cannot connect to localhost",
      );
    }

    if (
      debugInfo.browsers.isMobile &&
      !debugInfo.apiConnectivity?.isLocalNetwork &&
      debugInfo.apiConnectivity?.baseUrl?.includes("192.168")
    ) {
      issues.push(
        "API URL uses local network IP - ensure mobile device is on same network",
      );
    }

    return issues;
  };

  return (
    <>
      {/* Tap-to-activate header */}
      <div
        onClick={handleHeaderTap}
        className={`fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-1 text-xs lg:hidden ${className}`}
      >
        {tapCount > 0
          ? `Tap ${5 - tapCount} more times for debug info`
          : "Tap 5 times for debug info"}
      </div>

      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg max-w-2xl mx-auto max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">
                  Mobile Debug Information
                </h2>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Potential Issues */}
              {getPotentialIssues().length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium text-yellow-800">
                      Potential Issues
                    </h3>
                  </div>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {getPotentialIssues().map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Debug Information */}
              <div className="space-y-3">
                {Object.entries(debugInfo).map(([category, data]) => (
                  <details
                    key={category}
                    className="border border-gray-200 rounded"
                  >
                    <summary className="p-2 bg-gray-50 cursor-pointer font-medium capitalize">
                      {category.replace(/([A-Z])/g, " $1")}
                    </summary>
                    <div className="p-2 text-sm">
                      {typeof data === "object" && data !== null ? (
                        <div className="space-y-1">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span className="text-gray-600 ml-2 text-right flex-1">
                                {formatValue(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>{formatValue(data)}</span>
                      )}
                    </div>
                  </details>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      JSON.stringify(debugInfo, null, 2),
                    );
                    alert("Debug info copied to clipboard");
                  }}
                  className="btn-primary flex-1"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
