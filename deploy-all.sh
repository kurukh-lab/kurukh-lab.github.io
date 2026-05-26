#!/bin/bash
# Stop execution if any command fails
set -e

echo "🚀 Starting Full Production Deployment..."

echo ""
echo "----------------------------------------"
echo "📦 1/4: Deploying Typesense to GCP VM"
echo "----------------------------------------"
echo "Uploading deployment config to VM..."
gcloud compute scp --recurse gcp-deployment typesense-vm:~ --zone us-central1-f

echo "Starting/Updating Docker containers on VM..."
gcloud compute ssh typesense-vm --zone us-central1-f --command="cd gcp-deployment && sudo docker compose -f docker-compose.prod.yml pull && sudo docker compose -f docker-compose.prod.yml up -d"

echo ""
echo "----------------------------------------"
echo "🗄️  2/4: Checking Google Cloud Credentials"
echo "----------------------------------------"
# Check if ADC credentials are valid
if ! gcloud auth application-default print-access-token &> /dev/null; then
    echo "⚠️ Application Default Credentials expired or missing."
    echo "Opening browser to authenticate..."
    gcloud auth application-default login
else
    echo "✅ Credentials are valid."
fi

echo ""
echo "----------------------------------------"
echo "🔍 3/4: Indexing Firestore data into Typesense"
echo "----------------------------------------"
# Extract the API key directly from the environment file we created earlier
API_KEY=$(grep TYPESENSE_API_KEY gcp-deployment/.env | cut -d '=' -f2)

# Export the required variables for the indexing script
export TYPESENSE_HOST="34.9.2.35.nip.io"
export TYPESENSE_PORT="443"
export TYPESENSE_PROTOCOL="https"
export TYPESENSE_API_KEY=$API_KEY

echo "Running indexing script..."
npm run typesense:index:production

echo ""
echo "----------------------------------------"
echo "🌐 4/4: Building and Deploying UI to Firebase"
echo "----------------------------------------"
echo "Building Vite App and deploying to Firebase Hosting..."
npm run deploy

echo ""
echo "🎉✅ Full Deployment Complete!"
