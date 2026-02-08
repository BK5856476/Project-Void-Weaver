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

import java.util.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
            log.error("Gemini returned no candidates. Full response: {}", json);
            throw new ApiException("Gemini returned no candidates. Response: " + json, "IMAGEN_ERROR");
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

        log.error("No image data in response. Full response: {}", json);
        throw new ApiException("No image data found. Response: " + json, "IMAGEN_ERROR");
    }

    /**
     * Preprocess the prompt for Gemini:
     * Convert "weight::text::" format to natural language descriptors.
     * Example: "1.5::cat::" -> "highly detailed cat"
     */
    private String processGeminiPrompt(String prompt) {
        if (prompt == null || prompt.isEmpty()) {
            return prompt;
        }

        // Regex to match "weight::text::"
        // Groups: 1 = weight (number), 2 = text
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+(?:\\.\\d+)?)::(.*?)::");
        java.util.regex.Matcher matcher = pattern.matcher(prompt);

        StringBuilder sb = new StringBuilder();
        int lastEnd = 0;

        while (matcher.find()) {
            // Append text before the match
            sb.append(prompt, lastEnd, matcher.start());

            try {
                double weight = Double.parseDouble(matcher.group(1));
                String text = matcher.group(2).trim();
                String descriptors = "";

                if (weight >= 2.0) {
                    descriptors = "extremely detailed, emphasized " + text;
                } else if (weight >= 1.5) {
                    descriptors = "highly detailed, " + text;
                } else if (weight >= 1.2) {
                    descriptors = "detailed, " + text;
                } else if (weight >= 0.9) {
                    descriptors = text; // Normal weight
                } else if (weight >= 0.8) {
                    descriptors = "subtle " + text;
                } else {
                    descriptors = "faint, slightly visible " + text;
                }
                sb.append(descriptors);

            } catch (NumberFormatException e) {
                // If weight parsing fails, just append original text
                sb.append(matcher.group(0));
            }

            lastEnd = matcher.end();
        }

        // Append remaining text
        sb.append(prompt.substring(lastEnd));

        return sb.toString();
    }

    private final GeminiService geminiService;

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

        // Deep Thinking Logic - Blocking Fallback (deprecated, use stream)
        if (Boolean.TRUE.equals(request.getDeepThinking())) {
            return generateWithDeepThinking(request, apiKey);
        }

        // Standard Generation
        // Preprocess prompt for weighting
        String originalPrompt = request.getPrompt();
        String processedPrompt = processGeminiPrompt(originalPrompt);
        log.info("Original Prompt: {}", originalPrompt);
        log.info("Processed Prompt (Weighted): {}", processedPrompt);

        return internalGenerateGemini(processedPrompt, request.getImage(), apiKey, "gemini-3-pro-image-preview");
    }

    /**
     * Deep Thinking Workflow - Blocking Version (Legacy/Fallback)
     */
    private GenerateResponse generateWithDeepThinking(GenerateRequest request, String apiKey) {
        log.info("Starting Deep Thinking Mode (Blocking)...");
        List<String> thinkingLog = new ArrayList<>();

        // Step 1: Generate Sketch
        thinkingLog.add("Phase 1: Manifesting initial concept sketch...");
        GenerateResponse sketchResponse = internalGenerateGemini(request.getPrompt(), null, apiKey,
                "gemini-3-pro-image-preview");
        String sketchImage = sketchResponse.getImageData();
        thinkingLog.add("Sketch generated.");

        // Step 2: Vision Analysis
        thinkingLog.add("Phase 2: Analyzing visual structure and composition...");
        String critique = geminiService.critiqueImage(sketchImage, request.getPrompt(), apiKey);
        thinkingLog.add("Critique: " + critique);

        // Step 3: Style/Concept Expansion
        thinkingLog.add("Phase 3: Consulting Void Archives for artistic styles...");
        String styleTags = geminiService.suggestStyleTags(request.getPrompt(), apiKey);
        thinkingLog.add("Identified Style Tags: " + styleTags);

        // Step 4: Construct Optimized Prompt
        thinkingLog.add("Phase 4: Refining generation matrix...");

        // Style Injection for "Hand-drawn" feel
        String positiveStyle = "rough brushstrokes, visible grain, noise, traditional media texture, uneven lines, sketchy, impasto, masterpiece, aesthetic";
        String negativeStyle = "digital smoothing, polished, CGI, glossy, flat coloring, 3d render, plastic";

        String refinedPrompt = String.format("%s, %s, 2::%s::, 1.5::%s::. Avoid: %s",
                request.getPrompt(), positiveStyle, critique, styleTags, negativeStyle);

        String processedRefinedPrompt = processGeminiPrompt(refinedPrompt);

        // Step 5: Final Generation
        thinkingLog.add("Phase 5: Final manifestation...");
        GenerateResponse finalResponse = internalGenerateGemini(processedRefinedPrompt, request.getImage(), apiKey,
                "gemini-3-pro-image-preview");

        finalResponse.setSketchImage(sketchImage);
        finalResponse.setThinkingLog(thinkingLog);

        return finalResponse;
    }

    /**
     * Deep Thinking Workflow
     */
    public void generateImageStream(GenerateRequest request, SseEmitter emitter) {
        log.info("Streaming image generation for engine: {}", request.getEngine());
        try {
            if (request.getEngine() == EngineType.GOOGLE_IMAGEN) {
                if (Boolean.TRUE.equals(request.getDeepThinking())) {
                    generateWithDeepThinkingStream(request, request.getGoogleCredentials(), emitter);
                } else {
                    // Normal generation, just emit one result
                    GenerateResponse response = generateWithGoogleGemini(request);
                    emitter.send(SseEmitter.event().name("result").data(response));
                    emitter.complete();
                }
            } else {
                // NovelAI doesn't support deep thinking stream yet, just return result
                GenerateResponse response = generateImage(request);
                emitter.send(SseEmitter.event().name("result").data(response));
                emitter.complete();
            }
        } catch (Exception e) {
            log.error("Streaming error: {}", e.getMessage(), e);
            try {
                emitter.send(SseEmitter.event().name("error").data("Generation failed: " + e.getMessage()));
                emitter.completeWithError(e);
            } catch (Exception ex) {
                // Ignore
            }
        }
    }

    private void generateWithDeepThinkingStream(GenerateRequest request, String apiKey, SseEmitter emitter)
            throws Exception {
        log.info("Starting Deep Thinking Stream...");
        List<String> thinkingLog = new ArrayList<>();

        // Helper to send log events
        Runnable sendLog = () -> {
            try {
                String lastLog = thinkingLog.get(thinkingLog.size() - 1);
                emitter.send(SseEmitter.event().name("log").data(lastLog));
            } catch (Exception e) {
                log.error("Failed to send log event", e);
            }
        };

        // Step 1: Generate Sketch
        String step1 = "Phase 1: Manifesting initial concept sketch...";
        thinkingLog.add(step1);
        sendLog.run();
        log.info(step1);

        GenerateResponse sketchResponse = internalGenerateGemini(request.getPrompt(), null, apiKey,
                "gemini-3-pro-image-preview");
        String sketchImage = sketchResponse.getImageData();
        thinkingLog.add("Sketch generated.");
        sendLog.run();

        // Send sketch event
        emitter.send(SseEmitter.event().name("sketch").data(sketchImage));

        // Step 2: Vision Analysis
        String step2 = "Phase 2: Analyzing visual structure and composition...";
        thinkingLog.add(step2);
        sendLog.run();
        log.info(step2);

        String critique = geminiService.critiqueImage(sketchImage, request.getPrompt(), apiKey);
        thinkingLog.add("Critique: " + critique);
        sendLog.run();

        // Step 3: Style/Concept Expansion
        String step3 = "Phase 3: Consulting Void Archives for artistic styles...";
        thinkingLog.add(step3);
        sendLog.run();
        log.info(step3);

        String styleTags = geminiService.suggestStyleTags(request.getPrompt(), apiKey);
        thinkingLog.add("Identified Style Tags: " + styleTags);
        sendLog.run();

        // Step 4: Construct Optimized Prompt with Style Injection
        String step4 = "Phase 4: Injecting artistic soul (Style Injection)...";
        thinkingLog.add(step4);
        sendLog.run();
        log.info(step4);

        // Style Injection for "Hand-drawn" feel with Matte Hair & Precise Colors
        String positiveStyle = "rough brushstrokes, visible grain, noise, traditional media texture, uneven lines, sketchy, impasto, masterpiece, aesthetic, matte hair, soft lighting, diffused lighting, detailed hair strands, natural lighting, precise colors, tonal consistency, correct anatomy, perfect structure, refined details, broken highlights, textured hair";
        String negativeStyle = "digital smoothing, polished, CGI, glossy, flat coloring, 3d render, plastic, shiny hair, glossy hair, plastic hair, strong highlights, continuous highlights, halo, banded highlights, anime hair highlights, angel ring, oily hair, wet hair, oversaturated, color bleeding, bad anatomy, distorted, blurry, missing limbs, extra limbs, bad hands";

        // Construct refined prompt with "FIXES" emphasized
        String refinedPrompt = String.format(
                "Using the provided sketch as a reference, generate a final polished artwork. FIXES REQUIRED: %s. Prompt: %s, %s, 1.5::%s::. Avoid: %s",
                critique, request.getPrompt(), positiveStyle, styleTags, negativeStyle);

        // Note: Gemini doesn't support --no natively in prompt string usually, but we
        // can append negative prompts if the model supports it or just rely on positive
        // descriptions.
        // For Gemini 3, we'll focus on strong positive descriptors.
        refinedPrompt = String.format(
                "Generate a final masterpiece based on the sketch. MANDATORY FIXES: %s. Content: %s, %s, 1.5::%s::. Avoid: %s",
                critique, request.getPrompt(), positiveStyle, styleTags, negativeStyle);

        String processedRefinedPrompt = processGeminiPrompt(refinedPrompt);
        thinkingLog.add("Final Prompt Constructed.");
        sendLog.run();

        // Step 5: Final Generation
        String step5 = "Phase 5: Final manifestation (Img2Img from Sketch)...";
        thinkingLog.add(step5);
        sendLog.run();
        log.info(step5);

        // Use the generated sketch as the input image for the final step to maintain
        // consistency
        GenerateResponse finalResponse = internalGenerateGemini(processedRefinedPrompt, sketchImage, apiKey,
                "gemini-3-pro-image-preview");

        // Store logs and sketch in response
        finalResponse.setSketchImage(sketchImage);
        finalResponse.setThinkingLog(thinkingLog);

        // Send final result
        emitter.send(SseEmitter.event().name("result").data(finalResponse));
        emitter.complete();
    }

    private GenerateResponse internalGenerateGemini(String prompt, String inputImage, String apiKey, String model) {
        try {
            Map<String, Object> bodyMap;

            // 判断是否为 Img2Img (图片修改)
            if (inputImage != null && !inputImage.isEmpty()) {
                log.info("Img2Img mode...");
                model = "gemini-3-pro-image-preview"; // Img2Img usually requires specific model

                bodyMap = new java.util.HashMap<>();
                bodyMap.put("contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", prompt),
                                        Map.of(
                                                "inline_data", Map.of(
                                                        "mime_type", "image/png",
                                                        "data", inputImage))))));
                bodyMap.put("generationConfig", Map.of(
                        "responseModalities", List.of("IMAGE")));
            } else {
                // 标准 T2I 生成
                bodyMap = new java.util.HashMap<>();
                bodyMap.put("contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt)))));
                bodyMap.put("generationConfig", Map.of(
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
                    throw new ApiException("Google Error: " + responseBody, "IMAGEN_ERROR");
                }

                log.info("Gemini Raw Response: {}", responseBody);
                System.err.println("DEBUG_GEMINI_mRESPONSE: " + responseBody);
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
