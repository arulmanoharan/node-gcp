provider "google" {
  credentials = file("key2.json")
  project     = var.project_id
  region      = "asia-south1"
}
data "google_secret_manager_secret" "my_secret" {
  project    = var.project_id
  secret_id  = "cloudsql-secrets"
}

data "google_secret_manager_secret_version" "my_secret" {
  secret= data.google_secret_manager_secret.my_secret.name
}

resource "google_cloud_run_service" "my_cloud_run_service" {
  name     = "nodegcp-cloudrun"
  location = "asia-south1"

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/${var.secretname}:${var.image_tag}"
        ports{
         container_port = 3000
         }
         env  { name  = "DB_SECRET"
               value = data.google_secret_manager_secret_version.my_secret.secret_data
              }

        }
    
    }
   metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = "1"
      }
    }
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.my_cloud_run_service.location
  project     = google_cloud_run_service.my_cloud_run_service.project
  service     = google_cloud_run_service.my_cloud_run_service.name

  policy_data = data.google_iam_policy.noauth.policy_data
}


variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

# variable "gcp_credentials_file" {
#   description = "Path to the Google Cloud service account key file"
#   type        = string
# }

variable "image_tag" {
  description = "The Docker image tag to deploy"
  type        = string
}

variable "secretname" {
  description = "The conatiner name"
  type        = string
}
