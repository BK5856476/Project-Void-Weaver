package com.codex.voidweaver.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 生成图片响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResponse {

    /** Base64编码的生成图片 */
    private String imageData;

    /** 深度思考：草图 (Base64) */
    private String sketchImage;

    /** 深度思考：思考过程日志 */
    private java.util.List<String> thinkingLog;
}
