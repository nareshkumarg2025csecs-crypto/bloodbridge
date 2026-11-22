# BLOODBRIDGE — SIMPLE HOSPITAL CHAT ROLLBACK REPORT

**Date & Time:** 2026-11-22 21:44 IST  
**Workspace:** `D:\PROJECT REPO\bloodbridge-integration-test`  
**Database:** MySQL 8.0 (`bloodbridge_integration_test`)  
**Audit Status:** **100% PASS (9 / 9 VERIFIED)**

---

## 1. Executive Summary

As requested, the complex network-wide broadcast chat rooms, multi-party public groups, client-side Curve25519 E2EE key exchange, device key registration, and associated cryptographic UI overlays have been removed/rolled back.

BloodBridge now features a **clean, intuitive, simple hospital-to-hospital coordination chat** matching the original design ethos while maintaining high reliability, role-based authorization, authenticated Nexconn cloud relay, strict message deduplication, and complete inter-hospital isolation.

---

## 2. Changes Summary: Reverted vs. Preserved

### What Was Reverted & Removed
1. **Network-Wide Public Chat Rooms & Public Broadcast Boards**: Removed the shared network requests tab, broadcast chat lists, and multi-hospital response inspectors from the chat UI.
2. **Complex E2EE Key Management & Registration**:
   - Removed Curve25519-X25519 keypair generation, device secret key localStorage caching, and public key registration APIs (`/api/v1/chat/e2ee/*`) from the active chat workflow.
   - Removed client-side encryption and decryption overhead (`nacl.box` / `tweetnacl`).
3. **Misleading "End-to-End Encrypted" Badges**: Removed the E2EE badge from the chat header. The header now accurately indicates: *"Direct inter-hospital communication protected by TLS transport and role-based authentication"*.
4. **Chat Membership Fan-out Complexity**: Restored direct 1-on-1 institution-to-institution channels (`conv-inst-A-inst-B`).

### What Was Preserved
1. **Existing Database Data & Message History**:
   - All past messages and conversations were backed up to `database/chat_backup_pre_rollback.json` prior to updates.
   - No tables were dropped.
   - Preserved all emergency requests (`network_blood_requests`), blood inventory, blood units, reservations, deliveries, and institution accounts.
2. **Existing Nexconn Credentials & Configuration**:
   - Preserved real Nexconn App Key and App Secret in `backend/.env`.
   - Maintained genuine cloud token issuance via `/api/v1/chat/token` and real-time message event dispatching.
3. **User Accounts & Roles**:
   - Preserved all hospital officers, blood bank directors, and pathologist accounts (e.g., Dr. Anand, Dr. Priya, Dr. Karthik, Dr. Swetha).
4. **Emergency Blood Request & Inventory Workflows**:
   - Preserved all government data sync, e-RaktKosh integration, live network map, delivery tracking, and clinical request systems.

---

## 3. Database Architecture & Participant Authorization

### Conversation Structure
Each conversation connects two verified institutions:
```sql
SELECT c.id, c.channel_identifier, c.institution_a_id, c.institution_b_id, c.last_message_at
FROM conversations c
WHERE c.institution_a_id = :my_inst_id OR c.institution_b_id = :my_inst_id;
```

### Strict Inter-Hospital Isolation Check
When any user requests conversation history or attempts to post a message:
```typescript
const [convCheck]: any = await db.pool.query(
  `SELECT id, institution_a_id, institution_b_id FROM conversations WHERE channel_identifier = ?`,
  [channelId]
);

const conv = convCheck[0];
const isMember = user.role === 'SUPER_ADMIN' ||
                 conv.institution_a_id === userInstNumericId || 
                 conv.institution_b_id === userInstNumericId;

if (!isMember) {
  res.status(403).json({
    title: 'Access Denied',
    detail: 'Your institution is not a participant in this conversation.'
  });
  return;
}
```

---

## 4. End-to-End Verification Audit Results

Executed via automated headless Chrome E2E test harness [`scripts/test_simple_chat_rollback.cjs`](file:///d:/PROJECT%20REPO/bloodbridge-integration-test/scripts/test_simple_chat_rollback.cjs):

| Test # | Requirement / Test Scenario | Result | Evidence & Test Details |
|---|---|---|---|
| **01** | Log in as Dr Anand (Govt Central Blood Bank - Kilpauk) | **PASS** | Authenticated as `Dr. Anand Krishnan` (`dr.anand.kilpauk@bloodbridge.local`) with role `BLOOD_BANK_OFFICER`. |
| **02** | Log in separately as Dr Priya (Anna Nagar Premier) | **PASS** | Authenticated as `Dr. Priya Venkatesh` (`dr.priya.annanagar@bloodbridge.local`) with role `HOSPITAL_OFFICER`. |
| **03** | Send one message from Anand to Priya | **PASS** | Message `mysql-16` sent from Kilpauk to Anna Nagar via `conv-inst-1-inst-2`. |
| **04** | Confirm Priya receives exactly one message | **PASS** | Dr. Priya's inbox received exactly 1 instance of `mysql-16` with `isSelf: false`. |
| **05** | Reply from Priya | **PASS** | Reply `mysql-17` sent from Dr. Priya confirming blood unit preparation. |
| **06** | Confirm Anand receives exactly one reply | **PASS** | Dr. Anand's inbox received exactly 1 instance of reply `mysql-17` with `isSelf: false`. |
| **07** | Refresh both screens and confirm messages do not duplicate | **PASS** | Executed full page reload in Chrome. Authoritative MySQL query confirmed exactly 1 row per message ID (`c = 1`). No duplicate bubbles. |
| **08** | Log out and switch accounts; verify identity and conversation isolation | **PASS** | Logged out and switched to Dr. Karthik (Adyar - `inst-3`). Header and session updated to `Dr. Karthik Subramanian (Adyar Regional Transfusion & Research Centre)`. Only Adyar's conversations loaded. |
| **09** | Confirm other hospitals cannot read conversations they are not members of | **PASS** | Dr. Karthik attempted to access `conv-inst-1-inst-2` (Kilpauk <-> Anna Nagar). Request blocked with **HTTP 403 Forbidden**. |

---

## 5. Audit Summary

- **Total Test Cases:** 9
- **Passed:** 9 (100%)
- **Failed:** 0 (0%)
- **Duplicate Messages:** 0
- **Git State:** `bloodbridge-main` untouched. No commits or pushes made.
