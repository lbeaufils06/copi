# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-jammy

ARG POSTGRES_CLIENT_MAJOR=16

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        gosu \
        gnupg \
        mariadb-client \
        wget && \
    mkdir -p /usr/share/postgresql-common/pgdg && \
    wget -qO /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
        https://www.postgresql.org/media/keys/ACCC4CF8.asc && \
    echo "deb [ signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc ] \
        https://apt.postgresql.org/pub/repos/apt jammy-pgdg main" \
        | tee /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        "postgresql-client-${POSTGRES_CLIENT_MAJOR}" && \
    ln -s "/usr/lib/postgresql/${POSTGRES_CLIENT_MAJOR}/bin/pg_dump" \
        /usr/local/bin/postgresql-pg-dump && \
    ln -s "/usr/lib/postgresql/${POSTGRES_CLIENT_MAJOR}/bin/pg_dumpall" \
        /usr/local/bin/postgresql-pg-dumpall && \
    postgresql-pg-dump --version && \
    postgresql-pg-dumpall --version && \
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
