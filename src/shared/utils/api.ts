import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "@/config/api";

// Get base URL from configuration
const baseUrl = getBaseUrl();


export const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {

    // Add standard headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    const authToken = localStorage.getItem("authToken");                                                                                                          
    if (authToken) {                                                                                                                                              
      headers.set("Authorization", `Bearer ${authToken}`);                                                                                                        
    }     

    // Add ngrok bypass header if using ngrok
    if (baseUrl.includes("ngrok")) {
      headers.set("ngrok-skip-browser-warning", "true");
    }

    return headers;
  },
  fetchFn: (input, init) => {
    return fetch(input, {
      ...init,
      mode: "cors",
      credentials: "include",
    });
  },
});

// Enhanced base query with error handling
export const baseQueryWithErrorHandling = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  try {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorDetails = {
        status: result.error.status,
        data: result.error.data,
        args,
        timestamp: new Date().toISOString(),
        path: args.url,
      };
      console.error("API Error:", errorDetails);

      // Handle CORS errors specifically
      if (result.error.status === 0 || result.error.status === "FETCH_ERROR") {
        console.error(
          "CORS Error detected. Please check your backend CORS configuration."
        );
        return {
          error: {
            status: "CORS_ERROR",
            data: {
              message:
                "CORS Error: Unable to connect to the server. Please check your internet connection or try again later.",
            },
          },
        };
      }

      // Handle 401 errors (authentication expired)
      if (result.error.status === 401) {
        const url = args.url || "";

        if (!shouldSkipAutoLogout(url)) {
          // Clear stored user data (HTTP-only cookie is cleared by server)
          localStorage.removeItem("user");

          // Redirect to login
          window.location.href = "/login";

          return {
            error: {
              status: 401,
              data: { message: "Session expired. Please login again." },
            },
          };
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Network or CORS Error:", error);
    return {
      error: {
        status: "NETWORK_ERROR",
        data: {
          message:
            "Network Error: Unable to connect to the server. Please check your internet connection or try again later.",
        },
      },
    };
  }
};

const shouldSkipAutoLogout = (url: string): boolean => {
  if (url === "/" || url === "") return true;

  // Endpoints that should NOT trigger automatic logout on 401
  const excludedPaths = [
    "/auth",
    "/register",
    "/password",
    "/reset",
    "/refresh",
    "/sse",        // SSE endpoints
    "/events",     // Alternative SSE endpoint naming
  ];

  return excludedPaths.some(
    (path) =>
      url === path || url.startsWith(path + "/") || url.startsWith(path + "?")
  );
};
