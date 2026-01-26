package com.codex.voidweaver.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * AI Engine type enumeration
 */
public enum EngineType {
    @JsonProperty("novelai")
    NOVELAI("NovelAI V3", "Anime/2D art specialized"),

    @JsonProperty("google-imagen")
    GOOGLE_IMAGEN("Google Imagen", "Photorealistic specialized");

    private final String displayName;
    private final String description;

    EngineType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
