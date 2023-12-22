provider "google" {
  credentials = file("../key2.json")
  project     = var.project_id
  region      = "asia-south1" 
}


resource "google_secret_manager_secret" "cloudsql_secret" {
  
  secret_id = "cloudsql-secrets"
  replication {
    auto {
      
    }
  }
}

resource "google_secret_manager_secret_version" "cloudsql_secret_version" {
  secret    = google_secret_manager_secret.cloudsql_secret.name
  secret_data = <<EOT
{
  "connection_name": "hostname",
  "database_name":   "user",
  "username":        "pwd",
  "password":        "pwd"
}
EOT

}
