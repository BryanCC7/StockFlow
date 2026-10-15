package cl.ubb.stockflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReporteVentasResponse(String desde, String hasta, long numeroPedidos,
    BigDecimal totalVendido, List<VentaPorProducto> porProducto) {
  public record VentaPorProducto(Long productoId, String productoNombre,
      long cantidadVendida, BigDecimal montoVendido) {}
}
