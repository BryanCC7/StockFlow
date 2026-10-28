package cl.ubb.stockflow.dto;

import jakarta.validation.constraints.*;

public record ClienteRequest(
    @NotBlank(message = "nombre es obligatorio")
    @Size(max = 120, message = "nombre no puede exceder 120 caracteres") String nombre,
    @NotBlank(message = "email es obligatorio")
    @Email(message = "email debe ser válido")
    @Size(max = 160, message = "email no puede exceder 160 caracteres") String email,
    @Size(max = 40, message = "telefono no puede exceder 40 caracteres") String telefono) {}
