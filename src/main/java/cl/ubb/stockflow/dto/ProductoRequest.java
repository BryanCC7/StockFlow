package cl.ubb.stockflow.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductoRequest(
    @NotBlank(message = "nombre es obligatorio") String nombre,
    String categoria,
    @NotNull(message = "precio es obligatorio")
    @DecimalMin(value = "0.01", message = "precio debe ser mayor a 0") BigDecimal precio,
    @NotNull(message = "stock es obligatorio")
    @Min(value = 0, message = "stock no puede ser negativo") Integer stockActual) {}
