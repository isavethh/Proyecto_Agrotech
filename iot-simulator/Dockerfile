FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV API_URL=http://backend:3001/api/v1
ENV IOT_API_KEY=iot-secret-key-2024
ENV INTERVAL_SECONDS=60

CMD ["python", "simulator.py"]
