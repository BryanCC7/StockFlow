package cl.ubb.stockflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReporteInventarioResponse(int totalProductos, int stockTotal,
    BigDecimal valorizacionTotal, List<ItemInventario> items) {
  public record ItemInventario(Long productoId, String nombre, String categoria,
      BigDecimal precio, Integer stock, BigDecimal valorizacion, boolean bajoStock) {}
}
