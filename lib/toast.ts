import { toast } from "sonner"

/**
 * Toast notification utility functions for consistent messaging
 */

export const showToast = {
  /**
   * Print-related success messages
   */
  printSuccess: (message?: string) => {
    toast.success(message || "Print dialog opened successfully")
  },

  /**
   * Print-related error messages
   */
  printError: {
    browserNotSupported: () => {
      toast.error("Print Not Supported", {
        description: "Your browser doesn't support printing. Please use Chrome, Firefox, or Edge."
      })
    },

    imageNotLoaded: () => {
      toast.error("Print Failed", {
        description: "Image not loaded completely. Please wait and try again."
      })
    },

    imageProcessingFailed: () => {
      toast.error("Print Failed", {
        description: "Image processing failed. Please try again."
      })
    },

    printingFailed: (errorMessage?: string) => {
      toast.error("Print Failed", {
        description: errorMessage || "Failed to open print dialog. Please check your browser settings and printer connection."
      })
    },

    printerConnection: () => {
      toast.error("Print Failed", {
        description: "Please ensure:\n• Your printer is connected and powered on\n• Browser allows popups and printing\n• You're using a modern browser"
      })
    },

    timeout: () => {
      toast.warning("Print Timeout", {
        description: "Print operation timed out. Please check your printer connection and try again."
      })
    },

    generic: () => {
      toast.error("Print Failed", {
        description: "Something went wrong while printing. Please try again."
      })
    }
  },

  /**
   * General warning messages
   */
  warning: (title: string, description?: string) => {
    toast.warning(title, description ? { description } : undefined)
  },

  /**
   * General error messages
   */
  error: (title: string, description?: string) => {
    toast.error(title, description ? { description } : undefined)
  },

  /**
   * General success messages
   */
  success: (title: string, description?: string) => {
    toast.success(title, description ? { description } : undefined)
  },

  /**
   * General info messages
   */
  info: (title: string, description?: string) => {
    toast.info(title, description ? { description } : undefined)
  },

  /**
   * Login required messages - simple and direct
   */
  loginRequired: {
    favorite: (onLoginClick?: () => void) => {
      toast.info("🔒 Please login to save favorites", {
        description: "Redirecting to login page...",
        duration: 1000
      })
      
      // Direct navigation without confirmation
      setTimeout(() => {
        if (onLoginClick) {
          onLoginClick()
        }
      }, 800) // Brief delay to show the toast message
    },
    
    general: (message: string, onLoginClick?: () => void) => {
      toast.info("🔒 Login Required", {
        description: "Redirecting to login page...",
        duration: 1000
      })
      
      setTimeout(() => {
        if (onLoginClick) {
          onLoginClick()
        }
      }, 800)
    }
  }
}

/**
 * Helper function to show browser compatibility warnings for printing
 */
export const showPrintCompatibilityWarning = (warnings: string[]) => {
  if (warnings.length > 0) {
    const warningMessage = warnings.join(". ")
    toast.warning("Print Compatibility Notice", {
      description: warningMessage,
      duration: 5000 // Show for 5 seconds
    })
  }
}