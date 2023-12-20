provider "google" {
  region      = var.region
}

resource "google_cloud_run_service" "my_service" {
  name     = "my-cloud-run-service"
  location = var.region  # Change this to your desired region

  template {
    spec {
      containers {
        image = var.image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}
