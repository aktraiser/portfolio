FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

CMD ["hypercorn", "--bind", "0.0.0.0:5003", "--workers", "4", "src.app:app"] 