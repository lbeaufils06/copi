# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        gnupg \
        mariadb-client \
        postgresql-client \
        wget && \
    mkdir -p /opt/mysql-client && \
    cd /tmp && \
    apt-get download mysql-client-core-8.0 && \
    dpkg-deb -x mysql-client-core-8.0_*.deb /opt/mysql-client && \
    test -x /opt/mysql-client/usr/bin/mysqldump && \
    ln -s /opt/mysql-client/usr/bin/mysqldump /usr/local/bin/mysql-mysqldump && \
    mysql-mysqldump --version && \
    mariadb-dump --version && \
    rm -f mysql-client-core-8.0_*.deb && \
    wget -qO - https://pgp.mongodb.com/server-7.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg && \
    echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
    https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-database-tools && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /config /app/backups

COPY --from=build /app/target/*.jar /app/app.jar
COPY .docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
