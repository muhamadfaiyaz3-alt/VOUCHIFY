# Smart-Voucher-Exchange-Platform

#Working Format :
# Application Page Structure

This document outlines the complete page structure of the Smart Voucher Exchange Platform, categorized by User (Frontend) and Admin (Backend Panel) interfaces.

## 👤 User Interface (Frontend)

These pages are designed for the end-users (buyers and sellers).

### 🌍 Public Pages
*Accessible to all visitors without login.*

*   **Home Page** (`/`)
    *   *Components*: Hero Section, Features Overview, Testimonials/Reviews, Footer.
*   **Find Vouchers** (`/vouchers`)
    *   *Function*: Browse, filter, and search for vouchers available for sale.
*   **Voucher Details** (`/vouchers/:id`)
    *   *Function*: Detailed view of a specific voucher (Price, Expiry, Seller info) with "Add to Cart" or "Buy" options.
*   **Rewards Information** (`/rewards-info`)
    *   *Function*: Explains the loyalty and rewards program details.
*   **About Us** (`/about`)
    *   *Function*: Platform mission and team information.
*   **Contact Us** (`/contact`)
    *   *Function*: Support contact form and details.
*   **Legal Pages**
    *   **Privacy Policy** (`/privacy-policy`)
    *   **Terms of Service** (`/terms-of-service`)
*   **Authentication**
    *   **Login** (`/login`): User sign-in page.
    *   **Register** (`/register`): New user account creation.
    *   **Appeal Suspension** (`/appeal`): Form for suspended users to request account reactivation.

### 🔒 Protected User Pages
*Requires Authentication.*

*   **User Profile** (`/profile`)
    *   *Dashboard*: Overview of Total Earnings, Savings, and Activity.
    *   *Voucher Activity Tabs*: 
        *   **My Listings**: Vouchers the user is selling.
        *   **Purchased**: Vouchers the user has bought.
        *   **Sold History**: Record of completed sales.
        *   **Payouts**: Status of money transfers for sold vouchers.
    *   *Analytics*: Charts showing transaction history.
    *   *Notifications*: Personal alerts.
    *   *Rewards*: View earned rewards/scratch cards.
    *   *Settings*: Edit profile details and password.
*   **Sell Voucher** (`/list-voucher`)
    *   *Function*: Form to create a new voucher listing (Brand, Code, Price, Expiry).
*   **Shopping Cart** (`/cart`)
    *   *Function*: Review items selected for purchase.
*   **Payment Gateway** (`/payment/:voucherId`)
    *   *Function*: Secure page to complete payment for a voucher (e.g., via UPI proof submission).
*   **Referrals** (`/referrals`)
    *   *Function*: Manage referral links and view invited users.

---

## 🛡️ Admin Interface (Backend Panel)

These pages are restricted to users with the `admin` role.

### 📊 Core Management
*   **Admin Dashboard** (`/admin`)
    *   *Function*: High-level stats: Total Revenue, Total Users, Active Vouchers, Pending Actions.
*   **Platform Settings** (`/admin/settings`)
    *   *Function*: Configure global variables (e.g., Platform Fee %, Payment Details displayed to users).

### ✅ Verification & Approvals
*   **Verify Users** (`/admin/verify-users`)
    *   *Function*: Review and approve/reject user Identity Proofs (KYC).
*   **Verify Payments** (`/admin/verify-payments`)
    *   *Function*: Confirm manual payment screenshots uploaded by buyers.
*   **Verify Vouchers** (`/admin/verify-vouchers`)
    *   *Function*: Audit and approve new voucher listings before they go live.
*   **Reactivation Requests** (`/admin/reactivations`)
    *   *Function*: Review appeals from users who have been suspended.

### 💰 Financials & Transactions
*   **All Transactions** (`/admin/transactions`)
    *   *Function*: Master log of every purchase and sale on the platform.
*   **Payout Management** (`/admin/payouts`)
    *   *Function*: Manage payouts to sellers.
        *   *Platform Revenue*: Track fees earned by the app.
        *   *Company Share*: Track specific company allocations.
        *   *Settlements*: Mark payouts as "Paid" after transferring money to sellers.
*   **Top Buyers** (`/admin/top-buyers`)
    *   *Function*: Leaderboard of top spending users (used for issuing manual rewards).

### ⚙️ System & User Oversight
*   **Audit Logs** (`/admin/audit-logs`)
    *   *Function*: Security log of admin actions (who approved what and when).
*   **User Management** (`/admin/users`)
    *   *Function*: List of all registered users with options to View Details or Ban/Suspend users.
