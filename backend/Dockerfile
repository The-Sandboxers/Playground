# Python Image used for backend
FROM python:3.11

# Set working directory inside container
WORKDIR /app

COPY requirements.txt .

# Install dependencies
# May want to add --no-cache-dir once in production
RUN pip install -r requirements.txt

# Copies backend folder into container
COPY . .

# Expose port that Flask is on
EXPOSE 5000

# Insert Migrations and run Flask app
CMD ["sh", "-c", "flask db upgrade && python bonsai_load.py && python app.py"]