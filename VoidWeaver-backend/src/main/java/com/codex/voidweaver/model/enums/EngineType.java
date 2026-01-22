package com.codex.voidweaver.model.enums;

/**
 * AI Engine type enumeration
 */
public enum EngineType {
    NOVELAI("NovelAI V3", "Anime/2D art specialized"),
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
