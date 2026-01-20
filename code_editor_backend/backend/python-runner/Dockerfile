FROM python:3.10-slim

RUN useradd -m runner_user
USER runner_user

WORKDIR /app

COPY runner.py .

ENTRYPOINT ["python", "/app/runner.py"]
