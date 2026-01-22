package com.codex.voidweaver.model.dto;

import com.codex.voidweaver.model.enums.EngineType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 生成图片请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateRequest {

    /** 前端组装好的完整提示词 */
    @NotBlank(message = "Prompt is required")
    private String prompt;

    /** 引擎类型 */
    @NotNull(message = "Engine type is required")
    private EngineType engine;

    /** NovelAI API Key (当engine=NOVELAI时必填) */
    private String novelaiApiKey;

    /** Google Vertex AI凭证 (当engine=GOOGLE_IMAGEN时必填) */
    private String googleCredentials;

    /** 分辨率 */
    @NotBlank(message = "Resolution is required")
    private String resolution;

    /** 步数 */
    @Min(value = 1, message = "Steps must be at least 1")
    @Max(value = 50, message = "Steps must not exceed 50")
    private Integer steps;

    /** 相关性/CFG Scale */
    @Min(value = 1, message = "Scale must be at least 1")
    @Max(value = 20, message = "Scale must not exceed 20")
    private Integer scale;
}
