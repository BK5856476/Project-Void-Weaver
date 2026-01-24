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

import java.io.IOException;
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

        private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent";
        private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

        /**
         * Analyze image and extract 8 modules
         * Uses geminiApiKey from frontend
         */
        public AnalyzeResponse analyzeImage(AnalyzeRequest request) {
                log.info("Analyzing image with Gemini 3 Pro API...");

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
                                        throw new IOException("Gemini API call failed: " + response.code() + " "
                                                        + response.message());
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
                                        throw new IOException("Gemini API call failed: " + response.code() + " "
                                                        + response.message());
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
