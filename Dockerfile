# ---------- Build stage ----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# 👇 Chemins corrigés
COPY backend/pom.xml .
COPY backend/src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN apk add --no-cache mysql-client postgresql-client bash
RUN mkdir -p /app/data /app/backups

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]