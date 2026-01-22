# Void Weaver Backend

**Rewrite the World Protocol** - Spring Boot backend for AI art generation workstation

## 🚀 Tech Stack

- **Java 17** - Modern Java LTS version
- **Spring Boot 3.2** - Latest Spring framework
- **OkHttp** - HTTP client for AI API calls
- **Lombok** - Reduce boilerplate code
- **Jackson** - JSON processing
- **Google Vertex AI** - Gemini integration
- **Maven** - Dependency management

## 📦 Installation

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Or run the JAR directly
java -jar target/voidweaver-1.0.0.jar
```

The server will start on `http://localhost:8080`

## 🔧 Configuration

Edit `src/main/resources/application.properties`:

```properties
server.port=8080
logging.level.com.codex.voidweaver=DEBUG
```

## 📁 Project Structure

```
src/main/java/com/codex/voidweaver/
├── config/              # Configuration classes
│   ├── CorsConfig.java
│   └── HttpClientConfig.java
├── controller/          # REST API endpoints
│   ├── AnalysisController.java
│   ├── GenerateController.java
│   └── RefineController.java
├── service/             # Business logic
│   ├── GeminiService.java
│   └── ImageService.java
├── model/
│   ├── dto/             # Data Transfer Objects
│   └── enums/           # Enumerations
├── utils/               # Utility classes
│   └── PromptFormatter.java
└── VoidWeaverApplication.java
```

## 🌐 API Endpoints

### POST `/api/analyze`
Analyze image with Gemini and extract 7 prompt modules

**Request:**
```json
{
  "imageData": "base64_encoded_image",
  "geminiApiKey": "your_gemini_api_key"
}
```

**Response:**
```json
{
  "modules": [...],
  "rawPrompt": "complete prompt string"
}
```

### POST `/api/generate`
Generate image with NovelAI or Google Imagen

**Request:**
```json
{
  "prompt": "formatted prompt",
  "engine": "NOVELAI",
  "novelaiApiKey": "your_key",
  "resolution": "832x1216",
  "steps": 28,
  "scale": 6
}
```

**Response:**
```json
{
  "imageData": "base64_encoded_generated_image"
}
```

### POST `/api/refine`
Refine modules with natural language instruction

**Request:**
```json
{
  "modules": [...],
  "instruction": "change background to cyberpunk city",
  "geminiApiKey": "your_gemini_api_key"
}
```

**Response:**
```json
{
  "modules": [...]
}
```

## 🔒 Security

- **CORS** - Configured for Vercel frontend and localhost
- **BYOK Model** - No API keys stored server-side
- **Stateless** - No database, memory-only architecture
- **Validation** - Request validation with Jakarta Bean Validation

## 🚢 Deployment

Deploy to Railway:

1. Connect your GitHub repository
2. Railway will auto-detect Spring Boot
3. Set environment variables if needed
4. Deploy!

Or build a JAR and deploy anywhere:

```bash
mvn clean package
java -jar target/voidweaver-1.0.0.jar
```

## 📝 Development Notes

- **RESTful API** - Strict REST design principles
- **Clean Architecture** - Separation of concerns (Controller → Service → Util)
- **Lombok** - All DTOs use `@Data`, `@Builder` annotations
- **Logging** - SLF4J with Logback for comprehensive logging

## 🔧 TODO

- [ ] Implement actual Gemini API integration
- [ ] Implement NovelAI API integration
- [ ] Implement Google Imagen API integration
- [ ] Add error handling and retry logic
- [ ] Add request/response logging
- [ ] Add metrics and monitoring

---

Built with ☕ by the Void Weaver team
