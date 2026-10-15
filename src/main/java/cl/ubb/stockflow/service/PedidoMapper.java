package cl.ubb.stockflow.service;

import cl.ubb.stockflow.dto.PedidoResponse;
import cl.ubb.stockflow.model.Pedido;
import java.math.BigDecimal;

final class PedidoMapper {
  private PedidoMapper() {}

  static PedidoResponse aDto(Pedido p) {
    var detalles = p.getDetalles().stream()
        .map(d -> new PedidoResponse.DetalleResponse(
            d.getId(),
            d.getProducto() != null ? d.getProducto().getId() : null,
            d.getProducto() != null ? d.getProducto().getNombre() : null,
            d.getCantidad(),
            d.getPrecioUnitario(),
            d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()))))
        .toList();
    return new PedidoResponse(
        p.getId(),
        p.getCliente() != null ? p.getCliente().getId() : null,
        p.getCliente() != null ? p.getCliente().getNombre() : null,
        p.getFecha(), p.getEstado().name(), p.getTotal(), detalles);
  }
}
