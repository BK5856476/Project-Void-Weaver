package com.codex.voidweaver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Void Weaver - Rewrite the World Protocol
 * Main application entry point
 */
@SpringBootApplication
public class VoidWeaverApplication {

    public static void main(String[] args) {
        SpringApplication.run(VoidWeaverApplication.class, args);
        System.out.println("""
            
            ╔══════════════════════════════════════════╗
            ║     VOID WEAVER BACKEND INITIALIZED      ║
            ║    Rewrite the World Protocol Active     ║
            ╚══════════════════════════════════════════╝
            
            """);
    }
}
