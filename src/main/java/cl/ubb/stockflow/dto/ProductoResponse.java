package cl.ubb.stockflow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(Long id, String nombre, String categoria,
    BigDecimal precio, Integer stockActual, Long version,
    LocalDateTime createdAt, LocalDateTime updatedAt) {}
