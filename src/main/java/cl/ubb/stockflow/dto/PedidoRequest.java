package cl.ubb.stockflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PedidoRequest(
    @NotNull(message = "clienteId es obligatorio") Long clienteId,
    @NotEmpty(message = "items no puede estar vacío")
    List<@Valid PedidoItemRequest> items) {

  public record PedidoItemRequest(
      @NotNull(message = "productoId es obligatorio") Long productoId,
      @NotNull(message = "cantidad es obligatoria")
      @Min(value = 1, message = "cantidad debe ser al menos 1") Integer cantidad) {}
}
