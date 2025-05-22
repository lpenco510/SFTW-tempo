# Summary of Authentication Debugging & Pivot to Manual Lead Approval

## 1. Introduction

This document summarizes the extensive debugging efforts undertaken to resolve login issues, particularly for the admin user, in the IT CARGO platform. It also outlines the strategic pivot towards a manual lead approval process for the Minimum Viable Product (MVP) due to persistent complexities with the in-app admin UI login.

## 2. Initial Problem Statement

The primary issue was the inability for the designated admin user (UID `50630272-4062-431a-81ba-4a9be240cff2`) to consistently log in and access the application. Symptoms included:
*   Being redirected back to the login page after a brief glimpse of the dashboard.
*   Infinite loading screens upon login attempts.
*   Inconsistent behavior between first login attempts after a hard refresh and subsequent re-login attempts.

Viewer/regular user login attempts also exhibited issues, often related to missing `companyId` or similar state inconsistencies.

## 3. Key Files Involved in Authentication Flow

*   `src/hooks/useAuth.tsx`: Core authentication context provider, responsible for managing user state, session, and providing auth functions (`signIn`, `signOut`, `getCurrentUser`). This was the most frequently modified file.
*   `src/hooks/useCompanySettings.tsx`: Hook to fetch and manage company-specific settings, dependent on the authenticated user's `companyId`.
*   `src/App.tsx`: Contains `ProtectedRoute` and `RedirectBasedOnAuth` components that gate access to routes based on authentication status.
*   `src/lib/supabase.ts`: Supabase client initialization.
*   `supabase/functions/itc-user-registration-request/index.ts`: Edge Function for handling new user registration submissions.
*   Database Tables:
    *   `auth.users`: Stores Supabase authenticated users, including `app_metadata`.
    *   `public.profiles`: Stores application-specific user profile data, including `role` and `company_id`.
    *   `public.companies`: Stores company details.
    *   `public.user_companies`: Links users to companies.
    *   `public.admin_approval_queue`: Stores incoming registration requests for admin review.

## 4. Summary of Debugging Iterations & Findings

The debugging process involved multiple iterations of adding detailed logging to the frontend components and analyzing the console output.

### Iteration Highlights:

1.  **Admin Identification (`is_itc_admin`):**
    *   **Issue:** `user.app_metadata` was initially not being populated in the `User` object within `useAuth.tsx`.
    *   **Fix:** Modified `User` type and `getCurrentUser` to correctly fetch and include `session.user.app_metadata`.
    *   **Result:** `is_itc_admin: true` (from `app_metadata`) became correctly available, allowing `ProtectedRoute` to identify admins.

