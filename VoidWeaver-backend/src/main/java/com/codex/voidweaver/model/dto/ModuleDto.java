package com.codex.voidweaver.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 模块数据传输对象
 * Represents one of the 7 prompt dimensions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleDto {

    /** 模块名称 (style, subject, pose, costume, background, composition, atmosphere) */
    private String name;

    /** 模块显示标题 */
    private String displayName;

    /** 是否锁定 (锁定后AI不可修改) */
    @Builder.Default
    private Boolean locked = false;

    /** 该模块包含的标签列表 */
    private List<TagDto> tags;
}
