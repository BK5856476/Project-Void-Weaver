# Void Weaver 后端开发指南

> **技术栈**: Java Spring Boot 3.2+ / JDK 17+  
> **参考文档**: [API_SPEC.md](./API_SPEC.md)

---

## 1. 项目初始化

### 1.1 使用 Spring Initializr 创建项目

访问 https://start.spring.io 或使用 IDE 创建：

```
Project: Maven
Language: Java
Spring Boot: 3.2.x
Java: 17 或 21
Dependencies:
  - Spring Web
  - Lombok
  - Spring Boot DevTools (可选)
```

### 1.2 添加 Google GenAI SDK 依赖

在 `pom.xml` 中添加 Google GenAI SDK：

```xml
<dependencies>
  <!-- Spring Boot 依赖 -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
  
  <!-- Google GenAI SDK -->
  <dependency>
    <groupId>com.google.genai</groupId>
    <artifactId>google-genai</artifactId>
    <version>1.0.0</version>
  </dependency>
</dependencies>
```

> **注意**: Google GenAI SDK 会自动从环境变量 `GEMINI_API_KEY` 读取 API Key。但在本项目中，我们从前端请求中获取 API Key，因此需要手动传递。

### 1.3 推荐项目结构

```
VoidWeaver-backend/
└── src/main/java/com/voidweaver/
    ├── VoidWeaverApplication.java       # 启动入口
    ├── config/
    │   ├── CorsConfig.java              # CORS 跨域配置
    │   └── RestClientConfig.java        # HTTP 客户端配置
    ├── controller/
    │   ├── AnalyzeController.java       # /api/analyze
    │   ├── GenerateController.java      # /api/generate
    │   └── RefineController.java        # /api/refine
    ├── service/
    │   ├── GeminiService.java           # Gemini API 调用
    │   ├── NovelAIService.java          # NovelAI API 调用
    │   ├── ImagenService.java           # Google Imagen 调用
    │   └── PromptService.java           # Prompt 格式化
    ├── dto/
    │   ├── request/
    │   │   ├── AnalyzeRequest.java
    │   │   ├── GenerateRequest.java
    │   │   └── RefineRequest.java
    │   └── response/
    │       ├── AnalyzeResponse.java
    │       ├── GenerateResponse.java
    │       └── RefineResponse.java
    ├── model/
    │   ├── ModuleDto.java
    │   ├── TagDto.java
    │   └── ModuleType.java              # 枚举
    └── exception/
        ├── GlobalExceptionHandler.java  # 全局异常处理
        └── ApiException.java            # 自定义异常
```

---

## 2. 核心模型定义

### 2.1 TagDto.java

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagDto {
    private String id;
    private String text;
    private Double weight;  // 0.5 - 5.0, 默认 1.0
}
```

### 2.2 ModuleDto.java

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDto {
    private String name;         // style, subject, pose, etc.
    private String displayName;
    private Boolean locked;
    private List<TagDto> tags;
}
```

### 2.3 ModuleType.java (枚举)

```java
public enum ModuleType {
    STYLE("style", "Style"),
    SUBJECT("subject", "Subject"),
    POSE("pose", "Pose"),
    COSTUME("costume", "Costume"),
    BACKGROUND("background", "Background"),
    COMPOSITION("composition", "Composition"),
    ATMOSPHERE("atmosphere", "Atmosphere"),
    EXTRA("extra", "Extra Description");

    private final String name;
    private final String displayName;
    
    // constructor, getters...
}
```

---

## 3. 三个 Controller 实现

### 3.1 AnalyzeController.java

```java
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyzeController {

    private final GeminiService geminiService;

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyzeRequest request) {
        // 1. 验证请求
        if (request.getImageData() == null || request.getImageData().isEmpty()) {
            throw new ApiException("imageData is required");
        }
        if (request.getGeminiApiKey() == null || request.getGeminiApiKey().isEmpty()) {
            throw new ApiException("geminiApiKey is required");
        }

        // 2. 调用 Gemini 分析图片
        return geminiService.analyzeImage(
            request.getImageData(),
            request.getGeminiApiKey()
        );
    }
}
```

### 3.2 GenerateController.java

```java
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GenerateController {

    private final NovelAIService novelAIService;
    private final ImagenService imagenService;

    @PostMapping("/generate")
    public GenerateResponse generate(@RequestBody GenerateRequest request) {
        // 验证请求参数
        validateRequest(request);

        // 根据引擎类型调用不同服务
        String imageData;
        if ("novelai".equals(request.getEngine())) {
            imageData = novelAIService.generate(request);
        } else if ("google-imagen".equals(request.getEngine())) {
            imageData = imagenService.generate(request);
        } else {
            throw new ApiException("Unsupported engine: " + request.getEngine());
        }

        return GenerateResponse.builder()
            .imageData(imageData)
            .build();
    }
}
```

