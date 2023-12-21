provider "google" {
  credentials = file("../key2.json")
  project     = var.project_id
  region      = "asia-east1" 
}


resource "google_secret_manager_secret" "cloud_sql_secrets" {
  
  for_each  = var.secrets
  secret_id = each.value.name
  replication {
    auto {
      
    }
  }
}

resource "google_secret_manager_secret_version" "hostname" {
  for_each  = var.secrets
  secret      = google_secret_manager_secret.cloud_sql_secrets[each.key].id
  secret_data = each.value.secret_data
}

