/**
 * Role validation utilities for the AgriSmart application
 * This centralizes the role-based access logic to prevent redirect loops
 */
import { redirect } from "next/navigation";
import { CustomSession } from "./auth";
import type { Locale } from "~/config/i18n-config";

/**
 * Validates if the current user has access to a role-specific page
 * and handles redirection if not authenticated or lacks permission
 * 
 * @param session Current user session
 * @param requiredRole Role required to access the page
 * @param lang Current locale
 * @param options Additional options
 */
export function validateRoleAccess(
  session: CustomSession | null, 
  requiredRole: string,
  lang: Locale,
  options: {
    redirectTo?: string,
    allowMultipleRoles?: boolean,
    additionalRoles?: string[],
  } = {}
): void {
  const {
    redirectTo = `/${lang}/login`,
    allowMultipleRoles = false,
    additionalRoles = [],
  } = options;
  
  // If no session or user, redirect to login
  if (!session?.user) {
    redirect(redirectTo);
    return;
  }
  
  const userRole = session.user.role;
  
  // If multi-role access is allowed, check if user has any of the roles
  if (allowMultipleRoles && additionalRoles.length > 0) {
    if (userRole !== requiredRole && !additionalRoles.includes(userRole)) {
      // User doesn't have any of the allowed roles, redirect to homepage instead of dashboard
      redirect(`/${lang}`);
      return;
    }
  } else {
    // Simple role check
    if (userRole !== requiredRole) {
      // Redirect to the homepage instead of dashboard to avoid redirect loops
      redirect(`/${lang}`);
      return;
    }
  }
  
  // If we get here, the user has the required role
  return;
}

/**
 * Redirects a user to their role-specific dashboard
 * Used to avoid redirect loops by centralizing redirection logic
 * 
 * @param session Current user session
 * @param lang Current locale
 */
export function redirectToRoleDashboard(
  session: CustomSession | null,
  lang: Locale
): void {
  if (!session?.user) {
    redirect(`/${lang}/login`);
    return;
  }
  
  const userRole = session.user.role;
  
  // Use a try-catch to handle any redirection errors
  try {
    switch (userRole) {
      case "BUYER":
        redirect(`/${lang}/dashboard/buyer`);
      case "SELLER":
        redirect(`/${lang}/dashboard/seller`);
      case "MODERATOR":
        redirect(`/${lang}/dashboard/moderator`);
      case "ADMIN":
        redirect(`/${lang}/dashboard/admin`);
      default:
        // If role is not recognized, redirect to the homepage instead
        redirect(`/${lang}`);
    }
  } catch (error) {
    // If there's any error in redirection, go to homepage
    redirect(`/${lang}`);
  }
}
