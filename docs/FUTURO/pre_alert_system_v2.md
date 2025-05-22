# Pre-Alert System - V2+ Enhancements (IT CARGO)

This document outlines future enhancements for the Pre-Alert system beyond the initial V1 implementation.

## V1.5: Enhanced Pre-Alert Form & ITC Workflow

*   **Client-Side Improvements**:
    *   Optional fields from initial brainstorming: `description_of_goods`, `estimated_quantity`, `country_of_origin`, `port_of_loading`, `expected_arrival_date`, `carrier_name`, `master_bill_of_lading_or_awb`.
    *   Document Uploads: Allow clients to attach proforma invoices, packing lists, etc., linked to the pre-alert. Store in Supabase Storage.
    *   Save as Draft: Allow clients to save incomplete pre-alerts.
    *   Pre-alert Templates: For clients who frequently pre-alert similar shipments.
*   **ITC Admin-Side Improvements (within main app or simple admin panel)**:
    *   Dashboard view of all pre-alerts, filterable by status, client, date.
    *   One-click status updates (e.g., "Acknowledge," "Request More Info").
    *   Ability to link a pre-alert to an actual `shipments` record once ITC starts processing the operation.
    *   Internal notes and assignment to ITC team members.

## V2: Automated Linkage & Proactive Communication

*   **Automated Matching**: Attempt to automatically match submitted pre-alert tracking numbers with data from integrated carriers (if Pro/Enterprise feature).
*   **Client Notifications**: Automated email/in-app notifications to clients when ITC acknowledges or updates the status of their pre-alert.
*   **Pre-alert from Operations View**: Ability for clients to initiate a pre-alert directly from a planned/draft shipment in their main "Operations View."
*   **Export Pre-Alerts**: Add functionality for clients to pre-alert export operations.

## V3: AI & Integration

*   **AI-Powered Risk Assessment**: Based on pre-alert data, AI could flag potentially problematic shipments for ITC (e.g., unusual country of origin, high value, sensitive goods).
*   **Automated Document Check (Basic)**: AI attempts to verify if uploaded documents seem to match pre-alert details (e.g., supplier name, product type).
*   **Integration with Marketplace**: If a pre-alert relates to a deal initiated via the marketplace, link them for context.

## Considerations:

*   Complexity of admin UI for managing pre-alerts.
*   Scalability of notification system.
*   Data mapping between pre-alert info and eventual formal shipment documentation. 