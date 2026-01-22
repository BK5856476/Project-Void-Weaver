package com.codex.voidweaver.utils;

import com.codex.voidweaver.model.dto.ModuleDto;
import com.codex.voidweaver.model.dto.TagDto;
import com.codex.voidweaver.model.enums.EngineType;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 提示词格式化工具
 * Formats tags into prompts for different AI engines
 */
@Slf4j
public class PromptFormatter {

    /**
     * 将模块列表格式化为完整提示词
     */
    public static String formatPrompt(List<ModuleDto> modules, EngineType engine) {
        if (engine == EngineType.NOVELAI) {
            return formatForNovelAI(modules);
        } else if (engine == EngineType.GOOGLE_IMAGEN) {
            return formatForGoogleImagen(modules);
        } else {
            throw new IllegalArgumentException("Unsupported engine type: " + engine);
        }
    }

    /**
     * NovelAI 格式: {weight}::tag::
     * Example: 1.05::silver hair::, 0.95::background::
     */
    private static String formatForNovelAI(List<ModuleDto> modules) {
        return modules.stream()
                .flatMap(module -> module.getTags().stream())
                .map(PromptFormatter::formatNovelAITag)
                .collect(Collectors.joining(", "));
    }

    private static String formatNovelAITag(TagDto tag) {
        if (tag.getWeight() == null || Math.abs(tag.getWeight() - 1.0) < 0.01) {
            // Default weight, no prefix needed
            return tag.getText();
        } else {
            // Custom weight
            return String.format("{%.2f::%s::}", tag.getWeight(), tag.getText());
        }
    }

    /**
     * Google Imagen 格式: Natural language, detailed descriptions
     * Example: "A girl with silver hair and red eyes wearing a gothic dress..."
     */
    private static String formatForGoogleImagen(List<ModuleDto> modules) {
        // For Google Imagen, we convert tags to natural language
        // This is a simplified version - in production, you might want to use
        // Gemini to convert the structured tags into a natural language prompt

        return modules.stream()
                .flatMap(module -> module.getTags().stream())
                .map(TagDto::getText)
                .collect(Collectors.joining(", "));
    }

    /**
     * 从模块列表生成原始提示词 (用于复制)
     */
    public static String generateRawPrompt(List<ModuleDto> modules) {
        return modules.stream()
                .flatMap(module -> module.getTags().stream())
                .map(TagDto::getText)
                .collect(Collectors.joining(", "));
    }
}