### 3.3 RefineController.java

```java
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RefineController {

    private final GeminiService geminiService;

    @PostMapping("/refine")
    public RefineResponse refine(@RequestBody RefineRequest request) {
        // 只处理未锁定的模块
        List<ModuleDto> unlockedModules = request.getModules().stream()
            .filter(m -> !Boolean.TRUE.equals(m.getLocked()))
            .collect(Collectors.toList());

        // 调用 Gemini 更新模块
        List<ModuleDto> updatedModules = geminiService.refineModules(
            unlockedModules,
            request.getInstruction(),
            request.getGeminiApiKey()
        );

        return RefineResponse.builder()
            .modules(updatedModules)
            .build();
    }
}
```

---

## 4. GeminiService 实现（核心）

### 4.1 使用 Google GenAI SDK

```java
@Service
public class GeminiService {

    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 分析图片 - 使用 Gemini Vision API 提取 8 个模块
     */
    public AnalyzeResponse analyzeImage(String imageData, String apiKey) {
        try {
            // 创建 Gemini 客户端（手动传入 API Key）
            Client client = new Client.Builder()
                .apiKey(apiKey)
                .build();

            // 构建请求内容
            Content content = Content.newBuilder()
                .addPart(Part.newBuilder().setText(ANALYZE_SYSTEM_PROMPT))
                .addPart(Part.newBuilder()
                    .setInlineData(Blob.newBuilder()
                        .setMimeType("image/png")
                        .setData(ByteString.copyFrom(Base64.getDecoder().decode(imageData)))
                        .build())
                    .build())
                .build();

            // 配置生成参数（强制 JSON 输出）
            GenerationConfig config = GenerationConfig.newBuilder()
                .setResponseMimeType("application/json")
                .build();

            // 调用 Gemini API
            GenerateContentResponse response = client.models()
                .generateContent("gemini-2.0-flash-exp", content, config);

            // 解析 JSON 响应
            String jsonResponse = response.text();
            return objectMapper.readValue(jsonResponse, AnalyzeResponse.class);

        } catch (Exception e) {
            throw new ApiException("Gemini API 调用失败: " + e.getMessage());
        }
    }

    /**
     * 精炼模块 - 使用自然语言指令更新未锁定的模块
     */
    public List<ModuleDto> refineModules(
        List<ModuleDto> unlockedModules, 
        String instruction, 
        String apiKey
    ) {
        try {
            Client client = new Client.Builder()
                .apiKey(apiKey)
                .build();

            // 构建 System Prompt
            String refinePrompt = buildRefinePrompt(unlockedModules, instruction);

            // 调用 Gemini
            GenerateContentResponse response = client.models()
                .generateContent(
                    "gemini-2.0-flash-exp",
                    refinePrompt,
                    GenerationConfig.newBuilder()
                        .setResponseMimeType("application/json")
                        .build()
                );

            // 解析响应
            String jsonResponse = response.text();
            RefineResponse refineResponse = objectMapper.readValue(
                jsonResponse, 
                RefineResponse.class
            );

            return refineResponse.getModules();

        } catch (Exception e) {
            throw new ApiException("Gemini Refine 失败: " + e.getMessage());
        }
    }

    /**
     * 构建精炼指令的 System Prompt
     */
    private String buildRefinePrompt(List<ModuleDto> modules, String instruction) {
        try {
            String modulesJson = objectMapper.writeValueAsString(modules);
            return String.format(REFINE_SYSTEM_PROMPT, instruction, modulesJson);
        } catch (Exception e) {
            throw new ApiException("构建 Prompt 失败: " + e.getMessage());
        }
    }

    // System Prompts
    private static final String ANALYZE_SYSTEM_PROMPT = """
        You are an expert image analyst. Analyze the given image and extract descriptive tags into 8 categories.
        
        Return a JSON object with this exact structure:
        {
          "modules": [
            {
              "name": "style",
              "displayName": "Style",
              "locked": false,
              "tags": [{"id": "uuid", "text": "tag text", "weight": 1.0}]
            },
            // ... 8 modules total
          ],
          "rawPrompt": "all tags joined as comma-separated string"
        }
        
        The 8 modules are:
        1. style - Art style, artistic references
        2. subject - Main character/object
        3. pose - Action, posture, viewing angle
        4. costume - Clothing, accessories
        5. background - Scene, location
        6. composition - Camera angle, framing
        7. atmosphere - Lighting, mood
        8. extra - Additional details
        
        Generate unique UUIDs for each tag ID.
        Return ONLY valid JSON, no markdown.
        """;

    private static final String REFINE_SYSTEM_PROMPT = """
        You are an AI prompt editor. Update the following modules according to the user instruction.
        
        User instruction: %s
        
        Current modules: %s
        
        Return a JSON object with:
        {
          "modules": [updated modules with same structure]
        }
        
        Keep the same structure: name, displayName, locked, tags.
        Generate new UUIDs for modified tags.
        Return ONLY valid JSON.
        """;
}
```

