provider "google" {
  credentials = file(var.gcp_credentials_file)
  project     = var.project_id
  region      = "asia-east1"
}

resource "google_cloud_run_service" "my_cloud_run_service" {
  name     = "node_gcp_cloud_run"
  location = "asia-east1"

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/node_app:${var.image_tag}"
      }
    }
  }
}

variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "gcp_credentials_file" {
  description = "Path to the Google Cloud service account key file"
  type        = string
}

variable "image_tag" {
  description = "The Docker image tag to deploy"
  type        = string
}
