# Hugging Face Spaces Docker Configuration
FROM python:3.10-slim

# Create non-root user (required by HuggingFace)
RUN useradd -m -u 1000 user
ENV HOME=/home/user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install system dependencies as root
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Create directories as root BEFORE switching user
RUN mkdir -p /app/storage/uploads /app/storage/processed && \
    chown -R user:user /app

# Switch to non-root user
USER user

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy the rest of the application
COPY --chown=user . /app

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
