provider "google" {
  credentials = file("key2.json")
  project     = var.project_id
  region      = "us-central1" # or your desired region
}

resource "google_secret_manager_secret" "cloud_sql_secrets" {
  count = 1

  secret_id = "cloud-sql-secrets"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "cloud_sql_secrets_version" {
  count = 1

  secret_id = google_secret_manager_secret.cloud_sql_secrets.id

  secret_data = {
    hostname   = "your-cloud-sql-hostname"
    username   = "your-cloud-sql-username"
    password   = "your-cloud-sql-password"
    database   = "your-cloud-sql-database"
  }
}


variable "project_id" {
    type = string
}