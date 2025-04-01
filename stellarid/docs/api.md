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

[See full documentation for endpoints and integration examples]
