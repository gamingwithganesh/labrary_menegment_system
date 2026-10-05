# 🧪 LIB-MAN Enterprise: Automated Testing & Verification

## Running Automated End-to-End Test Suite
```bash
cd next-frontend
npm test
```

## Test Scope Covered
1. **Health Verification**: `/api/health` connectivity and status.
2. **Multi-Role Authentication**: JWT generation, role assertion, invalid password rejection (401).
3. **Book Cataloguing**: Title registration, copy allocation, OPAC search.
4. **Circulation Workflow**: Book issue, return with fine computation, 1-click renewal requests.
5. **Physical Stock Audit**: Barcode scan buffer analysis, discrepancy detection (*Found*, *Missing*, *Extra*).
6. **Procurement**: Vendor registry and purchase order creation.
7. **Institutional Policies**: Fine rules, grace period retrieval.
8. **Notifications**: System announcements and broadcast dispatch.
9. **Audit Logging**: Immutable operational trail capture.
10. **Multi-Tenant SaaS**: Multi-college tenant query.
