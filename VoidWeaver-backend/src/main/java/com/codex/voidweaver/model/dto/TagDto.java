package com.codex.voidweaver.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 标签数据传输对象
 * Represents a single interactive tag with weight
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagDto {

    /** 标签文本内容 */
    private String text;

    /** 权重值 (0.5 - 1.5)，默认 1.0 */
    @Builder.Default
    private Double weight = 1.0;

    /** 唯一标识符 */
    private String id;

    /** 是否隐藏 (不显示在前端，但参与生成) */
    @Builder.Default
    private Boolean hidden = false;
}
