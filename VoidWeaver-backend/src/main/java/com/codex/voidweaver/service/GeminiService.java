package com.codex.voidweaver.service;

import com.codex.voidweaver.model.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Gemini AI 服务
 * Handles all Gemini API interactions for image analysis and module refinement
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    /**
     * 分析图片并提取7个模块
     * Uses Gemini Vision API with structured JSON output
     */
    public AnalyzeResponse analyzeImage(AnalyzeRequest request) {
        log.info("Analyzing image with Gemini...");

        // TODO: Implement actual Gemini API call
        // This is a placeholder implementation
        // In production, this will call Gemini 3 Pro with vision capabilities
        // and use JSON mode to get structured output

        // For now, return mock data
        List<ModuleDto> modules = createMockModules();
        String rawPrompt = "masterpiece, best quality, 1girl, silver hair, red eyes, gothic dress, standing, castle background, dramatic lighting, anime style";

        return AnalyzeResponse.builder()
                .modules(modules)
                .rawPrompt(rawPrompt)
                .build();
    }

    /**
     * 精炼模块 - 根据自然语言指令更新未锁定的模块
     */
    public RefineResponse refineModules(RefineRequest request) {
        log.info("Refining modules with instruction: {}", request.getInstruction());

        // TODO: Implement actual Gemini API call
        // This will use Gemini to understand the natural language instruction
        // and update only the unlocked modules

        // Filter unlocked modules
        List<ModuleDto> unlockedModules = request.getModules().stream()
                .filter(module -> !module.getLocked())
                .toList();

        log.info("Found {} unlocked modules to refine", unlockedModules.size());

        return RefineResponse.builder()
                .modules(unlockedModules)
                .build();
    }

    /**
     * Create mock modules for testing
     */
    private List<ModuleDto> createMockModules() {
        List<ModuleDto> modules = new ArrayList<>();

        // Style module
        modules.add(ModuleDto.builder()
                .name("style")
                .displayName("Style (画风)")
                .locked(false)
                .tags(List.of(
                        createTag("anime style"),
                        createTag("masterpiece"),
                        createTag("best quality")))
                .build());

        // Subject module
        modules.add(ModuleDto.builder()
                .name("subject")
                .displayName("Subject (主体)")
                .locked(false)
                .tags(List.of(
                        createTag("1girl"),
                        createTag("silver hair"),
                        createTag("red eyes")))
                .build());

        // Pose module
        modules.add(ModuleDto.builder()
                .name("pose")
                .displayName("Pose (动作)")
                .locked(false)
                .tags(List.of(
                        createTag("standing"),
                        createTag("looking at viewer")))
                .build());

        // Costume module
        modules.add(ModuleDto.builder()
                .name("costume")
                .displayName("Costume (服装)")
                .locked(false)
                .tags(List.of(
                        createTag("gothic dress"),
                        createTag("black dress")))
                .build());

        // Background module
        modules.add(ModuleDto.builder()
                .name("background")
                .displayName("Background (背景)")
                .locked(false)
                .tags(List.of(
                        createTag("castle"),
                        createTag("night sky")))
                .build());

        // Composition module
        modules.add(ModuleDto.builder()
                .name("composition")
                .displayName("Composition (构图)")
                .locked(false)
                .tags(List.of(
                        createTag("medium shot"),
                        createTag("centered")))
                .build());

        // Atmosphere module
        modules.add(ModuleDto.builder()
                .name("atmosphere")
                .displayName("Atmosphere (氛围)")
                .locked(false)
                .tags(List.of(
                        createTag("dramatic lighting"),
                        createTag("moody")))
                .build());

        return modules;
    }

    private TagDto createTag(String text) {
        return TagDto.builder()
                .id(UUID.randomUUID().toString())
                .text(text)
                .weight(1.0)
                .build();
    }
}
