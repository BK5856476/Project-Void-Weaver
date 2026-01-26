package com.codex.voidweaver.exception;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

/**
 * Global Exception Handler to format errors as JSON
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @Builder
    public static class ErrorResponse {
        private boolean error;
        private String message;
        private String code;
        private String timestamp;
    }

    /**
     * Handle Custom ApiException
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException e) {
        log.error("API Error: {} - {}", e.getCode(), e.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .error(true)
                .message(e.getMessage())
                .code(e.getCode())
                .timestamp(Instant.now().toString())
                .build();

        // Map codes to HTTP status if needed
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if ("INVALID_API_KEY".equals(e.getCode()))
            status = HttpStatus.UNAUTHORIZED;
        if ("INVALID_REQUEST".equals(e.getCode()))
            status = HttpStatus.BAD_REQUEST;
        if ("RATE_LIMITED".equals(e.getCode()))
            status = HttpStatus.TOO_MANY_REQUESTS;

        return new ResponseEntity<>(response, status);
    }

    /**
     * Handle Input Validation / Illegal Arguments
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        ErrorResponse response = ErrorResponse.builder()
                .error(true)
                .message(e.getMessage())
                .code("INVALID_REQUEST")
                .timestamp(Instant.now().toString())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle Generic Exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        log.error("Unhandled Exception: ", e);

        ErrorResponse response = ErrorResponse.builder()
                .error(true)
                .message("Internal server error: " + e.getMessage())
                .code("INTERNAL_ERROR")
                .timestamp(Instant.now().toString())
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
