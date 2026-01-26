package com.codex.voidweaver.service;

import com.codex.voidweaver.model.dto.ModuleDto;
import com.codex.voidweaver.model.dto.TagDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 提示词处理服务
 * 负责将结构化的模块数据转换为不同引擎所需的提示词字符串
 */
@Service
public class PromptService {

    /**
     * 将模块数据转换为完整提示词
     * 规则：如果权重不为 1.0，则使用 {weight}::{tag}:: 格式
     */
    public String buildFullPrompt(List<ModuleDto> modules) {
        if (modules == null || modules.isEmpty()) {
            return "";
        }

        return modules.stream()
                .flatMap(module -> module.getTags().stream())
                .map(this::formatTag)
                .collect(Collectors.joining(", "));
    }

    /**
     * 格式化单个标签
     * 非 1.0 权重的标签输出为 {weight}::{tag}::
     */
    private String formatTag(TagDto tag) {
        if (tag.getWeight() == null || Math.abs(tag.getWeight() - 1.0) < 0.0001) {
            return tag.getText();
        }
        // 使用 PRD 约定的权重语法
        return String.format("{%.2f::%s::}", tag.getWeight(), tag.getText());
    }
}