2.  **Admin `companyId` Handling:**
    *   **Issue:** `useCompanySettings` threw an error if `user.companyId` was null, which is the case for the admin user (who isn't tied to a specific client company).
    *   **Fix:** Modified `useCompanySettings` to detect admin users (via `app_metadata.is_itc_admin`) and provide default/empty settings if their `companyId` was null, thus preventing the error.

3.  **Profile Fetching (`public.profiles`):**
    *   **Issue:** An error "column profiles.nombre_empresa does not exist" occurred because `getCurrentUser` was incorrectly trying to select company-specific fields from the `profiles` table.
    *   **Fix:** Corrected `getCurrentUser` to select only profile-specific fields from `profiles` and then, if `profiles.company_id` exists, fetch company details (`nombre_empresa`, `tax_id`) from the `companies` table.
    *   **Result:** Profile fetching became accurate.

4.  **Persistent Login Loop / Infinite Loading:**
    *   **Symptoms:**
        *   Successful first login after hard refresh (dashboard partially loads, but sidebar often stuck).
        *   Reloading the page after a successful login often led to a timeout in `ProtectedRoute` and redirection to login.
        *   Subsequent login attempts (after a logout or the timeout redirect) would often hang indefinitely, with `getCurrentUser` being called but not completing the profile fetch.
    *   **Hypothesized Causes & Fixes Attempted:**
        *   **Stale React State/Context Propagation:** Refactored `AuthProvider` in `useAuth.tsx` multiple times to improve how user and session states were set and consumed, especially in relation to `onAuthStateChange` events. This involved introducing `initialLoadComplete` state, passing session objects directly to `getCurrentUser`, and adjusting `useEffect` dependencies.
        *   **`useEffect` Loop:** Removed `user` from the main `useEffect` dependency array in `AuthProvider` to prevent re-triggering `getCurrentUser` unnecessarily. Added `isMounted` checks.
        *   **`userCache` in `getCurrentUser`:** Temporarily removed to simplify logic.
    *   **Current Status (before pivot):** The first login became consistently successful in populating the `AuthProvider`'s user state. However, the re-login hang and the sidebar loading issue on first login persisted, indicating deeper complexities or remaining subtle timing issues.

5.  **Database Schema Cleanups:**
    *   **Redundant Columns:**
        *   Identified and removed `public.profiles.is_admin` (boolean) as it was redundant with `app_metadata.is_itc_admin` and `profiles.role`.
        *   User ran SQL scripts to consolidate duplicate `name`/`nombre_empresa` and `tax_id`/`rut` columns in `public.companies`. Frontend code in `useAuth.tsx` and `useCompanySettings.tsx` was updated to use the canonical names (`nombre_empresa`, `tax_id`).
    *   **RLS Policies:** Applied RLS policies to `public.admin_approval_queue` to restrict access to users with the `is_itc_admin` flag.

## 5. Rationale for Pivoting to Manual Lead Approval

Despite progress, the intermittent but persistent failure of re-login attempts and the additional sidebar loading issue on the first successful login make the in-app admin UI unreliable for an MVP. The debugging of these stateful React context interactions is proving too time-consuming for the current project phase.

A manual approval process offers:
*   **Robustness:** Less prone to frontend state/timing issues.
*   **Speed to MVP:** Allows core user registration and onboarding to proceed without being blocked by complex UI debugging.
*   **Control:** Direct admin oversight of new user activation.

## 6. Current State of Key Supabase Tables (Conceptual for Pivot)

*   **`auth.users`:**
    *   New users created by Edge Function will have `app_metadata: {"itc_status": "PENDING_REVIEW", "submitted_details": {...}}`.
    *   Admin user (UID `50630272-4062-431a-81ba-4a9be240cff2`) has `app_metadata: {"is_itc_admin": true, "provider":"email","providers":["email"], "itc_status": "ACTIVE"}` (Admin needs `itc_status: "ACTIVE"` to log in with new logic).
*   **`public.profiles`:**
    *   Admin user has a record with `id` (matching auth UID), `role: "admin"`, `company_id: null`.
    *   New users will have records created/updated manually by the admin upon approval, linking to a `company_id`.
*   **`public.companies`:**
    *   Contains company details. Uses `nombre_empresa` and `tax_id` as canonical.
*   **`public.admin_approval_queue`:**
    *   Populated by the Edge Function. Contains `user_id`, `email_submitted`, `company_name_submitted`, `cuit_submitted`, `status: "PENDING_ITC_REVIEW"`.
    *   RLS policies restrict access to users with `app_metadata.is_itc_admin: true`.
*   **`public.user_companies`:** Links users to companies, manually populated by admin for approved users.

## 7. Information for New Model/Chat Context

To successfully implement the pivot to manual approval, the new model/chat will need:
1.  This summary document.
2.  The "Manual Lead Approval Process" document (to be generated next).
3.  The latest (most functional) version of `src/hooks/useAuth.tsx`.
4.  The current version of `supabase/functions/itc-user-registration-request/index.ts`.
5.  Clear instructions to:
    *   Modify the Edge Function to set `app_metadata.itc_status = "PENDING_REVIEW"`.
    *   Modify `useAuth.tsx` (specifically `getCurrentUser`) to check `app_metadata.itc_status` and only return a full user object if the status is "ACTIVE". Users with other statuses should effectively be blocked from logging in.

This detailed context should enable a focused implementation of the manual approval workflow. 