### 4.2 方法二：使用 REST API（备选方案）

如果 Google GenAI SDK 有问题，可以使用传统的 REST API 方式：

```java
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AnalyzeResponse analyzeImage(String imageData, String apiKey) {
        // Gemini API endpoint
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + apiKey;

        // 构建请求体
        Map<String, Object> requestBody = buildAnalyzeRequest(imageData);

        // 发送请求
        String response = restClient.post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .body(requestBody)
            .retrieve()
            .body(String.class);

        // 解析响应
        return parseGeminiResponse(response);
    }

    private Map<String, Object> buildAnalyzeRequest(String imageData) {
        return Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(
                    Map.of("text", ANALYZE_SYSTEM_PROMPT),
                    Map.of("inlineData", Map.of(
                        "mimeType", "image/png",
                        "data", imageData
                    ))
                )
            )),
            "generationConfig", Map.of(
                "responseMimeType", "application/json"
            )
        );
    }
}
```

---

## 5. NovelAIService 实现

```java
@Service
@RequiredArgsConstructor
public class NovelAIService {

    private final RestClient restClient;
    private static final String NAI_API_URL = "https://image.novelai.net/ai/generate-image";

    public String generate(GenerateRequest request) {
        // 解析分辨率
        String[] dims = request.getResolution().split("x");
        int width = Integer.parseInt(dims[0]);
        int height = Integer.parseInt(dims[1]);

        // 构建 NAI 请求体
        Map<String, Object> naiRequest = Map.of(
            "input", request.getPrompt(),
            "model", "nai-diffusion-3",
            "action", "generate",
            "parameters", Map.of(
                "width", width,
                "height", height,
                "scale", request.getScale(),
                "sampler", "k_euler",
                "steps", request.getSteps(),
                "n_samples", 1,
                "ucPreset", 0,
                "qualityToggle", true,
                "negative_prompt", "lowres, bad anatomy, bad hands, text, error"
            )
        );

        // 发送请求
        byte[] imageBytes = restClient.post()
            .uri(NAI_API_URL)
            .header("Authorization", "Bearer " + request.getNovelaiApiKey())
            .contentType(MediaType.APPLICATION_JSON)
            .body(naiRequest)
            .retrieve()
            .body(byte[].class);

        // 返回 Base64
        return Base64.getEncoder().encodeToString(imageBytes);
    }
}
```

---

## 6. CORS 配置

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",        // Vite dev
                "http://localhost:3000",
                "https://void-weaver.vercel.app"
            )
            .allowedMethods("GET", "POST", "OPTIONS")
            .allowedHeaders("*")
            .maxAge(3600);
    }
}
```

---

## 7. 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", true,
            "message", e.getMessage(),
            "code", "API_ERROR"
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception e) {
        return ResponseEntity.internalServerError().body(Map.of(
            "error", true,
            "message", "Internal server error: " + e.getMessage(),
            "code", "INTERNAL_ERROR"
        ));
    }
}
```

---

## 8. 开发顺序建议

| 优先级 | 任务 | 预计时间 |
|--------|------|----------|
| P0 | 1. 项目初始化 + DTO 定义 | 30min |
| P0 | 2. CORS 配置 | 10min |
| P0 | 3. `/api/analyze` + GeminiService | 2h |
| P0 | 4. `/api/generate` + NovelAIService | 2h |
| P1 | 5. `/api/refine` (Gemini 二次调用) | 1h |
| P1 | 6. Google Imagen 集成 | 2h |
| P2 | 7. 异常处理优化 | 30min |
| P2 | 8. 单元测试 | 1h |

**建议先实现 `/api/analyze`**，因为这是最核心的功能，可以立即与前端联调测试。

---

## 9. 本地测试命令

```bash
# 启动后端 (默认端口 8080)
mvn spring-boot:run

# 或使用 Gradle
./gradlew bootRun
```

前端已配置好连接 `http://localhost:8080/api`，启动后端后前端可直接联调。

---

## 10. 关键注意事项

1. **Gemini JSON Mode**: 使用 `responseMimeType: "application/json"` 强制 JSON 输出
2. **NovelAI 返回格式**: 返回的是 ZIP 或二进制图片，需要处理
3. **Base64 前缀**: 前端期望 `imageData` 不含 `data:image/png;base64,` 前缀
4. **超时配置**: 图片生成可能需要 60-120 秒，配置足够的超时时间
5. **API Key 不要存储**: 每次请求都由前端传入，后端只做转发
