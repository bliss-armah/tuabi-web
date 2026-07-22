import React from "react";
import { cn } from "@/shared/utils/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large" | "primary-small";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  responsiveText?: {
    mobile?: string;
    desktop: string;
  };
  responsiveIcon?: {
    mobile?: React.ReactNode;
    desktop: React.ReactNode;
  };
  iconOnly?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = "left",
      responsiveText,
      responsiveIcon,
      iconOnly = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base button styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:shrink-0";

    // Variant styles (token-based to match the design system)
    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      danger:
        "bg-destructive text-white hover:bg-destructive/90 shadow-sm focus-visible:ring-destructive",
      success:
        "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
    };

    // Size styles
    const sizeStyles = {
      small: "text-xs py-1 px-3 rounded-md",
      medium: "py-2 px-2 rounded-md",
      large: "text-lg px-8 py-4 rounded-md",
      "primary-small": "p-2 md:py-2 md:px-2 rounded-full md:rounded-md",
    };

    // Icon-only size adjustments - compact padding around icon
    const iconOnlySizeStyles = {
      small: "p-1.5 w-auto",
      medium: "p-2 w-auto",
      large: "p-3 w-auto",
      "primary-small": "p-2 w-auto",
    };

    // Responsive icon-only styles - compact on mobile, normal on desktop when text is shown
    const responsiveIconOnlySizeStyles = {
      small: "p-1.5 md:py-1 md:px-3 w-auto",
      medium: "p-2 md:py-2 md:px-2 w-auto",
      large: "p-3 md:px-8 md:py-4 w-auto",
      "primary-small": "p-2 md:py-2 md:px-2 w-auto",
    };

    // Width styles - don't apply full width if iconOnly (unless responsiveText on desktop)
    const widthStyles = fullWidth && !iconOnly ? "w-full" : "";

    // Icon spacing
    const iconSpacing = icon && !iconOnly ? "space-x-2" : "";

    // Determine which icon to use
    const getIcon = () => {
      if (responsiveIcon) {
        return {
          mobile: responsiveIcon.mobile || responsiveIcon.desktop,
          desktop: responsiveIcon.desktop,
        };
      }
      return {
        mobile: icon,
        desktop: icon,
      };
    };

    const currentIcon = getIcon();

    // Responsive text handling
    const renderContent = () => {
      // If iconOnly AND responsiveText is provided, show text on desktop only
      if (iconOnly && responsiveText) {
        return (
          <span className="hidden md:inline">{responsiveText.desktop}</span>
        );
      }

      // If iconOnly without responsiveText, no text at all
      if (iconOnly) {
        return null;
      }

      if (responsiveText) {
        return (
          <>
            {responsiveText.mobile && (
              <span className="md:hidden">{responsiveText.mobile}</span>
            )}
            <span className="hidden md:block">{responsiveText.desktop}</span>
          </>
        );
      }
      return children;
    };

    // Icon rendering
    const renderIcon = () => {
      if (!icon && !responsiveIcon) return null;

      return (
        <span className="flex items-center">
          {/* Mobile icon */}
          {currentIcon.mobile && (
            <span className="md:hidden">{currentIcon.mobile}</span>
          )}
          {/* Desktop icon */}
          {currentIcon.desktop && (
            <span className="hidden md:block">{currentIcon.desktop}</span>
          )}
        </span>
      );
    };

    // Loading spinner
    const renderLoadingSpinner = () => {
      if (!loading) return null;

      return (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
      );
    };

    // Content arrangement
    const renderButtonContent = () => {
      const content = renderContent();
      const iconElement = renderIcon();
      const loadingElement = renderLoadingSpinner();

      if (loading) {
        return (
          <div className="flex items-center justify-center">
            {loadingElement}
            {content}
          </div>
        );
      }

      // If iconOnly with responsiveText, show icon only on mobile, icon+text on desktop
      if (iconOnly && responsiveText) {
        return (
          <div className="flex items-center space-x-2">
            {iconElement}
            {content}
          </div>
        );
      }

      // If iconOnly without responsiveText, show icon only
      if (iconOnly) {
        return iconElement;
      }

      if (!icon && !responsiveIcon) {
        return content;
      }

      if (iconPosition === "left") {
        return (
          <div className={`flex items-center ${iconSpacing}`}>
            {iconElement}
            {content}
          </div>
        );
      } else {
        return (
          <div className={`flex items-center ${iconSpacing}`}>
            {content}
            {iconElement}
          </div>
        );
      }
    };

    // Determine appropriate size styles
    const getSizeStyles = () => {
      if (iconOnly && responsiveText) {
        return responsiveIconOnlySizeStyles[size];
      }
      if (iconOnly) {
        return iconOnlySizeStyles[size];
      }
      return sizeStyles[size];
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          getSizeStyles(),
          widthStyles,
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {renderButtonContent()}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
