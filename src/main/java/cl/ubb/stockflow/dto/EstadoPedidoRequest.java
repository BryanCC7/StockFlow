package cl.ubb.stockflow.dto;

import cl.ubb.stockflow.model.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record EstadoPedidoRequest(
    @NotNull(message = "estado es obligatorio") EstadoPedido estado) {}
