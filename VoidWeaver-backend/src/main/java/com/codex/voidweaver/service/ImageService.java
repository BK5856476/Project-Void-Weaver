package com.codex.voidweaver.service;

import com.codex.voidweaver.exception.ApiException;
import com.codex.voidweaver.model.dto.GenerateRequest;
import com.codex.voidweaver.model.dto.GenerateResponse;
import com.codex.voidweaver.model.enums.EngineType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * 图片生成服务 - 真正对接 Google Gemini Image Generation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageService {

    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(Duration.ofSeconds(30))
            .readTimeout(Duration.ofSeconds(120)) // 生成图片耗时较长
            .build();

    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    public GenerateResponse generateImage(GenerateRequest request) {
        log.info("Generating image with engine: {}", request.getEngine());

        if (request.getEngine() == EngineType.GOOGLE_IMAGEN) {
            return generateWithGoogleGemini(request);
        } else if (request.getEngine() == EngineType.NOVELAI) {
            return generateWithNovelAI(request);
        } else {
            throw new ApiException("Unsupported engine type: " + request.getEngine(), "INVALID_REQUEST");
        }
    }

    /**
     * 解析 Gemini 返回的图片数据
     */
    private GenerateResponse parseImageResponse(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode candidates = root.path("candidates");

        if (candidates.isEmpty()) {
            throw new ApiException("Gemini returned no candidates", "IMAGEN_ERROR");
        }

        // 提取 Part 里的 inlineData
        JsonNode parts = candidates.get(0).path("content").path("parts");
        for (JsonNode part : parts) {
            if (part.has("inlineData")) {
                String base64Data = part.path("inlineData").path("data").asText();
                return GenerateResponse.builder()
                        .imageData(base64Data)
                        .build();
            }
        }

        throw new ApiException("No image data found in response", "IMAGEN_ERROR");
    }

    /**
     * 使用 Google Gemini (Imagen) 进行图片生成
     */
    private GenerateResponse generateWithGoogleGemini(GenerateRequest request) {
        log.info("Generating with Google Gemini Image Gen...");

        // 从字段中获取 API Key
        String apiKey = request.getGoogleCredentials();
        if (apiKey == null || apiKey.isEmpty()) {
            throw new ApiException("Google API Key/Credentials is required", "INVALID_API_KEY");
        }

        try {
            Map<String, Object> bodyMap;
            String model = "gemini-2.5-flash-image"; // 默认 T2I 模型

            // 判断是否为 Img2Img (图片修改)
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                log.info("Switching to Img2Img mode (Multiturn Editing)...");
                model = "gemini-3-pro-image-preview"; // 文档要求使用此模型进行编辑

                // 构建 Img2Img 请求 (将原图作为用户输入的一部分)
                // User: "Instruction" + [Image]

                bodyMap = Map.of(
                        "contents", List.of(
                                Map.of(
                                        "role", "user",
                                        "parts", List.of(
                                                Map.of("text", request.getPrompt()), // 提示词
                                                Map.of(
                                                        "inline_data", Map.of(
                                                                "mime_type", "image/png",
                                                                "data", request.getImage()))))),
                        "generationConfig", Map.of(
                                "responseModalities", List.of("IMAGE")));
            } else {
                // 标准 T2I 生成
                bodyMap = Map.of(
                        "contents", List.of(Map.of(
                                "parts", List.of(Map.of("text", request.getPrompt())))),
                        "generationConfig", Map.of(
                                "responseModalities", List.of("IMAGE")));
            }

            String jsonBody = objectMapper.writeValueAsString(bodyMap);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

            Request httpRequest = new Request.Builder()
                    .url(url)
                    .addHeader("x-goog-api-key", apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(jsonBody, JSON))
                    .build();

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (!response.isSuccessful()) {
                    log.error("Google Image Gen Failed: {} - {}", response.code(), responseBody);
                    // Return the actual error message from Google
                    throw new ApiException("Google Error: " + responseBody, "IMAGEN_ERROR");
                }

                return parseImageResponse(responseBody);
            }

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to generate with Google: {}", e.getMessage(), e);
            throw new ApiException("Image generation failed: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    /**
     * 使用 NovelAI 进行图片生成
     */
    private GenerateResponse generateWithNovelAI(GenerateRequest request) {
        log.info("Generating with NovelAI V3...");

        String apiKey = request.getNovelaiApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            throw new ApiException("NovelAI API Key is required", "INVALID_API_KEY");
        }

        try {
            // 解析分辨率
            String[] dimensions = request.getResolution().split("x");
            int width = Integer.parseInt(dimensions[0]);
            int height = Integer.parseInt(dimensions[1]);

            // 构建 NovelAI 参数
            Map<String, Object> parameters = new java.util.HashMap<>();
            parameters.put("width", width);
            parameters.put("height", height);
            parameters.put("scale", request.getScale() != null ? request.getScale() : 6);
            parameters.put("sampler", "k_euler");
            parameters.put("steps", request.getSteps() != null ? request.getSteps() : 28);
            parameters.put("n_samples", 1);
            parameters.put("ucPreset", 0);
            parameters.put("qualityToggle", true);
            parameters.put("sm", false);
            parameters.put("sm_dyn", false);
            parameters.put("dynamic_thresholding", false);
            parameters.put("controlnet_strength", 1.0);
            parameters.put("legacy", false);
            parameters.put("add_original_image", false);
            parameters.put("cfg_rescale", 0.0);
            parameters.put("noise_schedule", "native");

            // Img2Img 特定参数
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                log.info("NovelAI Img2Img mode enabled");
                // NovelAI V3 使用 generate action 但带上 image 参数即可
                parameters.put("image", request.getImage());
                parameters.put("strength", request.getStrength() != null ? request.getStrength() : 0.7);
                parameters.put("noise", 0.0);
                parameters.put("extra_noise_seed", request.getSteps()); // Optional, just adding some entropy if needed,
                                                                        // but not required
            }

            // 构建 NovelAI 请求体
            Map<String, Object> bodyMap = new java.util.HashMap<>();
            bodyMap.put("input", request.getPrompt());
            bodyMap.put("model", "nai-diffusion-3");
            bodyMap.put("action", "generate"); // Always use generate for V3
            bodyMap.put("parameters", parameters);

            String jsonBody = objectMapper.writeValueAsString(bodyMap);
            String url = "https://image.novelai.net/ai/generate-image";

            Request httpRequest = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(jsonBody, JSON))
                    .build();

            try (Response response = httpClient.newCall(httpRequest).execute()) {
                if (!response.isSuccessful()) {
                    String error = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("NovelAI Gen Failed: {} - {}", response.code(), error);

                    String errorCode = "NOVELAI_ERROR";
                    if (response.code() == 401 || response.code() == 403)
                        errorCode = "INVALID_API_KEY";
                    if (response.code() == 429)
                        errorCode = "RATE_LIMITED";

                    throw new ApiException("NovelAI Error (" + response.code() + "): " + error, errorCode);
                }

                // NovelAI 返回 ZIP 文件，需要解压提取第一张图片
                byte[] zipData = response.body().bytes();
                String base64Image = extractFirstImageFromZip(zipData);

                return GenerateResponse.builder()
                        .imageData(base64Image)
                        .build();
            }

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to generate with NovelAI: {}", e.getMessage(), e);
            throw new ApiException("NovelAI generation failed: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    /**
     * 从 ZIP 文件中提取第一张图片并转为 Base64
     */
    private String extractFirstImageFromZip(byte[] zipData) throws Exception {
        try (java.io.ByteArrayInputStream bis = new java.io.ByteArrayInputStream(zipData);
                java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(bis)) {

            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory() && entry.getName().toLowerCase().endsWith(".png")) {
                    byte[] imageBytes = zis.readAllBytes();
                    return java.util.Base64.getEncoder().encodeToString(imageBytes);
                }
            }

            throw new ApiException("No image found in NovelAI response", "NOVELAI_ERROR");
        }
    }
}
