package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/handlers"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// Deployment represents a Kubernetes deployment with scale information
type Deployment struct {
	Namespace       string            `json:"namespace"`
	Name            string            `json:"name"`
	OnReplicas      int32             `json:"onReplicas"`
	OffReplicas     int32             `json:"offReplicas"`
	CurrentReplicas int32             `json:"currentReplicas"`
	Labels          map[string]string `json:"labels"`
}

// ToggleRequest represents the request body for toggle endpoint
type ToggleRequest struct {
	State string `json:"state"`
}

// ToggleResponse represents the response for toggle endpoint
type ToggleResponse struct {
	Namespace       string `json:"namespace"`
	Name            string `json:"name"`
	TargetReplicas  int32  `json:"targetReplicas"`
	CurrentReplicas int32  `json:"currentReplicas"`
	Message         string `json:"message"`
}

// ErrorResponse represents error responses
type ErrorResponse struct {
	Error string `json:"error"`
}

var clientset *kubernetes.Clientset

func init() {
	// Initialize Kubernetes client
	var err error
	config, err := rest.InClusterConfig()
	if err != nil {
		// If not running in cluster, try kubeconfig
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			kubeconfig = clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
		}
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			slog.Error("Failed to create Kubernetes config", "error", err)
			os.Exit(1)
		}
	}
	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		slog.Error("Failed to create Kubernetes client", "error", err)
		os.Exit(1)
	}
	slog.Info("Kubernetes client initialized successfully")
}

// getDeploymentsHandler handles GET /api/v1/deployments
func getDeploymentsHandler(w http.ResponseWriter, r *http.Request) {
	slog.Info("Handling GET /api/v1/deployments request", "method", r.Method, "url", r.URL.String())

	// List deployments from all namespaces
	deployments, err := clientset.AppsV1().Deployments("").List(context.Background(), metav1.ListOptions{})
	if err != nil {
		slog.Error("Failed to list deployments", "error", err)
		http.Error(w, fmt.Sprintf("Failed to list deployments: %v", err), http.StatusInternalServerError)
		return
	}

	var validDeployments []Deployment

	for _, deployment := range deployments.Items {
		labels := deployment.GetLabels()

		// Check if deployment has both scale labels
		onReplicasStr, hasOnLabel := labels["scale.on-replicas"]
		offReplicasStr, hasOffLabel := labels["scale.off-replicas"]

		if !hasOnLabel || !hasOffLabel {
			continue // Skip deployments without both labels
		}

		// Parse replica counts
		var onReplicas, offReplicas int32
		fmt.Sscanf(onReplicasStr, "%d", &onReplicas)
		fmt.Sscanf(offReplicasStr, "%d", &offReplicas)

		validDeployments = append(validDeployments, Deployment{
			Namespace:       deployment.Namespace,
			Name:            deployment.Name,
			OnReplicas:      onReplicas,
			OffReplicas:     offReplicas,
			CurrentReplicas: *deployment.Spec.Replicas,
			Labels:          labels,
		})
	}

	if len(validDeployments) == 0 {
		slog.Info("No valid deployments found")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	slog.Info("Returning deployments list", "count", len(validDeployments))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(validDeployments)
}

// toggleDeploymentHandler handles POST /api/v1/toggle/{namespace}/{deployment}
func toggleDeploymentHandler(w http.ResponseWriter, r *http.Request) {
	slog.Info("Handling POST /api/v1/toggle request", "method", r.Method, "url", r.URL.String())
	// Extract path parameters
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 5 || pathParts[0] != "api" || pathParts[1] != "v1" || pathParts[2] != "toggle" {
		slog.Error("Invalid endpoint path")
		http.Error(w, "Invalid endpoint", http.StatusBadRequest)
		return
	}

	namespace := pathParts[3]
	deploymentName := pathParts[4]

	// Parse request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		slog.Error("Failed to read request body", "error", err)
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var toggleReq ToggleRequest
	if err := json.Unmarshal(body, &toggleReq); err != nil {
		slog.Error("Invalid JSON in request body", "error", err)
		http.Error(w, "Invalid JSON in request body", http.StatusBadRequest)
		return
	}

	// Validate state
	if toggleReq.State != "on" && toggleReq.State != "off" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error: fmt.Sprintf("Invalid state: '%s'. Must be 'on' or 'off'.", toggleReq.State),
		})
		slog.Error("Invalid state in request", "state", toggleReq.State)
		return
	}

	// Get deployment to check labels
	deployment, err := clientset.AppsV1().Deployments(namespace).Get(context.Background(), deploymentName, metav1.GetOptions{})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error: "Deployment not found or missing SCALE labels",
		})
		slog.Error("Deployment not found", "namespace", namespace, "deployment", deploymentName, "error", err)
		return
	}

	labels := deployment.GetLabels()

	// Check if deployment has both scale labels
	onReplicasStr, hasOnLabel := labels["scale.on-replicas"]
	offReplicasStr, hasOffLabel := labels["scale.off-replicas"]

	if !hasOnLabel || !hasOffLabel {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error: "Deployment not found or missing SCALE labels",
		})
		slog.Error("Deployment missing scale labels", "namespace", namespace, "deployment", deploymentName)
		return
	}

	// Determine target replicas based on state
	var targetReplicas int32
	if toggleReq.State == "on" {
		fmt.Sscanf(onReplicasStr, "%d", &targetReplicas)
	} else {
		fmt.Sscanf(offReplicasStr, "%d", &targetReplicas)
	}

	// Update deployment replicas
	deployment.Spec.Replicas = &targetReplicas
	_, err = clientset.AppsV1().Deployments(namespace).Update(context.Background(), deployment, metav1.UpdateOptions{})
	if err != nil {
		slog.Error("Failed to update deployment", "namespace", namespace, "deployment", deploymentName, "error", err)
		http.Error(w, fmt.Sprintf("Failed to update deployment: %v", err), http.StatusInternalServerError)
		return
	}

	// Return success response
	response := ToggleResponse{
		Namespace:       namespace,
		Name:            deploymentName,
		TargetReplicas:  targetReplicas,
		CurrentReplicas: targetReplicas,
		Message:         fmt.Sprintf("Scaled to %d replicas", targetReplicas),
	}

	slog.Info("Deployment scaled successfully", "namespace", namespace, "deployment", deploymentName, "target_replicas", targetReplicas, "state", toggleReq.State)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func main() {
	// Set up routes
	http.HandleFunc("/api/v1/deployments", getDeploymentsHandler)
	http.HandleFunc("/api/v1/toggle/", toggleDeploymentHandler)

	// Fallback handler for other routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error: "Endpoint not found",
		})
	})

	// Configure CORS
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	originsOk := handlers.AllowedOrigins([]string{"*"})

	slog.Info("Starting server on :8080")
	slog.Info("API endpoints:", "endpoint", "GET /api/v1/deployments", "endpoint", "POST /api/v1/toggle/{namespace}/{deployment}")

	err := http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(http.DefaultServeMux))
	if err != nil {
		slog.Error("Failed to start server", "error", err)
		os.Exit(1)
	}
}
