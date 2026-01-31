# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory to /app
WORKDIR /app

# Install system dependencies for OpenCV and others
# Install system dependencies for OpenCV and others
# 'libgl1' and 'libglib2.0-0' are required for opencv-python on Debian Bookworm/Trixie
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the server directory contents into the container at /app/server
# We copy the whole directory to preserve structure for imports
COPY server /app/server

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt

# Make port 7860 available to the world outside this container
EXPOSE 7860

# Define environment variable
ENV PORT=7860

# Run main.py when the container launches
CMD ["python", "server/main.py"]
