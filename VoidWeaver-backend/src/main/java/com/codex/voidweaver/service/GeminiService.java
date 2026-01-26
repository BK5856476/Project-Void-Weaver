package com.codex.voidweaver.service;

import com.codex.voidweaver.model.dto.AnalyzeRequest;
import com.codex.voidweaver.model.dto.AnalyzeResponse;
import com.codex.voidweaver.model.dto.ModuleDto;
import com.codex.voidweaver.model.dto.RefineRequest;
import com.codex.voidweaver.model.dto.RefineResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Gemini AI Service
 * Uses Gemini API Key from frontend request
 */
@Slf4j
@Service
@RequiredArgsConstructor
// Force recompile
public class GeminiService {

        private final OkHttpClient httpClient;
        private final ObjectMapper objectMapper;

        // private static final String GEMINI_API_URL =
        // "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent";
        private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
        private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

        /**
         * Analyze image and extract 8 modules
         * Uses geminiApiKey from frontend
         */
        public AnalyzeResponse analyzeImage(AnalyzeRequest request) {
                log.info("Analyzing image with Gemini 2.0 Flash API...");

                try {
                        Map<String, Object> requestBody = buildAnalyzeRequestBody(request.getImageData());
                        String jsonBody = objectMapper.writeValueAsString(requestBody);

                        String url = GEMINI_API_URL + "?key=" + request.getGeminiApiKey();
                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        String errorBody = response.body() != null ? response.body().string() : "null";
                                        log.error("Gemini API Verification Failed. Code: {}, Body: {}", response.code(),
                                                        errorBody);

                                        String errorCode = "GEMINI_ERROR";
                                        if (response.code() == 401 || response.code() == 403)
                                                errorCode = "INVALID_API_KEY";
                                        if (response.code() == 429)
                                                errorCode = "RATE_LIMITED";

                                        throw new com.codex.voidweaver.exception.ApiException(
                                                        "Gemini API failed: " + response.code(), errorCode);
                                }

                                String responseBody = response.body().string();
                                log.debug("Gemini response: {}", responseBody);

                                return parseAnalyzeResponse(responseBody);
                        }

                } catch (Exception e) {
                        log.error("Failed to analyze image with Gemini: {}", e.getMessage(), e);
                        throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
                }
        }

        /**
         * Refine modules based on natural language instruction
         */
        public RefineResponse refineModules(RefineRequest request) {
                log.info("Refining modules with instruction: {}", request.getInstruction());

                try {
                        List<ModuleDto> unlockedModules = request.getModules().stream()
                                        .filter(module -> !module.getLocked())
                                        .toList();

                        log.info("Found {} unlocked modules to refine", unlockedModules.size());

                        Map<String, Object> requestBody = buildRefineRequestBody(unlockedModules,
                                        request.getInstruction());
                        String jsonBody = objectMapper.writeValueAsString(requestBody);

                        String url = GEMINI_API_URL + "?key=" + request.getGeminiApiKey();
                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        String errorBody = response.body() != null ? response.body().string() : "null";
                                        log.error("Gemini Refine Failed. Code: {}, Body: {}", response.code(),
                                                        errorBody);

                                        String errorCode = "GEMINI_ERROR";
                                        if (response.code() == 401 || response.code() == 403)
                                                errorCode = "INVALID_API_KEY";
                                        if (response.code() == 429)
                                                errorCode = "RATE_LIMITED";

                                        throw new com.codex.voidweaver.exception.ApiException(
                                                        "Gemini Refine failed: " + response.code(), errorCode);
                                }

                                String responseBody = response.body().string();
                                log.debug("Gemini refine response: {}", responseBody);

                                return parseRefineResponse(responseBody);
                        }

                } catch (Exception e) {
                        log.error("Failed to refine modules with Gemini: {}", e.getMessage(), e);
                        throw new RuntimeException("Gemini Refine failed: " + e.getMessage(), e);
                }
        }

        private Map<String, Object> buildAnalyzeRequestBody(String imageData) {
                String systemPrompt = """
                                You are an expert image analyst. Analyze the given image and extract descriptive tags into 8 categories.
                                Provide all outputs in English only. Do not use any other language.

                                Return a JSON object with this exact structure:
                                {
                                  "modules": [
                                    {
                                      "name": "style",
                                      "displayName": "Style",
                                      "locked": false,
                                      "tags": [
                                        {"id": "uuid-here", "text": "tag description", "weight": 1.0}
                                      ]
                                    },
                                    // ... 8 modules total
                                  ],
                                  "rawPrompt": "all tags joined as comma-separated string"
                                }

                                IMPORTANT: Each tag object MUST have exactly these 3 fields:
                                - "id": a unique UUID (generate with standard UUID format)
                                - "text": the tag content in English (e.g. "silver hair", "dynamic pose")
                                - "weight": a number, default 1.0

                                The 8 modules are:
                                1. style - Art style, artistic references
                                2. subject - Main character/object
                                3. pose - Action, posture, viewing angle
                                4. costume - Clothing, accessories
                                5. background - Scene, location
                                6. composition - Camera angle, framing
                                7. atmosphere - Lighting, mood
                                8. extra - Additional details

                                Return ONLY valid JSON, no markdown.
                                Ensure all tag text values are in English.
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

        private Map<String, Object> buildRefineRequestBody(List<ModuleDto> modules, String instruction)
                        throws Exception {
                String modulesJson = objectMapper.writeValueAsString(modules);
                String systemPrompt = String.format(
                                """
                                                You are an AI prompt editor. Update the following modules according to the user instruction.
                                                Provide all outputs in English only. Even if the instruction is in Chinese, translate and output the result in English.

                                                User instruction: %s

                                                Current modules: %s

                                                Return a JSON object with:
                                                {
                                                  "modules": [ALL modules with updates applied]
                                                }

                                                IMPORTANT: You MUST return ALL modules that were provided in "Current modules", even if you only modified some of them.
                                                - If a module is relevant to the instruction, update its tags accordingly
                                                - If a module is NOT relevant to the instruction, return it unchanged with its original tags
                                                - The output "modules" array must have the SAME NUMBER of modules as the input

                                                CRITICAL: Each tag object MUST have exactly these 3 fields:
                                                - "id": a unique UUID
                                                - "text": the tag content in English (NOT "name" or "displayName"!)
                                                - "weight": a number, default 1.0

                                                Keep the module "name" field identifier UNCHANGED (e.g. "style", "pose").
                                                Keep the same structure: name, displayName, locked, tags.
                                                Generate new UUIDs for modified tags.
                                                Return ONLY valid JSON.
                                                Ensure all module displayNames and tag text values are in English.
                                                """,
                                instruction, modulesJson);

                return Map.of(
                                "contents", List.of(Map.of(
                                                "parts", List.of(Map.of("text", systemPrompt)))),
                                "generationConfig", Map.of(
                                                "responseMimeType", "application/json"));
        }

        private AnalyzeResponse parseAnalyzeResponse(String responseBody) throws Exception {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");

                if (candidates.isEmpty()) {
                        throw new com.codex.voidweaver.exception.ApiException("No candidates in Gemini response",
                                        "GEMINI_ERROR");
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

        private RefineResponse parseRefineResponse(String responseBody) throws Exception {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");

                if (candidates.isEmpty()) {
                        throw new com.codex.voidweaver.exception.ApiException("No candidates in Gemini response",
                                        "GEMINI_ERROR");
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
