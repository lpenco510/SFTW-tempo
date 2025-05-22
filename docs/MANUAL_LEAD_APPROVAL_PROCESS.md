# Manual Lead Approval Process for IT CARGO MVP

## 1. Overview

This document details the manual process for IT CARGO administrators to review and approve/reject new user registration requests. This approach is adopted for the MVP to ensure a stable user onboarding flow while deferring the complexities of an in-app admin approval UI.

The core principle is that new users can register, but their accounts remain in a pending state and cannot log in until an IT CARGO administrator manually reviews their submission and activates their account through direct Supabase interaction and subsequent profile/company setup.

## 2. Process Flow Diagram (Conceptual)

```
+---------------------+     +--------------------------+     +-----------------------+     +----------------------+     +--------------------+
| 1. Lead Completes   | --> | 2. Edge Function         | --> | 3. ITC Admin Gets     | --> | 4. ITC Admin Reviews | --> | 5. ITC Admin         |
|    Registration Form|     | (itc-user-registration)  |     |    Notification/Checks|     |    Request in Supabase|     |    Activates/Rejects |
+---------------------+     +--------------------------+     |    Queue Manually     |     |    Studio           |     |    User Manually     |
                              | - Creates auth.user      |     +-----------------------+     +----------------------+     +--------------------+
                              |   (app_metadata.itc_status: PENDING_REVIEW)
                              | - Stores details in      |
                              |   admin_approval_queue   |
                              | - (Optional) Sends email |
                              |   to admin@itcargo.com   |
                              +--------------------------+
```

## 3. Detailed Steps

### Step 1: Lead Submits Registration Form

*   The prospective user fills out `src/components/auth/RegistrationForm.tsx`.
*   Upon submission, the form calls the `itc-user-registration-request` Supabase Edge Function.
*   The user sees a success message like: "¡Solicitud Recibida! ...Recibirá un correo electrónico una vez que su cuenta haya sido aprobada..."

### Step 2: Edge Function (`itc-user-registration-request`) Processing

*   **Input:** Receives validated payload from the registration form.
*   **Action 1: Create Auth User:**
    *   Uses `supabaseAdminClient.auth.admin.createUser({...})`.
    *   **Crucial:** Sets `app_metadata` to include `"itc_status": "PENDING_REVIEW"`.
    *   Also stores the full `submitted_details: payload` in `app_metadata` for reference.
    *   `email_confirm` can be set to `true` since activation is manual.
    *   Example `app_metadata` for new user:
        ```json
        {
          "itc_status": "PENDING_REVIEW",
          "submitted_details": { ... full form payload ... },
          "provider": "email",
          "providers": ["email"]
        }
        ```
*   **Action 2: Log Request in `admin_approval_queue`:**
    *   Inserts a new row into `public.admin_approval_queue`.
    *   Populates `user_id` (from the newly created auth user), `email_submitted`, `company_name_submitted` (if applicable, e.g., from `razonSocial`), `cuit_submitted`, and sets `status: 'PENDING_ITC_REVIEW'`.
    *   The `registration_payload` column (if it exists as JSONB) should store the complete `payload` for easy review by the admin.
*   **Action 3 (Optional but Recommended): Notify Admin:**
    *   Send an email to a designated IT CARGO admin address (e.g., `comercial@itc-comex.com` or `admin@itcargo.com`) notifying them of a new pending request. This can use Resend or another email service via `fetch`.

### Step 3: ITC Admin Notification & Accessing the Queue

*   The IT CARGO administrator is notified of a new request (e.g., via the email from Step 2.3).
*   Alternatively, the admin periodically logs into the Supabase Dashboard for the IT CARGO project (`bfzwvshxtfryawcvqwyu`).
*   Navigates to: Table Editor -> `public.admin_approval_queue` table.
*   Sorts by `created_at` descending to see the latest requests with `status = 'PENDING_ITC_REVIEW'`. (RLS policies should allow the designated ITC Admin user to view this table).

