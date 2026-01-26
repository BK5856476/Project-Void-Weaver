package com.codex.voidweaver.exception;

import lombok.Getter;

/**
 * Custom exception for Void Weaver API errors
 */
@Getter
public class ApiException extends RuntimeException {

    private final String code;

    public ApiException(String message) {
        super(message);
        this.code = "INTERNAL_ERROR";
    }

    public ApiException(String message, String code) {
        super(message);
        this.code = code;
    }

    public ApiException(String message, String code, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
