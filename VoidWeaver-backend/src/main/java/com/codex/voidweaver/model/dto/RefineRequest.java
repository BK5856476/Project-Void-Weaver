package com.codex.voidweaver.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 精炼模块请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefineRequest {

    /** 当前所有模块数据 */
    @NotNull(message = "Modules are required")
    private List<ModuleDto> modules;

    /** 用户输入的自然语言指令 */
    @NotBlank(message = "Instruction is required")
    private String instruction;

    /** Gemini API Key */
    @NotBlank(message = "Gemini API Key is required")
    private String geminiApiKey;
}
