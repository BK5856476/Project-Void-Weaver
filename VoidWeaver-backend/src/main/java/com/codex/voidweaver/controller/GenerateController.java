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

    /**
     * 生成图片 (流式) - 支持 Deep Thinking 实时日志
     * POST /api/generate/stream
     */
    @PostMapping("/generate/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter generateImageStream(
            @Valid @RequestBody GenerateRequest request) {
        log.info("Received streaming generate request for engine: {}", request.getEngine());

        // Time out 5 minutes for long generation
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(
                300000L);

        // Execute in a separate thread to not block the servlet thread
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            imageService.generateImageStream(request, emitter);
        });

        return emitter;
    }
}
