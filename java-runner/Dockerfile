FROM openjdk:17-slim

RUN apt-get update && apt-get install -y --no-install-recommends bash jq coreutils && rm -rf /var/lib/apt/lists/*

RUN useradd -m user_runner

USER user_runner

WORKDIR /app

COPY runner.sh .

ENTRYPOINT ["/bin/bash", "runner.sh"]
