# Project Structure

This project follows a modular architecture with a shared folder for common components and utilities, and individual modules at the root level.

## Folder Structure

```
src/
├── shared/                    # Shared/common code
│   ├── components/           # Reusable UI components
│   │   ├── Layout.tsx       # Main layout component
│   │   └── DataTable.tsx    # Reusable data table
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useSubscription.ts # Subscription hook
│   ├── utils/               # Utility functions
│   │   ├── api.ts           # API configuration
│   │   └── errorHandler.ts  # Error handling utilities
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts          # Authentication types
│   │   └── debtor.ts        # Debtor types
│   ├── services/            # External services
│   │   └── websocketService.ts # WebSocket service
│   ├── store/               # Redux store configuration
│   │   └── index.ts         # Store setup
│   └── guards/              # Route protection components
│       └── ProtectedRoute.tsx # Protected route wrapper
├── auth/                     # Authentication module
│   ├── Login.tsx            # Login page
│   ├── Register.tsx         # Registration page
│   ├── OTPVerification.tsx  # OTP verification
│   ├── ForgotPassword.tsx   # Password reset
│   ├── ResetPassword.tsx    # Password reset confirmation
│   └── authApi.ts           # Auth API calls
├── dashboard/                # Dashboard module
│   └── Dashboard.tsx        # Main dashboard page
├── debtors/                  # Debtors management module
│   ├── Debtors.tsx          # Debtors list page
│   ├── DebtorDetail.tsx     # Individual debtor view
│   ├── DebtorModal.tsx      # Add/edit debtor modal
│   ├── PaymentModal.tsx     # Payment processing modal
│   └── debtorApi.ts         # Debtors API calls
├── profile/                  # User profile module
│   ├── Profile.tsx          # Profile page
│   ├── AccountSettings.tsx  # Account settings
│   ├── ChangePassword.tsx   # Password change
│   ├── PrivacySecurity.tsx  # Privacy settings
│   └── HelpSupport.tsx      # Help and support
├── subscription/             # Subscription management module
│   ├── Plans.tsx            # Subscription plans page with package selection
│   ├── SubscriptionStatus.tsx # Reusable subscription status component
│   ├── SubscriptionLockScreen.tsx # Lock screen for expired subscriptions
│   └── subscriptionApi.ts   # Subscription API calls
├── reminders/                # Reminders module
│   └── remindersApi.ts      # Reminders API
├── ai/                      # AI module
│   └── aiApi.ts             # AI API calls
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

## Architecture Principles

1. **Modular Organization**: Each module is self-contained with its own components, pages, and API calls
2. **Shared Resources**: Common components, hooks, utilities, and types are placed in the `shared/` folder
3. **Clear Separation**: Modules don't directly import from other modules, only from shared
4. **Scalability**: Easy to add new modules without affecting existing ones
5. **Maintainability**: Related code is grouped together, making it easier to find and modify

## Key Features

### Subscription Management

- **Plans Page**: Interactive subscription plans display with package selection
- **Payment Integration**: Paystack payment gateway integration
- **Real-time Updates**: WebSocket integration for subscription status updates
- **Status Component**: Reusable subscription status display throughout the app
- **Lock Screen**: Automatic lock screen for expired subscriptions

### Authentication

- **OTP Verification**: Phone number-based authentication with OTP
- **Password Management**: Secure password reset and change functionality
- **Session Management**: Automatic token handling and user state management

### Debtor Management

- **CRUD Operations**: Full create, read, update, delete functionality
- **Payment Tracking**: Track debt payments and history
- **Real-time Updates**: Live updates via WebSocket

## Import Guidelines

- **Within a module**: Use relative imports (e.g., `./component`, `../utils`)
- **From shared**: Use absolute imports with `@/shared/` prefix (e.g., `@/shared/components/Layout`)
- **Between modules**: Avoid direct imports; use shared folder for common functionality

## Adding New Modules

1. Create a new folder at the root level of `src/`
2. Include module-specific components, pages, and API calls
3. Place reusable components in `shared/components/`
4. Update the main App.tsx routing if needed
5. Follow the existing naming conventions and structure

## Development Workflow

1. **Feature Development**: Work within the appropriate module folder
2. **Shared Components**: Add reusable components to `shared/components/`
3. **API Integration**: Use the existing API structure and error handling
4. **Testing**: Ensure the project builds successfully with `npm run build`
5. **Documentation**: Update this README when adding new features
