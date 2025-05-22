# Phase 3: MVP Implementation - Manual Approval & Core Functionality (Revised)

This document outlines the detailed plan for implementing Phase 3, focusing on the Minimum Viable Product (MVP) with a **manual lead approval process** and core "Basic Plan" features. This revision reflects the strategic pivot away from an in-app admin approval UI for the MVP.

## Core Objectives for Phase 3 MVP (Manual Approval Focus):

1.  **Functional User Registration & Manual Approval Workflow**:
    *   `RegistrationForm.tsx` fully operational, submitting data to the Edge Function.
    *   `itc-user-registration-request` Edge Function:
        *   Correctly creates `auth.users` entry with `app_metadata: {"itc_status": "PENDING_REVIEW", "submitted_details": {...}}`.
        *   Populates `public.admin_approval_queue` table.
        *   (Optional) Sends email notification to ITC admin.
    *   **Manual Admin Process (Documented in `docs/MANUAL_LEAD_APPROVAL_PROCESS.md`):** ITC admin uses Supabase Studio to review `admin_approval_queue`, then manually updates `auth.users.app_metadata.itc_status` to `"ACTIVE"`, creates/links `public.profiles`, `public.companies`, and `public.user_companies` records.
    *   `src/hooks/useAuth.tsx` (`getCurrentUser`): Correctly checks `app_metadata.itc_status === "ACTIVE"` to allow user login. Users with other statuses are blocked.
    *   Admin user (UID `50630272-4062-431a-81ba-4a9be240cff2`) can log in (assuming their `app_metadata.itc_status` is also `"ACTIVE"` and `profiles` record exists with `role: "admin"`).

2.  **Basic Plan - Client Dashboard (Simplified MVP)**:
    *   Accessible after successful login for users with `itc_status: "ACTIVE"`.
    *   **Active Shipments Summary**: Simple list/card view of client's active shipments. Data manually input into `public.shipments` by ITC admin for initial clients, linked by `company_id`.
    *   **Recent Pre-Alerts**: Display status of pre-alerts from `public.shipment_pre_alerts` submitted by the client (linked by `user_id` or `company_id`).
    *   Navigation to other key Basic Plan features.
    *   **Sidebar Functionality:** Investigate and resolve why the sidebar was stuck loading. This likely involves checking data fetching for menu items (e.g., from `public.menu_items` if dynamic) or other context dependencies within the `Sidebar` component.

3.  **Basic Plan - Pre-Alert System (Functional V1 MVP)**:
    *   Clients can submit pre-alerts using a form. Data saved to `public.shipment_pre_alerts` (linked to `user_id` and `company_id`).
    *   ITC admins are notified (e.g., via email from Edge Function, or by manually checking the table).

4.  **Basic Plan - Shipment Tracking (Placeholder MVP)**:
    *   UI with an input field for a tracking number.
    *   Displays mock data or data from `public.shipments` (if populated by ITC admin and a simple lookup is feasible).
    *   No live carrier API integration for MVP.

5.  **Basic Plan - Operations View (Conceptual MVP)**:
    *   Page displaying a list/table of the client's shipments from `public.shipments`, associated with their `company_id`.

6.  **Basic Plan - Cost Estimation Calculator (UI Shell MVP)**:
    *   Basic UI for the calculator. Calculation logic will be placeholder or very simple.

7.  **Basic Plan - Marketplace (Read-Only V1 MVP)**:
    *   ITC Admins manually create `IMPORT_NEED` listings in `public.marketplace_listings` table via Supabase Studio.
    *   Clients can browse these listings. No client-side creation or interaction.

## Technical Implementation Details & Tasks (Reflecting Pivot):

### 1. Authentication & Authorization (Manual Approval Flow):
*   **Edge Function (`itc-user-registration-request`):** Modify to set `app_metadata.itc_status = "PENDING_REVIEW"` and include `submitted_details` in `app_metadata`.
*   **`src/hooks/useAuth.tsx` (`getCurrentUser`):** Implement the check for `app_metadata.itc_status === "ACTIVE"`. If not active, return `null` to prevent login.
*   **Admin User Setup:** Ensure the primary admin user (UID `50630272-...`) has `app_metadata.itc_status = "ACTIVE"` and a valid `public.profiles` entry with `role="admin"`.
*   **Documentation:** Finalize `docs/MANUAL_LEAD_APPROVAL_PROCESS.md`.

### 2. Frontend (React Components & UI):
*   **Login & Registration:**
    *   `RegistrationForm.tsx`: Ensure it calls the updated Edge Function. Success/error messages are appropriate for the manual review flow.
    *   `LoginForm.tsx`: No major changes expected if `useAuth.tsx` handles the login logic correctly now.
*   **`src/components/admin/ApprovalQueuePage.tsx`:**
    *   This page is **DEFERRED** for MVP in terms of *actions*. It can be temporarily simplified to be a read-only view for the admin if desired, or its route commented out.
    *   The manual approval happens in Supabase Studio.
*   **Sidebar Component:** **PRIORITY FIX.** Debug why it hangs on first successful login. Check:
    *   Data fetching (e.g., `menu_items` from `public.menu_items`). Are RLS policies correct for this table for authenticated users?
    *   Any context it consumes that might not be ready.
    *   Infinite loops or excessive re-renders within the Sidebar.
*   **Dashboard, Pre-Alert, Tracking, Operations, Calculator, Marketplace Pages:** Implement the simplified MVP UIs as described above, focusing on read operations or simple form submissions for pre-alerts. Data for display will often be manually prepared in Supabase by an admin initially.

### 3. Backend (Supabase):
*   **Table `public.admin_approval_queue`:** Schema should be stable. RLS policies are in place (restricting to `is_itc_admin`).
*   **Tables for Basic Plan features (`shipments`, `shipment_pre_alerts`, `marketplace_listings`):**
    *   Ensure schemas are defined (migrations should exist or be created).
    *   Implement basic RLS: Users can only see/manage their own company's data (e.g., `USING (company_id = (select company_id from profiles where id = auth.uid()))`) and ITC admins can see all.
*   **Triggers/Functions (Optional for MVP):** An optional DB trigger on `admin_approval_queue` insert to call an Edge Function that emails the admin would be a nice-to-have for the manual flow.

## Testing & Iteration for MVP:

1.  **Admin Manual Flow:** Thoroughly test the documented manual approval process using Supabase Studio.
2.  **New User Registration:** Test the end-to-end flow from form submission to admin receiving notification (if implemented) and being able to see the request in `admin_approval_queue`.
3.  **Activated User Login:** Once an admin manually activates a test user, confirm that user can log in and access Basic Plan features.
4.  **Admin Login & Sidebar:** Confirm admin can log in and that the Sidebar loading issue is resolved.
5.  **Viewer Login & Sidebar:** Confirm viewer can log in and Sidebar issue is resolved for them too.

## Deferred to Post-MVP (Phase 3.x or Phase 4):

*   In-app UI for admin approval of registration requests (`ApprovalQueuePage.tsx` full functionality).
*   Full automation of user activation steps after admin approves (e.g., an Edge Function to create profile, company, user_company link).
*   Live carrier API integration for shipment tracking.
*   Complex cost calculation formulas.
*   Client-side creation/management of marketplace listings.
*   Advanced dashboard widgets and customization.

This revised Phase 3 plan focuses on delivering a usable system with the manual approval workaround, prioritizing stability and core functionality. 