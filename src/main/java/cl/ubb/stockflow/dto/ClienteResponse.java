package cl.ubb.stockflow.dto;

import java.time.LocalDateTime;

public record ClienteResponse(Long id, String nombre, String email,
    String telefono, Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {}
