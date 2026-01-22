package com.codex.voidweaver.controller;

import com.codex.voidweaver.model.dto.RefineRequest;
import com.codex.voidweaver.model.dto.RefineResponse;
import com.codex.voidweaver.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 模块精炼控制器
 * Handles module refinement with natural language instructions
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RefineController {

    private final GeminiService geminiService;

    /**
     * 精炼模块
     * POST /api/refine
     */
    @PostMapping("/refine")
    public ResponseEntity<RefineResponse> refineModules(@Valid @RequestBody RefineRequest request) {
        log.info("Received refine request with instruction: {}", request.getInstruction());

        try {
            RefineResponse response = geminiService.refineModules(request);
            log.info("Module refinement completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Module refinement failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to refine modules: " + e.getMessage(), e);
        }
    }
}
