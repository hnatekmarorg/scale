# SCALE Frontend

## Overview
The SCALE frontend is a React-based dashboard for Kubernetes auto-scaling via labels. It provides a clean interface to view and toggle deployments that have SCALE labels configured.

## Features
- **Dashboard View**: Clean table layout showing deployments with SCALE labels
- **Toggle Interface**: Visual toggle to scale deployments on/off
- **Real-time Updates**: Auto-refreshes deployment state after toggle operations
- **Search/Filter**: Filter deployments by name or labels
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Proper loading indicators during API calls
- **Responsive Design**: Mobile-friendly layout

## API Integration
The frontend integrates with the SCALE backend API:
- **GET `/api/v1/deployments`**: Fetches deployments with SCALE labels
- **POST `/api/v1/toggle/{namespace}/{deployment}`**: Toggles deployment scaling state

## Technology Stack
- React 18
- React DOM
- React Scripts 5.0.1
- CSS (styled according to design mockup)

## Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.js    # Main dashboard component
│   ├── DeploymentRow.js # Individual deployment row
│   └── Toggle.js       # Toggle component
├── hooks/             # Custom React hooks
│   └── useDeployments.js # API data fetching hook
├── services/          # API service functions
│   └── api.js         # API client functions
├── styles/            # CSS styles
│   └── index.css      # Global styles
├── types/             # TypeScript definitions (if needed)
│   └── index.js       # Type constants
├── App.js             # Main app component
└── index.js           # App entry point
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables
Set these environment variables to configure the frontend:

- `REACT_APP_API_URL`: Base URL for the SCALE backend API (default: '')

## Usage
1. Deployments with SCALE labels are automatically displayed
2. Use the toggle to scale deployments on/off
3. Filter deployments using the search bar
4. The interface shows current replica count and toggle state

## Design Reference
- **Colors**: Primary (#4f46e5), Success (#10b981), Gray/E5 (#e5e7eb), Dark/1f (#1f2937)
- **Layout**: Centered container with header, filter bar, and deployment table
- **Icon**: Tooltip info icon (ⓘ) for scaling information
- **Typography**: Modern sans-serif (Segoe UI, Roboto, system fonts)

## Backend Integration
The frontend expects the backend to strictly adhere to the API contract:
- Only return deployments with valid `scale.on-replicas` and `scale.off-replicas` labels
- Handle authentication via Kubernetes RBAC token
- Return appropriate HTTP status codes and error messages

## Development Notes
- The filtering is done at the API level - deployments without SCALE labels are not returned
- Error handling is implemented with proper user feedback
- The toggle state is determined by comparing current replicas with onReplicas value
- API calls are properly handled with loading states