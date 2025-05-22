# Marketplace Ideation (IT CARGO)

## V1: ITC-Curated Import Needs (Basic Plan Feature)

*   **Goal**: Connect ITC clients (importers) with potential international suppliers/products curated by ITC.
*   **Functionality**:
    *   Clients can browse listings of "Import Needs" or "Supplier Opportunities."
    *   Listings are created *exclusively* by ITC Admins (manually in Supabase initially).
    *   Each listing includes:
        *   `listing_type`: 'IMPORT_NEED'
        *   `title`: e.g., "Seeking Reliable Suppliers of Grade A Coffee Beans from Colombia"
        *   `description`: Detailed requirements, desired quantity, quality standards, target price range (optional).
        *   `product_categories`: (e.g., "Food & Beverage", "Agricultural Products")
        *   `target_country_origin`: (e.g., "Colombia")
        *   `contact_instructions`: How interested parties should contact ITC (e.g., email marketplace@itcargo.com with Ref ID).
        *   `status`: 'active', 'closed'
    *   Simple UI for browsing/filtering listings.
*   **No direct client-to-client interaction in V1.** ITC acts as the intermediary.
*   **Database Table**: `marketplace_listings` (as created).

## V2: Client Export Offers & Direct Contact (Pro Plan Feature)

*   **Goal**: Allow ITC clients (exporters) to list their products/services for other ITC clients or external parties to discover.
*   **Functionality (in addition to V1)**:
    *   Clients with Pro plan can create 'EXPORT_OFFER' listings through a form.
    *   Listings undergo ITC review/approval before becoming active (`status`: 'pending_review', 'active', 'rejected').
    *   Listing includes:
        *   Exporter company profile link (if applicable).
        *   Product details, images, pricing (optional), minimum order quantity.
        *   Target export markets.
    *   Potential for a simple direct messaging system within the platform for initial contact (or verified contact info exchange).
*   **Enhanced Search/Filtering**: By product, country, company type.

## V3: Full Two-Sided Marketplace (Enterprise/Future)

*   **Goal**: A more dynamic marketplace with potential for bidding, negotiations, integrated logistics booking via ITC.
*   **Functionality**:
    *   Advanced search with matchmaking algorithms.
    *   Reputation/review system for buyers and sellers.
    *   Secure communication channels.
    *   Integration with ITC's logistics services for quotes/booking directly from a marketplace deal.
    *   Escrow services (potentially).
    *   API for external partners to list/find opportunities.

## Monetization Ideas (Beyond Plan Tiers):

*   Featured listings.
*   Commission on successful deals facilitated through V3+ marketplace.
*   Premium analytics for sellers on listing performance.

## Open Questions:

*   How will ITC vet suppliers for V1 listings?
*   What's the review process for client-submitted listings in V2?
*   Legal implications/terms of service for marketplace interactions. 