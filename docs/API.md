# 🌐 LIB-MAN Enterprise: REST API Specification

## Response Envelope Standard
All endpoints return standard envelopes:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Authentication & Session
- `POST /api/auth/login`: Authenticate and receive signed JWT.
- `GET /api/auth/me`: Decodes active session payload.
- `POST /api/auth/logout`: Clears session token.

## Catalog & Circulation
- `GET /api/books`: Search OPAC catalog by query, category, status.
- `POST /api/books`: Register new title and generate physical copy accession codes.
- `POST /api/circulation/issue`: Issue book copy to student with policy validation.
- `POST /api/circulation/return`: Return book copy, calculate fines, and record condition.
- `POST /api/circulation/renew`: 1-click renewal with max renewal check.

## Inventory & Procurement
- `GET /api/inventory/audit`: Fetch past stock verification audits.
- `POST /api/inventory/audit`: Execute physical barcode scan discrepancy matrix.
- `GET /api/procurement`: List vendors and purchase orders.
- `POST /api/procurement`: Register vendor or place purchase order.

## Governance & SaaS
- `GET /api/settings`: Fetch institution fine rules and holidays.
- `PUT /api/settings`: Update fine policies and academic session.
- `GET /api/audit-logs`: Query immutable administrative audit logs.
- `POST /api/import-export`: Bulk JSON/CSV enrollment and catalog import.
- `GET /api/superadmin/colleges`: SaaS tenant multi-college management.
- `POST /api/superadmin/broadcast`: Publish global platform announcements.
