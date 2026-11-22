# BloodBridge — Nexconn Credential Setup Guide

**Workspace:** `D:\PROJECT REPO\bloodbridge-integration-test`  
**Purpose:** Secure, local-only configuration of official Nexconn Chat SDK credentials for the Nexconn Build Challenge 2026.

---

## 1. Security & Isolation Guarantee

* **App Secret Isolation:** `NEXCONN_APP_SECRET` is placed **strictly** in `backend/.env`. It is NEVER placed in root/frontend configuration or bundled into client code.
* **Git Excluded:** Both `.env` and `backend/.env` are explicitly ignored by `.gitignore`. Credentials will never be staged or committed.
* **No Third-Party Transmission:** Credentials are only transmitted directly to the official Nexconn Server API (`https://api.sg-light-api.com/v4/auth/access-token/issue`) over TLS during token issuance.

---

## 2. Configuration Parameters

| Parameter | Type | Required | Destination | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`NEXCONN_APP_KEY`** | Text | **Yes** | `.env` & `backend/.env` | Application Identifier used to initialize client SDK (`NCEngine.initialize({ appKey })`). |
| **`NEXCONN_APP_SECRET`** | Password (Masked) | **Yes** | `backend/.env` **ONLY** | Private key used server-side to calculate SHA1 API request signatures. |

---

## 3. How to Obtain Genuine Credentials

1. Sign up / Log in to the [Nexconn Console](https://console.nexconn.ai/agile/register).
2. Go to [Key Management](https://console.nexconn.ai/agile/apps/km).
3. Copy:
   * **App Key**
   * **App Secret**
4. Set the Data Center region to **Singapore** (`api.sg-light-api.com`).

---

## 4. How to Submit Your Credentials

You can submit your credentials securely through one of two methods:

### Method A: Direct Command Execution (Local PowerShell / Terminal)
Open a terminal in `D:\PROJECT REPO\bloodbridge-integration-test` and run:
```bash
node scripts/configure_nexconn_credentials.js
```
The script will prompt for the App Key, followed by the masked App Secret, and will safely write them without echoing the secret.

### Method B: Provide via Chat Prompt
When you respond, simply supply your credentials using the structured format:
```text
NEXCONN_APP_KEY: <paste_your_app_key_here>
NEXCONN_APP_SECRET: <paste_your_app_secret_here>
```
The automated configuration utility will immediately inject them into `backend/.env`, restart the backend gateway, execute the live cloud authentication, and produce the final verification report.
