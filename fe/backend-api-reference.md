### SCALE Frontend - Backend API Reference

This document outlines the API contract between the SCALE frontend and backend.

#### Base URL
The frontend should make requests to: `process.env.REACT_APP_API_URL || ''` + endpoints

#### Authentication
- All API calls require Kubernetes RBAC token via `Authorization: Bearer <token>` header
- This should be configured at the proxy or gateway level

#### API Endpoints

##### 1. GET `/api/v1/deployments`
- Returns ONLY deployments with BOTH `scale.on-replicas` and `scale.off-replicas` labels
- No invalid deployments in response

**Query Parameters:**
- `namespace` (optional): Filter by namespace (default: 'default')

**Response (200 OK):**
```json
[
  {
    "namespace": "prod",
    "name": "frontend-app",
    "onReplicas": 5,
    "offReplicas": 0,
    "currentReplicas": 5,
    "labels": {
      "app": "frontend",
      "scale.on-replicas": "5",
      "scale.off-replicas": "0"
    }
  }
]
```

**Response (204 No Content):**
- When no valid deployments exist

##### 2. POST `/api/v1/toggle/{namespace}/{deployment}`
- Flips toggle using labels as source of truth
- Idempotent and Kubernetes-native

**Request Body:**
```json
{
  "state": "on"  // "on" or "off"
}
```

**Response (200 OK):**
```json
{
  "namespace": "prod",
  "name": "frontend-app",
  "targetReplicas": 5,
  "currentReplicas": 5,
  "message": "Scaled to 5 replicas"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Deployment not found or missing SCALE labels"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid state: 'invalid'. Must be 'on' or 'off'."
}
```

#### Frontend Implementation Notes

- The filtering happens at the API level (only deployments with valid labels are returned)
- The frontend displays current replica count and shows toggle state based on comparison
- Toggling is idempotent - calling the same state multiple times is safe
- Error handling should be graceful with user-friendly messages
- Loading states should be shown during API calls
- No search for deployments missing SCALE labels - they're filtered out at API level