import { useEffect, useState } from "react";
import type { User } from "@/shared/types/auth";
import { sseService } from "@/shared/services/sseService";
import { useGetUserSubscriptionStatusQuery } from "@/subscription/subscriptionApi";
import { useGetUserProfileQuery } from "@/auth/authApi";
import { getBaseUrl } from "@/config/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get subscription status to sync with user data - but only after initial setup
  const { data: subscriptionResponse, refetch: refetchSubscription } =
    useGetUserSubscriptionStatusQuery(undefined, {
      skip: !user?.id || !isInitialized,
    });

  // Fetch full profile (role + workspace + workspace role) once logged in
  const { data: profileResponse } = useGetUserProfileQuery(undefined, {
    skip: !user?.id || !isInitialized,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const userString = localStorage.getItem("user");

        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        }

        // No more token handling - cookies are automatic!
      } catch (err) {
        console.error("Failed to load auth data:", err);
      } finally {
        setLoading(false);
        // Small delay before marking as initialized to ensure any login cookies are set
        setTimeout(() => {
          setIsInitialized(true);
        }, 300);
      }
    };

    loadAuthData();
  }, []);

  useEffect(() => {
    if (subscriptionResponse?.data && user) {
      const subscriptionData = subscriptionResponse.data;

      const updatedUser: User = {
        ...user,
        subscriptionExpiresAt:
          subscriptionData.subscriptionExpiresAt || undefined,
        isSubscribed: subscriptionData.isSubscribed || false,
      };

      if (
        user.subscriptionExpiresAt !== updatedUser.subscriptionExpiresAt ||
        user.isSubscribed !== updatedUser.isSubscribed
      ) {

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
  }, [subscriptionResponse?.data, user]);

  // Merge role / workspace details from the profile into the user
  useEffect(() => {
    if (profileResponse?.data && user) {
      const p = profileResponse.data;
      const changed =
        user.role !== p.role ||
        user.workspaceRole !== (p.workspaceRole ?? null) ||
        user.status !== p.status ||
        user.workspace?.id !== (p.workspace?.id ?? undefined) ||
        user.workspace?.name !== (p.workspace?.name ?? undefined) ||
        user.workspace?.billingExempt !== (p.workspace?.billingExempt ?? undefined);

      if (changed) {
        const updatedUser: User = {
          ...user,
          role: p.role,
          status: p.status,
          workspace: p.workspace ?? null,
          workspaceRole: p.workspaceRole ?? null,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
  }, [profileResponse?.data, user]);

  useEffect(() => {
    const initializeServices = async () => {
      if (user?.id) {

        await new Promise(resolve => setTimeout(resolve, 200));

        try {
          await sseService.connect(user.id);
        } catch (error) {
          console.error("❌ Error initializing services:", error);
        }
      } else {
        sseService.disconnect();
      }
    };

    initializeServices();

    return () => {
      sseService.disconnect();
    };
  }, [user?.id]);

  const logout = async () => {
    try {
      sseService.disconnect();

      try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (logoutError) {
        console.error("Logout API call failed:", logoutError);
      }

      localStorage.removeItem("user");
      localStorage.removeItem("authToken");     
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  const updateUser = async (updatedUserData: User) => {
    try {
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const refreshUserData = async () => {
    try {
      await refetchSubscription();
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const isSubscriptionActive = () => {
    if (!user?.subscriptionExpiresAt) return false;
    return new Date(user.subscriptionExpiresAt) > new Date();
  };

  const role = user?.role;

  return {
    user,
    logout,
    loading,
    updateUser,
    refreshUserData,
    isSubscriptionActive,
    role,
    isSuperAdmin: role === "SUPER_ADMIN",
    isOwner: role === "ADMIN" || user?.workspaceRole === "OWNER",
    isKeeper: role === "USER" && user?.workspaceRole === "KEEPER",
    workspace: user?.workspace ?? null,
  };
};
