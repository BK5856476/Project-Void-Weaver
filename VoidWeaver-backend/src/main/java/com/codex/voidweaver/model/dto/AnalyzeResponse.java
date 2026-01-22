package com.codex.voidweaver.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分析图片响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResponse {

    /** 解析出的7个模块 */
    private List<ModuleDto> modules;

    /** 原始完整提示词 */
    private String rawPrompt;
}
