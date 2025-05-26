// Re-export commonly used functions from react-email
export { render } from "@react-email/components";

// Export constants from utils package (treeshakable import)
export { META } from "@captable/utils/constants";

// Export all email templates and their types (DRY approach)
export * from "./templates";
