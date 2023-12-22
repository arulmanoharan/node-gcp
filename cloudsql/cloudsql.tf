provider "google" {
  credentials = file("../key2.json")
  project     = var.project_id
  region      = "asia-south1" 
}
resource "google_compute_network" "cloud_network" {
  name = "cloudsql-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "cloud_subnetwork" {
  name          = "subnetwork"
  network       = google_compute_network.cloud_network.self_link
  ip_cidr_range = "10.0.0.0/24"  # Replace with your desired CIDR range
  region        = "asia-east1"
}

resource "google_compute_global_address" "private_address" {
  name          = "private-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.cloud_network.self_link
}

resource "google_service_networking_connection" "private_service_connection" {
  network       = google_compute_network.cloud_network.self_link
  service       = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [
    google_compute_global_address.private_address.name
  ]
}

resource "google_sql_database_instance" "cloudsql" {
  name             = var.cloudsqlname
  database_version = "MYSQL_8_0"
  region = "asia-south1"
  depends_on = [google_service_networking_connection.private_service_connection]
  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.cloud_network.self_link
      authorized_networks {
          name = "default"
          value = "0.0.0.0/0"
        }
    
    }
  }
  deletion_protection = false
}

resource "google_sql_database" "cloudsqldb" {
  name     = var.dbname
  instance = google_sql_database_instance.cloudsql.name
}

resource "google_sql_user" "cloudsqluser" {
  name     = var.username
  instance = google_sql_database_instance.cloudsql.name
  password = var.password
}


resource "google_secret_manager_secret" "cloudsql_secret" {
  depends_on = [ google_sql_database.cloudsqldb ]
  secret_id = var.secret_id
  replication {
    auto {
      
    }
  }
}

resource "google_secret_manager_secret_version" "cloudsql_secret_version" {
  secret    = google_secret_manager_secret.cloudsql_secret.name
  secret_data = <<EOT
{
  "connection_name": "${google_sql_database_instance.cloudsql.ip_address[0].ip_address}",
  "database_name":   "${google_sql_database.cloudsqldb.name}",
  "username":        "${google_sql_user.cloudsqluser.name}",
  "password":        "${google_sql_user.cloudsqluser.password}"
}
EOT

}