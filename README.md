# SCALE Backend API (Go)

A Go implementation of the SCALE backend API that manages Kubernetes deployment scaling through labels.

## Features

- **API v1**: RESTful API with versioned endpoints
- **Label-based scaling**: Uses `scale.on-replicas` and `scale.off-replicas` labels
- **Kubernetes Integration**: Direct interaction with Kubernetes API for deployment scaling
- **Error handling**: Proper error responses and validation

## Endpoints

### GET /api/v1/deployments

Returns deployments with SCALE labels.

**Query Parameters:**
- `namespace` (optional): Filter by namespace

**Response:**
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

### POST /api/v1/toggle/{namespace}/{deployment}

Toggles deployment scaling state using labels as source of truth.

**Request Body:**
```json
{
  "state": "on" // "on" or "off"
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

## Running the Server

To run the server locally, you'll need:
1. A valid kubeconfig file
2. Go 1.25.3 or higher

```bash
go run main.go
```

The server starts on port 8080.

## API Usage Examples

### Get deployments
```bash
curl http://localhost:8080/api/v1/deployments?namespace=prod
```

### Toggle deployment scale
```bash
curl -X POST http://localhost:8080/api/v1/toggle/prod/frontend-app \
  -H "Content-Type: application/json" \
  -d '{"state": "on"}'
```

## Architecture

The implementation follows the design document exactly:
- Versioned endpoints (`/api/v1/`)
- Kubernetes-native approach using labels directly
- Idempotent operations
- Proper filtering of deployments with both scale labels