### Step 4: ITC Admin Reviews the Request in Supabase Studio

*   The admin examines the details of the pending request directly from the `admin_approval_queue` row data (e.g., `email_submitted`, `company_name_submitted`, `cuit_submitted`, and the full `registration_payload` if stored).
*   The admin performs any necessary offline verification (e.g., checking CUIT validity, confirming if the lead is a known prospect).
*   The admin decides to Approve or Reject.

### Step 5: ITC Admin Manually Activates or Rejects the User

This involves several manual actions within the Supabase Dashboard (Table Editor & Authentication sections).

#### Scenario A: Approving the User

1.  **Update `auth.users` App Metadata:**
    *   Navigate to: Authentication -> Users.
    *   Find the user by their email (from `email_submitted`).
    *   Click to edit the user.
    *   In the "App Metadata" JSON editor, change `"itc_status": "PENDING_REVIEW"` to `"itc_status": "ACTIVE"` (or a similar agreed-upon active status).
    *   Save changes.
    *   *(SQL Alternative for updating `app_metadata`)*:
        ```sql
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{itc_status}', '"ACTIVE"'::jsonb)
        WHERE id = 'USER_ID_FROM_QUEUE';
        ```

2.  **Create/Update `public.profiles` Record:**
    *   Navigate to: Table Editor -> `profiles` table.
    *   Search for an existing profile by `id` (matching the `user_id` from the queue). If one was partially created by an older process or needs correction, edit it. Otherwise, click "Insert row".
    *   **`id` (Primary Key):** The `user_id` from `admin_approval_queue` (must match `auth.users.id`).
    *   **`email`**: User's email.
    *   **`full_name`**: Concatenate `nombre` and `apellido` from the submitted details (stored in `authUser.user.app_metadata.submitted_details` or `admin_approval_queue.registration_payload`).
    *   **`role`**: Assign a default client role (e.g., `'viewer'`, `'client_user'`). **Do NOT assign `'admin'` unless this user is also an ITC system admin.**
    *   **`company_id`**: This is crucial.
        *   Check the submitted `cuitCuil` and `razonSocial`.
        *   Search the `public.companies` table to see if this company already exists.
        *   If it exists, copy its `id` (UUID) to this `company_id` field.
        *   If it does NOT exist: Go to the `public.companies` table, click "Insert row", create the new company record using submitted details (`nombre_empresa` from `razonSocial`, `tax_id` from `cuitCuil`, `pais`, `provincia`, `localidad`, `domicilio` etc.). Save it and get its newly generated `id` (UUID). Use this new UUID for `company_id`.
    *   **`company_name`** (in `profiles`): Can be populated with the `razonSocial` for convenience, though the canonical company name is in `public.companies.nombre_empresa`.
    *   Ensure `created_at` and `updated_at` are set.
    *   Save the profile row.

3.  **Create `public.user_companies` Link:**
    *   Navigate to: Table Editor -> `user_companies` table.
    *   Click "Insert row".
    *   **`user_id`**: The `user_id` of the approved user.
    *   **`company_id`**: The `company_id` determined in the previous step.
    *   **`role_in_company`**: A default role for the user within their company (e.g., `'owner'` if they registered the company, or `'member'`). This field's usage can be defined further.
    *   **`is_primary`**: `true` (assuming this is their primary company association).
    *   Save the row.

4.  **Update `admin_approval_queue` Record:**
    *   Go back to the `admin_approval_queue` table.
    *   Edit the row for the request.
    *   Change `status` to `'APPROVED'`.
    *   Set `reviewed_by_admin_id` to your own admin user's UID (e.g., `50630272-4062-431a-81ba-4a9be240cff2`).
    *   Set `review_completed_at` to the current timestamp.
    *   (Optional) Add any relevant notes to `admin_notes`.
    *   Save the changes.

5.  **Notify User:**
    *   Manually send an email to the user informing them that their account has been approved and they can now log in using the credentials they created.

