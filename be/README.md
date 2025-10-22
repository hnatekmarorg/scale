# SCALE Backend API

This is the backend service for the SCALE application that provides REST APIs to interact with Kubernetes deployments.

## API Endpoints

### GET `/api/v1/deployments`

Returns deployments with both `scale.on-replicas` and `scale.off-replicas` labels from all namespaces.

**Query Parameters:**
- `namespace` (optional): Filter deployments by namespace (deprecated - now scans all namespaces)

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
When no valid deployments exist.

### POST `/api/v1/toggle/{namespace}/{deployment}`

Flips the toggle for a deployment using labels as the source of truth.

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
When deployment is missing SCALE labels or not found.

**Response (400 Bad Request):**
When state is invalid.

## Authentication

Authentication is handled via Kubernetes RBAC token via `Authorization: Bearer <token>` header.

## Running Locally

1. Ensure you have a valid kubeconfig file
2. Run the server:
   ```
   go run main.go
   ```

## Building Docker Image

```
docker build -t scale-backend .
```