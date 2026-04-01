# Stage 1: Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend build
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app
COPY gradlew ./
COPY gradle/ gradle/
RUN chmod +x gradlew
COPY build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon -q 2>/dev/null || true
COPY src/ src/
COPY --from=frontend-build /app/frontend/dist src/main/resources/static/
RUN ./gradlew bootJar -x test --no-daemon

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT java -jar app.jar --server.port=${PORT:-8080}
