package com.codex.voidweaver.controller;

import com.codex.voidweaver.model.dto.AnalyzeRequest;
import com.codex.voidweaver.model.dto.AnalyzeResponse;
import com.codex.voidweaver.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 图片分析控制器
 * Handles image analysis with Gemini
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalysisController {

    private final GeminiService geminiService;

    /**
     * 分析图片并提取8个模块
     * POST /api/analyze
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyzeImage(@Valid @RequestBody AnalyzeRequest request) {
        log.info("Received analyze request");

        try {
            AnalyzeResponse response = geminiService.analyzeImage(request);
            log.info("Analysis completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Analysis failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze image: " + e.getMessage(), e);
        }
    }
}