#### Scenario B: Rejecting the User

1.  **Update `auth.users` App Metadata:**
    *   Navigate to: Authentication -> Users. Find the user.
    *   Edit their "App Metadata" to set `"itc_status": "REJECTED"`.
    *   *(SQL Alternative)*:
        ```sql
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{itc_status}', '"REJECTED"'::jsonb)
        WHERE id = 'USER_ID_FROM_QUEUE';
        ```

2.  **Update `admin_approval_queue` Record:**
    *   Edit the row for the request.
    *   Change `status` to `'REJECTED'`.
    *   Set `reviewed_by_admin_id` and `review_completed_at`.
    *   Add a clear reason for rejection in `admin_notes` (this is important for internal records and if the user inquires).
    *   Save changes.

3.  **(Optional) Notify User:**
    *   Manually send an email informing them their application was not approved. Providing a general reason can be helpful.

### Step 6: User Login

*   If approved and all steps in Scenario A are completed, the user can now log into the IT CARGO platform.
*   The `useAuth.tsx` (`getCurrentUser`) function will check their `app_metadata.itc_status`. If it's "ACTIVE", it will proceed to fetch their profile and company data, and they will be granted access.
*   If their status is still "PENDING_REVIEW" or "REJECTED", `getCurrentUser` will return `null`, and they won't be able to log in (or will be immediately logged out by `ProtectedRoute`).

## 4. Required Modifications for this Pivot

1.  **Edge Function (`itc-user-registration-request/index.ts`):**
    *   Ensure it correctly sets `app_metadata: { "itc_status": "PENDING_REVIEW", "submitted_details": payload }` when creating the user in `auth.users`.
2.  **Frontend Hook (`src/hooks/useAuth.tsx` - `getCurrentUser` function):**
    *   Before attempting to fetch from `public.profiles`, it MUST check `authUser.app_metadata.itc_status`.
    *   If `itc_status` is not equal to `"ACTIVE"` (or your defined active/approved string), `getCurrentUser` must log this reason and immediately return `null`.
    *   If `itc_status` IS `"ACTIVE"`, then it proceeds to fetch profile and company data as currently designed.

## 5. Potential Issues & Considerations

*   **Manual Errors:** The manual nature of data entry in Supabase Studio (Steps 5A.2, 5A.3, 5A.4) can lead to typos or inconsistencies (e.g., mismatching UUIDs). Double-checking is crucial.
*   **Admin Workload:** As user registrations increase, this manual process can become time-consuming.
*   **Data Synchronization:** Ensuring `email` is consistent between `auth.users`, `profiles`, and `admin_approval_queue` is important for lookups.
*   **No In-App Admin History (Initially):** The admin won't have an in-app view of their past approval actions unless they check `admin_approval_queue` directly.
*   **User Notification Delays:** User activation relies on the admin performing manual steps and sending manual emails.

## 6. Rollback of Previous Admin UI Approach

*   **RLS Policies on `admin_approval_queue`:** The existing RLS policies (restricting access to users with `is_itc_admin: true`) are still beneficial for protecting the queue data, even if review happens in Supabase Studio. No change needed unless you want to open it up further (not recommended).
*   **`src/components/admin/ApprovalQueuePage.tsx`:** This React component, designed for an in-app admin UI, will become largely unused for *actions*. It could be simplified to be a read-only view for admins if desired for MVP, or commented out/deferred.
*   **Database Schema Changes:**
    *   `public.profiles.is_admin` column removal: Already done, good.
    *   `public.companies` consolidation of `name`/`nombre_empresa` and `tax_id`/`rut`: Already done, good.
    *   No other major schema rollbacks seem necessary for this pivot, as `admin_approval_queue` is still central.
*   **No Complex Code Reversion Needed:** The main requirement is the modification to the Edge Function and `useAuth.tsx` as described in Section 4.

This manual process, while not as automated, provides a secure and controllable way to manage user onboarding for the MVP. 