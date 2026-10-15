package cl.ubb.stockflow.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(Long id, Long clienteId, String clienteNombre,
    LocalDateTime fecha, String estado, BigDecimal total,
    List<DetalleResponse> detalles) {

  public record DetalleResponse(Long id, Long productoId, String productoNombre,
      Integer cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {}
}
