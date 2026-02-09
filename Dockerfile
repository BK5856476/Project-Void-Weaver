# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend

# Copy frontend source
COPY VoidWeaver-frontend/package.json VoidWeaver-frontend/package-lock.json ./
RUN npm ci

COPY VoidWeaver-frontend/ ./

# Build frontend with relative paths for assets
# Setting VITE_API_URL to /api allows the frontend to talk to the backend on the same domain
RUN VITE_API_URL=/api npm run build

# Stage 2: Build Backend
FROM maven:3.9-eclipse-temurin-17-alpine as backend-builder
WORKDIR /app/backend

# Copy backend source
COPY VoidWeaver-backend/pom.xml .
# Download dependencies first to cache them
RUN mvn dependency:go-offline -B

COPY VoidWeaver-backend/src ./src

# Copy built frontend assets to Spring Boot static resources directory
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Build backend JAR
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from the backend-builder stage
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
