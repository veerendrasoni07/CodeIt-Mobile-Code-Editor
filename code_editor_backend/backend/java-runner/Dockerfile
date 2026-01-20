FROM eclipse-temurin:17-jdk-jammy


RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 && \
    rm -rf /var/lib/apt/lists/*


RUN useradd -m user_runner

USER user_runner

WORKDIR /app

COPY java-runner.py runner.py

ENTRYPOINT ["python3", "/app/runner.py"]
