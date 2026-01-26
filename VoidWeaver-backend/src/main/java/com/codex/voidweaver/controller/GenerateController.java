package com.codex.voidweaver.controller;

import com.codex.voidweaver.model.dto.GenerateRequest;
import com.codex.voidweaver.model.dto.GenerateResponse;
import com.codex.voidweaver.service.ImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 图片生成控制器
 * Handles image generation with NovelAI or Google Imagen
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GenerateController {

    private final ImageService imageService;

    /**
     * 生成图片
     * POST /api/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generateImage(@Valid @RequestBody GenerateRequest request) {
        log.info("Received generate request for engine: {}", request.getEngine());
        GenerateResponse response = imageService.generateImage(request);
        log.info("Image generation process initiated or completed");
        return ResponseEntity.ok(response);
    }
}
