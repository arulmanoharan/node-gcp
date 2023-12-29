# node-gcp
host node js app in GCP using Cloudsql, Secret Manager ,Container Registry and CloudRUN
# First Steps -
Store the env variables for github actions for GCP token , GCP Project ID and Secret Name.
Also Store a copy of github token in local

# Steps
First Terraform Scripts are Created to Deploy Cloudsql Instance and store the database values to secrets manager of GCP as a json format.
under the .tf script we have resources -
1. VPC for sql instance which has auto create subnet false and a subent resource for it, along with networking peering resource to connect to cloudsql
2. Cloudsql resource to create cloudsql instance along with its users and database, authrouzed network is set to 0.0.0.0/0 
3. Secret Manager which depends on cloudsql, to store public ip, db name , user name and password to secret

This Terraform Script is executed using Deploy_Cloudsql.yml -
This github workflow executes terraform plan and apply using the token and project id stored in Secrets of GithubRepo

Second Step is for node app and cloudrun to be executed - 
1. Created a basic node js app which uses the project id and secret name stored in githubrepo to retrieve secrets from secret manager of GCP and create cloudsql connection , then it adds these secrets to a table by either creating it or already using the existing one and display the values of table.
2. Using docker this node app is converted to image and pushed to Container Registry
3. cloudrun terraform script to deploy cloudrun by taking the last image of the provided container name and deploys it.

Using main.yml -
The above actions are done that are to create docker image and push it , retireve the image and deploy it to cloudrun using terraform.

The other action Deploy_Secret.yml and secret folder where test folder to work around with secret manager
During this I faced issues with node js app and cloud run not able to work together do to listener error which I solved by editing node js app and doing a trial and error , then issues with connecting to cloudsql .
