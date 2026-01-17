import { toast, type ExternalToast } from 'sonner';

/**
 * PROMPT 28: Toast Notifications
 * Centralized toast utility functions with consistent styling
 *
 * OPTIMIZATION: Following React best practices
 * - Consistent error handling across app
 * - Type-safe toast functions
 * - Reusable patterns for common scenarios
 */

/**
 * Success toast with primary color scheme
 */
export function showSuccess(message: string, options?: ExternalToast) {
  return toast.success(message, {
    ...options,
    duration: options?.duration ?? 3000,
  });
}

/**
 * Error toast with destructive color scheme
 */
export function showError(message: string, options?: ExternalToast) {
  return toast.error(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Warning toast with orange color scheme
 */
export function showWarning(message: string, options?: ExternalToast) {
  return toast.warning(message, {
    ...options,
    duration: options?.duration ?? 4000,
  });
}

/**
 * Info toast with blue color scheme
 */
export function showInfo(message: string, options?: ExternalToast) {
  return toast.info(message, {
    ...options,
    duration: options?.duration ?? 3000,
  });
}

/**
 * Loading toast - returns ID for dismissal
 */
export function showLoading(message: string, options?: ExternalToast) {
  return toast.loading(message, options);
}

/**
 * Promise toast - automatically shows loading, success, or error
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: ExternalToast
) {
  return toast.promise(promise, messages);
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(id: string | number) {
  return toast.dismiss(id);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  return toast.dismiss();
}

// =============================================================================
// Pre-configured toasts for common CalRouter actions
// =============================================================================

/**
 * Endpoint Management Toasts
 */
export const endpointToasts = {
  created: () => showSuccess('Endpoint created successfully!'),
  updated: () => showSuccess('Endpoint updated'),
  deleted: () => showSuccess('Endpoint deleted'),
  activated: () => showSuccess('Endpoint activated'),
  deactivated: () => showWarning('Endpoint deactivated'),
  testSent: () => showInfo('Test webhook sent'),
  createFailed: (error?: string) =>
    showError(error || 'Failed to create endpoint. Please try again.'),
  updateFailed: (error?: string) =>
    showError(error || 'Failed to update endpoint. Please try again.'),
  deleteFailed: (error?: string) =>
    showError(error || 'Failed to delete endpoint. Please try again.'),
};

/**
 * Clipboard Toasts
 */
export const clipboardToasts = {
  copied: (label = 'Content') => showSuccess(`${label} copied to clipboard!`),
  copyFailed: () => showError('Failed to copy to clipboard'),
};

/**
 * API Error Toasts
 */
export const apiToasts = {
  networkError: () =>
    showError('Network error. Please check your connection and try again.'),
  unauthorized: () =>
    showError('Session expired. Please log in again.'),
  forbidden: () =>
    showError('You do not have permission to perform this action.'),
  notFound: (resource = 'Resource') =>
    showError(`${resource} not found.`),
  serverError: () =>
    showError('Server error. Please try again later.'),
  validationError: (message?: string) =>
    showError(message || 'Please check your input and try again.'),
  rateLimited: () =>
    showWarning('Too many requests. Please wait a moment and try again.'),
};

/**
 * Form Toasts
 */
export const formToasts = {
  saved: () => showSuccess('Changes saved successfully'),
  saveFailed: (error?: string) =>
    showError(error || 'Failed to save changes. Please try again.'),
  validationFailed: () =>
    showError('Please fix the errors before submitting.'),
};

/**
 * Webhook Log Toasts
 */
export const webhookToasts = {
  retried: () => showInfo('Webhook retry initiated'),
  retryFailed: () => showError('Failed to retry webhook'),
  exported: () => showSuccess('Logs exported successfully'),
  exportFailed: () => showError('Failed to export logs'),
};

/**
 * Subscription Toasts
 */
export const subscriptionToasts = {
  upgraded: () => showSuccess('Welcome to CalRouter Pro! 🎉', { duration: 5000 }),
  canceled: () => showWarning('Subscription canceled'),
  trialExpiring: (daysLeft: number) =>
    showWarning(`Your trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`),
  trialExpired: () =>
    showError('Your trial has expired. Upgrade to continue.'),
  paymentFailed: () =>
    showError('Payment failed. Please update your payment method.'),
};

/**
 * Settings Toasts
 */
export const settingsToasts = {
  saved: () => showSuccess('Settings saved'),
  saveFailed: () => showError('Failed to save settings'),
  resetToDefaults: () => showInfo('Settings reset to defaults'),
};

// =============================================================================
// Advanced Toast Patterns
// =============================================================================

/**
 * Toast with custom action button
 */
export function showToastWithAction(
  message: string,
  actionLabel: string,
  actionCallback: () => void,
  options?: ExternalToast
) {
  return toast.success(message, {
    ...options,
    action: {
      label: actionLabel,
      onClick: actionCallback,
    },
  });
}

/**
 * Toast with undo functionality
 */
export function showUndoableToast(
  message: string,
  undoCallback: () => void,
  options?: ExternalToast
) {
  return showToastWithAction(message, 'Undo', undoCallback, options);
}

/**
 * API request toast with promise handling
 * OPTIMIZATION: Provides consistent UX for async operations
 */
export async function toastApiRequest<T>(
  request: () => Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((error: Error) => string);
  }
): Promise<T> {
  const result = await showPromise(
    request(),
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error || ((error: Error) =>
        `Error: ${error.message || 'Something went wrong'}`
      ),
    }
  );
  return result as T;
}

/**
 * Example usage:
 *
 * // Simple success
 * showSuccess('Operation completed');
 *
 * // Pre-configured endpoint toast
 * endpointToasts.created();
 *
 * // Clipboard copy
 * clipboardToasts.copied('Webhook URL');
 *
 * // API request with promise handling
 * await toastApiRequest(
 *   () => fetch('/api/endpoints').then(r => r.json()),
 *   {
 *     loading: 'Loading endpoints...',
 *     success: 'Endpoints loaded',
 *     error: 'Failed to load endpoints'
 *   }
 * );
 *
 * // Toast with undo action
 * showUndoableToast('Endpoint deleted', () => restoreEndpoint());
 */
