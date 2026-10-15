package cl.ubb.stockflow.dto;

import jakarta.validation.constraints.*;

public record ClienteRequest(
    @NotBlank(message = "nombre es obligatorio") String nombre,
    @NotBlank(message = "email es obligatorio")
    @Email(message = "email debe ser válido") String email,
    String telefono) {}
