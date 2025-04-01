# StellarID API Documentation

This document provides comprehensive documentation for the StellarID API, which enables third-party applications to integrate with the StellarID identity system.

## Base URL

```
https://api.stellarid.io/v1
```

For testnet:
```
https://testnet-api.stellarid.io/v1
```

## Authentication

All API requests must include an API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

To obtain an API key, please contact the StellarID team.

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

In case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Endpoints

### Identity

#### Create Identity

Creates a new identity on the Stellar blockchain.

**Endpoint:** `POST /identity`

**Request Body:**
```json
{
  "seed": "S...",
  "identityData": {
    "name": "John Doe",
    "birthYear": 1990,
    "country": "United States",
    "type": "basic-info"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "identityHash": "a1b2c3...",
    "ipfsCid": "Qm...",
    "transactionHash": "a1b2c3..."
  },
  "error": null
}
```

#### Verify Identity

Verifies an identity and returns its verification score and attestations.

**Endpoint:** `GET /identity/verify/:userPublicKey`

**Response:**
```json
{
  "success": true,
  "data": {
    "userPublicKey": "G...",
    "verified": true,
    "verificationScore": 65,
    "attestations": [
      {
        "attestationData": {
          "type": "government-id",
          "verified": true
        },
        "attestedAt": "2023-11-15T12:34:56Z",
        "attesterPublicKey": "G..."
      },
      {
        "attestationData": {
          "type": "proof-of-address",
          "verified": true
        },
        "attestedAt": "2023-11-16T12:34:56Z",
        "attesterPublicKey": "G..."
      }
    ]
  },
  "error": null
}
```

### Attestation

#### Request Attestation

Submits a request for attestation.

**Endpoint:** `POST /attestation/request`

**Request Body:**
```json
{
  "userPublicKey": "G...",
  "attestationType": "government-id",
  "attestationData": {
    "documentType": "passport",
    "documentNumber": "AB123456",
    "issueDate": "2018-01-01",
    "expiryDate": "2028-01-01"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "a1b2c3...",
    "status": "pending"
  },
  "error": null
}
```

#### Get Attestation Status

Checks the status of an attestation request.

**Endpoint:** `GET /attestation/status/:requestId`

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "a1b2c3...",
    "status": "approved",
    "attestationId": "d4e5f6..."
  },
  "error": null
}
```

### Attester

#### Register Attester

Registers a new attester.

**Endpoint:** `POST /attester/register`

**Request Body:**
```json
{
  "seed": "S...",
  "attesterInfo": {
    "name": "Government ID Verifier",
    "type": "government-id",
    "level": "official",
    "website": "https://gov-id-verifier.org",
    "contactEmail": "contact@gov-id-verifier.org"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attesterPublicKey": "G...",
    "ipfsCid": "Qm...",
    "transactionHash": "a1b2c3..."
  },
  "error": null
}
```

#### Issue Attestation

Issues an attestation for a user's identity.

**Endpoint:** `POST /attester/issue`

**Request Body:**
```json
{
  "attesterSeed": "S...",
  "userPublicKey": "G...",
  "identityHash": "a1b2c3...",
  "attestationData": {
    "type": "government-id",
    "verified": true,
    "verificationMethod": "document-verification",
    "verificationNotes": "Document verified successfully"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attestationId": "d4e5f6...",
    "transactionHash": "a1b2c3..."
  },
  "error": null
}
```

#### Get Pending Attestation Requests

Returns a list of pending attestation requests for an attester.

**Endpoint:** `GET /attester/requests/:attesterPublicKey`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingRequests": [
      {
        "requestId": "a1b2c3...",
        "userPublicKey": "G...",
        "attestationType": "government-id",
        "requestedAt": "2023-11-15T12:34:56Z"
      },
      {
        "requestId": "d4e5f6...",
        "userPublicKey": "G...",
        "attestationType": "proof-of-address",
        "requestedAt": "2023-11-16T12:34:56Z"
      }
    ]
  },
  "error": null
}
```

