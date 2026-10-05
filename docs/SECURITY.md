# 🛡️ LIB-MAN Enterprise: Security & Hardening Guide

## 1. Authentication & Session Management
- **JWT Standard**: Signed with HS256 using `JWT_SECRET`.
- **Password Hashing**: Bcrypt with 10 salt rounds.
- **Credential Sanitization**: Passwords, password hashes, and internal metadata are stripped before sending API responses.

## 2. Multi-Tenant Scoping & Access Control
- Non-Super Admin requests are strictly scoped to the tenant's `collegeCode`.
- Cross-tenant data leaks and IDOR vectors are blocked at the store and route layer.

## 3. HTTP Security Headers
Configured in `next.config.mjs`:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN` (Clickjacking defense)
- `X-Content-Type-Options`: `nosniff` (MIME sniffing defense)
- `X-XSS-Protection`: `1; mode=block`
- `Referrer-Policy`: `strict-origin-when-cross-origin`

## 4. Immutable Audit Logging
- Critical operations (`USER_CREATED`, `BOOK_CREATED`, `BOOK_ISSUED`, `BOOK_RETURNED`, `INVENTORY_AUDIT`) are permanently recorded to the `AuditLog` collection.
- Financial and circulation history is never physically deleted (soft-delete data retention).
