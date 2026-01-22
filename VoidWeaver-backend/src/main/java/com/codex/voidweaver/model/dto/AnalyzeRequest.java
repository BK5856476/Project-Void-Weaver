package com.codex.voidweaver.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 分析图片请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeRequest {

    /** Base64编码的图片数据 */
    @NotBlank(message = "Image data is required")
    private String imageData;

    /** Gemini API Key (BYOK模式) */
    @NotBlank(message = "Gemini API Key is required")
    private String geminiApiKey;
}
