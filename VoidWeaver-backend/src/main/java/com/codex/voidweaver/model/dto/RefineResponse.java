package com.codex.voidweaver.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 精炼模块响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefineResponse {

    /** 更新后的模块数据 (仅返回未锁定的模块) */
    private List<ModuleDto> modules;
}
