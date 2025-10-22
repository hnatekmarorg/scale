### 📄 **SCALE Design Document**  
*Version 1.0 | Core Workflow: "Label → Toggle → Scale"*

#### ✅ **Problem Solved**  
Manual scaling via `kubectl scale` or Helm is slow. SCALE automates it by **reading labels** on deployments (no YAML edits needed).

#### ✅ **Core User Flow**  
1. **Add labels** to your deployment:  
   ```yaml
   metadata:
     labels:
       scale.on-replicas: "5"    # Replicas when "ON"
       scale.off-replicas: "0"   # Replicas when "OFF"
   ```
2. **See the toggle** in SCALE dashboard.  
3. **Flip the toggle** → SCALE updates replicas instantly via label.  

#### ✅ **Key Design Principles**  
| Principle                | Why It Matters                                                                 |
|--------------------------|-------------------------------------------------------------------------------|
| **Labels > Config**      | No YAML changes. Labels are the *only* input.                                  |
| **Zero Context Switching** | Dashboard shows *only* deployments with SCALE labels (no noise).               |
| **State Clarity**        | Toggle + replica count *always visible* (no "where is it?" confusion).         |
| **Edge Case Guardrails** | Missing labels → show warning (not error). `off-replicas=0` → auto-skip scaling. |
