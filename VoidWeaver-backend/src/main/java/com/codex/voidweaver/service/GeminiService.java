package com.codex.voidweaver.service;

import com.codex.voidweaver.model.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

/**
 * Gemini AI 服务
 * 使用前端传来的 API Key 调用 Gemini REST API
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

        private final OkHttpClient httpClient;
        private final ObjectMapper objectMapper;

        private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
        private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

        /**
         * 分析图片并提取8个模块
         * 使用前端传来的 geminiApiKey
         */
        public AnalyzeResponse analyzeImage(AnalyzeRequest request) {
                log.info("Analyzing image with Gemini API...");

                try {
                        // 构建请求体
                        Map<String, Object> requestBody = buildAnalyzeRequestBody(request.getImageData());
                        String jsonBody = objectMapper.writeValueAsString(requestBody);

                        // 构建 HTTP 请求（API Key 作为 URL 参数）
                        String url = GEMINI_API_URL + "?key=" + request.getGeminiApiKey();
                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        // 发送请求
                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        throw new IOException("Gemini API call failed: " + response.code() + " "
                                                        + response.message());
                                }

                                String responseBody = response.body().string();
                                log.debug("Gemini response: {}", responseBody);

                                // 解析响应
                                return parseAnalyzeResponse(responseBody);
                        }

                } catch (Exception e) {
                        log.error("Failed to analyze image with Gemini: {}", e.getMessage(), e);
                        throw new RuntimeException("Gemini API 调用失败: " + e.getMessage(), e);
                }
        }

        /**
         * 精炼模块 - 使用自然语言指令更新未锁定的模块
         */
        public RefineResponse refineModules(RefineRequest request) {
                log.info("Refining modules with instruction: {}", request.getInstruction());

                try {
                        // 过滤未锁定的模块
                        List<ModuleDto> unlockedModules = request.getModules().stream()
                                        .filter(module -> !module.getLocked())
                                        .toList();

                        log.info("Found {} unlocked modules to refine", unlockedModules.size());

                        // 构建请求体
                        Map<String, Object> requestBody = buildRefineRequestBody(unlockedModules,
                                        request.getInstruction());
                        String jsonBody = objectMapper.writeValueAsString(requestBody);

                        // 构建 HTTP 请求
                        String url = GEMINI_API_URL + "?key=" + request.getGeminiApiKey();
                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        // 发送请求
                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        throw new IOException("Gemini API call failed: " + response.code() + " "
                                                        + response.message());
                                }

                                String responseBody = response.body().string();
                                log.debug("Gemini refine response: {}", responseBody);

                                // 解析响应
                                return parseRefineResponse(responseBody);
                        }

                } catch (Exception e) {
                        log.error("Failed to refine modules with Gemini: {}", e.getMessage(), e);
                        throw new RuntimeException("Gemini Refine 失败: " + e.getMessage(), e);
                }
        }

        /**
         * 构建图片分析请求体
         */
        private Map<String, Object> buildAnalyzeRequestBody(String imageData) {
                String systemPrompt = """
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

                return Map.of(
                                "contents", List.of(Map.of(
                                                "parts", List.of(
                                                                Map.of("text", systemPrompt),
                                                                Map.of("inlineData", Map.of(
                                                                                "mimeType", "image/png",
                                                                                "data", imageData))))),
                                "generationConfig", Map.of(
                                                "responseMimeType", "application/json"));
        }

        /**
         * 构建模块精炼请求体
         */
        private Map<String, Object> buildRefineRequestBody(List<ModuleDto> modules, String instruction)
                        throws Exception {
                String modulesJson = objectMapper.writeValueAsString(modules);
                String systemPrompt = String.format(
                                """
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
                                                """,
                                instruction, modulesJson);

                return Map.of(
                                "contents", List.of(Map.of(
                                                "parts", List.of(Map.of("text", systemPrompt)))),
                                "generationConfig", Map.of(
                                                "responseMimeType", "application/json"));
        }

        /**
         * 解析 Gemini 分析响应
         */
        private AnalyzeResponse parseAnalyzeResponse(String responseBody) throws Exception {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");

                if (candidates.isEmpty()) {
                        throw new RuntimeException("No candidates in Gemini response");
                }

                String jsonContent = candidates.get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text")
                                .asText();

                log.debug("Extracted JSON content: {}", jsonContent);
                return objectMapper.readValue(jsonContent, AnalyzeResponse.class);
        }

        /**
         * 解析 Gemini 精炼响应
         */
        private RefineResponse parseRefineResponse(String responseBody) throws Exception {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");

                if (candidates.isEmpty()) {
                        throw new RuntimeException("No candidates in Gemini response");
                }

                String jsonContent = candidates.get(0)
                                .path("content")
                                .path("parts")
                                .get(0)
                                .path("text")
                                .asText();

                log.debug("Extracted JSON content: {}", jsonContent);
                return objectMapper.readValue(jsonContent, RefineResponse.class);
        }
}