## Integration with Financial Services

Financial service providers can integrate with StellarID to verify users' identities before providing services. Here's an example integration flow:

1. The financial service redirects the user to StellarID for identity verification
2. The user authenticates with StellarID and grants permission to share their identity
3. StellarID redirects the user back to the financial service with an identity token
4. The financial service verifies the token and retrieves the user's identity information

### Example Integration Code

```javascript
// Sample integration code for a financial service provider

// Step 1: Redirect user to StellarID
function redirectToStellarID(clientId, redirectUri) {
  const authUrl = `https://auth.stellarid.io/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
  window.location.href = authUrl;
}

// Step 3: Handle the callback from StellarID
async function handleCallback(identityToken) {
  // Step 4: Verify the token and retrieve identity information
  const response = await fetch('https://api.stellarid.io/v1/identity/verify-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer YOUR_API_KEY`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: identityToken })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Identity verified successfully
    const { userPublicKey, verificationScore, attestations } = result.data;
    
    // Check if the verification score meets your requirements
    if (verificationScore >= 60) {
      // User has sufficient identity verification
      // Proceed with providing financial services
      return {
        verified: true,
        userPublicKey,
        verificationScore,
        attestations
      };
    } else {
      // User does not have sufficient identity verification
      return {
        verified: false,
        reason: 'insufficient-verification',
        requiredScore: 60,
        actualScore: verificationScore
      };
    }
  } else {
    // Error verifying identity
    return {
      verified: false,
      reason: 'verification-error',
      error: result.error
    };
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | The request is invalid or improperly formatted |
| `UNAUTHORIZED` | Authentication failed or insufficient permissions |
| `NOT_FOUND` | The requested resource was not found |
| `BLOCKCHAIN_ERROR` | Error interacting with the Stellar blockchain |
| `IPFS_ERROR` | Error interacting with IPFS |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limits

API requests are rate-limited to 100 requests per minute per API key. If you exceed this limit, you will receive a `429 Too Many Requests` response.

## Webhooks

StellarID supports webhooks for real-time notifications. You can register a webhook URL for the following events:

- `identity.created` - A new identity is created
- `attestation.requested` - A new attestation is requested
- `attestation.issued` - A new attestation is issued

To register a webhook, send a request to:

**Endpoint:** `POST /webhooks/register`

**Request Body:**
```json
{
  "url": "https://your-service.com/webhooks/stellarid",
  "events": ["identity.created", "attestation.issued"],
  "secret": "your-webhook-secret"
}
```

The `secret` is used to sign the webhook payloads so you can verify they come from StellarID.

## SDK Integration

We provide SDKs for easy integration with StellarID:

- [JavaScript SDK](https://github.com/stellarid/stellarid-js)
- [Python SDK](https://github.com/stellarid/stellarid-python)
- [Java SDK](https://github.com/stellarid/stellarid-java)

Example usage of the JavaScript SDK:

```javascript
const StellarID = require('stellarid-js');

// Initialize the SDK
const client = new StellarID.Client({
  apiKey: 'YOUR_API_KEY',
  environment: 'testnet' // or 'production'
});

// Verify an identity
async function verifyIdentity(userPublicKey) {
  try {
    const result = await client.identity.verify(userPublicKey);
    console.log('Verification result:', result);
    return result;
  } catch (error) {
    console.error('Error verifying identity:', error);
    throw error;
  }
}
```

## Testing

For testing purposes, you can use our testnet environment. We provide a set of test accounts with pre-populated identities and attestations.

### Test Accounts

| Account Type | Public Key | Secret Key |
|--------------|------------|------------|
| Test User | GBUSER... | SUSER... |
| Test Attester | GATTESTER... | SATTESTER... |

Note: The actual keys will be provided upon request.

## Support

If you need assistance with the StellarID API, please contact our support team at support@stellarid.io.