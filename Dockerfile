# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# 👇 Chemins corrigés
COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN apt-get update && \
    apt-get install -y default-mysql-client postgresql-client && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/data /app/backups

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]