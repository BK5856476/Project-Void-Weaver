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
                String systemPrompt = "You are an expert image analyst. Analyze the given image and extract descriptive tags into 8 categories.\n"
                                +
                                "Provide all outputs in English only. Do not use any other language.\n" +
                                "\n" +
                                "Return a JSON object with this exact structure:\n" +
                                "{\n" +
                                "  \"modules\": [\n" +
                                "    {\n" +
                                "      \"name\": \"style\",\n" +
                                "      \"displayName\": \"Style\",\n" +
                                "      \"locked\": false,\n" +
                                "      \"tags\": [\n" +
                                "        {\"id\": \"uuid-here\", \"text\": \"tag description\", \"weight\": 1.0}\n" +
                                "      ]\n" +
                                "    },\n" +
                                "    // ... 8 modules total\n" +
                                "  ],\n" +
                                "  \"rawPrompt\": \"all tags joined as comma-separated string\"\n" +
                                "}\n" +
                                "\n" +
                                "IMPORTANT: Each tag object MUST have exactly these 3 fields:\n" +
                                "- \"id\": a unique UUID (generate with standard UUID format)\n" +
                                "- \"text\": the tag content in English (e.g. \"silver hair\", \"dynamic pose\")\n" +
                                "- \"weight\": a number, default 1.0\n" +
                                "\n" +
                                "The 8 modules are:\n" +
                                "1. style - Art style, artistic references\n" +
                                "2. subject - Main character/object\n" +
                                "3. pose - Action, posture, viewing angle\n" +
                                "4. costume - Clothing, accessories\n" +
                                "5. background - Scene, location\n" +
                                "6. composition - Camera angle, framing\n" +
                                "7. atmosphere - Lighting, mood\n" +
                                "8. extra - Additional details\n" +
                                "\n" +
                                "CRITICAL UPDATE: You must now also extract PRECISE COLORS from the image.\n" +
                                "For the 'atmosphere' module, allow adding tags with \"hidden\": true.\n" +
                                "Identify 5-7 dominant specific colors or color palettes (e.g. \"#FF0000\", \"crimson red\", \"midnight blue palette\").\n"
                                +
                                "Add these as tags to the 'atmosphere' module with \"hidden\": true.\n" +
                                "\n" +
                                "Return ONLY valid JSON, no markdown.\n" +
                                "Ensure all tag text values are in English.\n";

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
                                "You are an AI prompt editor. Update the following modules according to the user instruction.\n"
                                                +
                                                "Provide all outputs in English only. Even if the instruction is in Chinese, translate and output the result in English.\n"
                                                +
                                                "\n" +
                                                "User instruction: %s\n" +
                                                "\n" +
                                                "Current modules: %s\n" +
                                                "\n" +
                                                "Return a JSON object with:\n" +
                                                "{\n" +
                                                "  \"modules\": [ALL modules with updates applied]\n" +
                                                "}\n" +
                                                "\n" +
                                                "IMPORTANT: You MUST return ALL modules that were provided in \"Current modules\", even if you only modified some of them.\n"
                                                +
                                                "- If a module is relevant to the instruction, update its tags accordingly\n"
                                                +
                                                "- If a module is NOT relevant to the instruction, return it unchanged with its original tags\n"
                                                +
                                                "- The output \"modules\" array must have the SAME NUMBER of modules as the input\n"
                                                +
                                                "\n" +
                                                "CRITICAL: Each tag object MUST have exactly these 3 fields:\n" +
                                                "- \"id\": a unique UUID\n" +
                                                "- \"text\": the tag content in English (NOT \"name\" or \"displayName\"!)\n"
                                                +
                                                "- \"weight\": a number, default 1.0\n" +
                                                "\n" +
                                                "Keep the module \"name\" field identifier UNCHANGED (e.g. \"style\", \"pose\").\n"
                                                +
                                                "Keep the same structure: name, displayName, locked, tags.\n" +
                                                "Generate new UUIDs for modified tags.\n" +
                                                "Return ONLY valid JSON.\n" +
                                                "Ensure all module displayNames and tag text values are in English.\n",
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

        /**
         * Analyze sketch and provide critique
         */
        public String critiqueImage(String imageData, String prompt, String apiKey) {
                log.info("Critiquing image with Gemini 2.0 Flash...");
                try {
                        String systemPrompt = String.format(
                                        "Act as an expert art director. Analyze the attached sketch which was generated from the prompt: '%s'.\n"
                                                        +
                                                        "Identify major flaws in anatomy, structure, lighting, or composition. Provide 3 short, imperative commands to FIX these specific issues (e.g., 'Fix the distorted hand', 'Correct the limb proportions', 'Improve lighting balance').\n"
                                                        +
                                                        "Output ONLY the commands as a comma-separated list. Do not use bullet points.",
                                        prompt);

                        Map<String, Object> requestBody = Map.of(
                                        "contents", List.of(Map.of(
                                                        "parts", List.of(
                                                                        Map.of("text", systemPrompt),
                                                                        Map.of("inlineData", Map.of(
                                                                                        "mimeType", "image/png",
                                                                                        "data", imageData))))),
                                        "generationConfig", Map.of(
                                                        "responseMimeType", "text/plain"));

                        String jsonBody = objectMapper.writeValueAsString(requestBody);
                        String url = GEMINI_API_URL + "?key=" + apiKey;

                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        throw new RuntimeException("Gemini Critique failed: " + response.code());
                                }
                                String responseBody = response.body().string();
                                return extractTextFromResponse(responseBody);
                        }
                } catch (Exception e) {
                        log.error("Critique failed", e);
                        return "Failed to critique image.";
                }
        }

        /**
         * Suggest Danbooru style tags
         */
        public String suggestStyleTags(String prompt, String apiKey) {
                log.info("Suggesting Danbooru tags...");
                try {
                        String systemPrompt = String.format(
                                        "Based on the prompt: '%s', suggest 5 high-quality Danbooru style tags or artist tags (e.g., 'masterpiece', 'best quality', specific artist styles) that would enhance the artistic quality.\n"
                                                        +
                                                        "Output ONLY the tags as a comma-separated list. do not output quotes or other text.",
                                        prompt);

                        Map<String, Object> requestBody = Map.of(
                                        "contents", List.of(Map.of(
                                                        "parts", List.of(Map.of("text", systemPrompt)))));

                        String jsonBody = objectMapper.writeValueAsString(requestBody);
                        String url = GEMINI_API_URL + "?key=" + apiKey;

                        Request httpRequest = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(jsonBody, JSON))
                                        .build();

                        try (Response response = httpClient.newCall(httpRequest).execute()) {
                                if (!response.isSuccessful()) {
                                        throw new RuntimeException("Gemini Tag Suggestion failed: " + response.code());
                                }
                                String responseBody = response.body().string();
                                return extractTextFromResponse(responseBody);
                        }
                } catch (Exception e) {
                        log.error("Tag suggestion failed", e);
                        return "masterpiece, best quality";
                }
        }

        private String extractTextFromResponse(String responseBody) throws Exception {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");
                if (candidates.isEmpty())
                        return "";
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        }
}
