# # 🛡️ PhishGuard: Phishing Email Detection Pipeline

An interactive, full-stack Machine Learning application that uses **Scikit-learn** to classify emails as either "Phishing" or "Safe". The project features a beautiful, cyber-themed React dashboard that communicates with a live Python machine learning microservice.

---

## 🏗️ System Architecture

The application is split into two specialized components that communicate over a local REST API network:

1. **Frontend (React/Vite):** A high-tech, responsive visual terminal that handles user input, showcases live metric analysis, and displays feature extraction evaluation in real time.
2. **Backend (Python/Scikit-learn):** A lightweight Flask server running a trained **Gaussian Naïve Bayes** model to process statistical feature distributions and return instant class probabilities.

```text
  ┌─────────────────┐      HTTP POST (Email Text)     ┌──────────────────────┐
  │  React Frontend  │ ──────────────────────────────> │    Python Backend    │
  │   (Dashboard)   │ <────────────────────────────── │ (Scikit-learn Model) │
  └─────────────────┘     JSON (Label + Confidence)   └──────────────────────┘
