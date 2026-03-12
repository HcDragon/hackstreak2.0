#!/bin/bash

echo "🏥 Starting Smart Healthcare System Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create media directory if it doesn't exist
mkdir -p media/qr_codes

# Run migrations
echo "Running database migrations..."
python3 manage.py migrate --no-input

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🚀 Starting Django development server..."
echo "📡 API will be available at: http://localhost:8000/api/"
echo "🔧 Admin panel at: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start server
python3 manage.py runserver
