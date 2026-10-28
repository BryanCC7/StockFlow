package cl.ubb.stockflow.service;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.model.Pedido;
import cl.ubb.stockflow.model.Producto;
import cl.ubb.stockflow.repository.PedidoRepository;
import cl.ubb.stockflow.repository.ProductoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReporteService {
  private final PedidoRepository pedidos;
  private final ProductoRepository productos;

  public ReporteService(PedidoRepository pedidos, ProductoRepository productos) {
    this.pedidos = pedidos;
    this.productos = productos;
  }

  @Transactional(readOnly = true)
  public ReporteVentasResponse ventas(LocalDate desde, LocalDate hasta) {
    LocalDateTime d = (desde != null) ? desde.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
    LocalDateTime h = (hasta != null) ? hasta.atTime(23, 59, 59) : LocalDateTime.now().plusDays(1);
    // Trae pedidos no cancelados con detalles y producto en una sola consulta (sin N+1)
    List<Pedido> lista = pedidos.buscarVentas(d, h);

    Map<Long, ReporteVentasResponse.VentaPorProducto> acc = new LinkedHashMap<>();
    BigDecimal total = BigDecimal.ZERO;
    for (Pedido p : lista) {
      total = total.add(p.getTotal());
      for (var det : p.getDetalles()) {
        Long pid = det.getProducto().getId();
        var prev = acc.get(pid);
        BigDecimal monto = det.getPrecioUnitario().multiply(BigDecimal.valueOf(det.getCantidad()));
        if (prev == null) {
          acc.put(pid, new ReporteVentasResponse.VentaPorProducto(pid,
              det.getProducto().getNombre(), det.getCantidad(), monto));
        } else {
          acc.put(pid, new ReporteVentasResponse.VentaPorProducto(pid, prev.productoNombre(),
              prev.cantidadVendida() + det.getCantidad(), prev.montoVendido().add(monto)));
        }
      }
    }
    return new ReporteVentasResponse(
        d.toLocalDate().toString(), h.toLocalDate().toString(),
        lista.size(), total, List.copyOf(acc.values()));
  }

  @Transactional(readOnly = true)
  public ReporteInventarioResponse inventario(int umbral) {
    List<Producto> lista = productos.findAll();
    BigDecimal valTotal = BigDecimal.ZERO;
    int stockTotal = 0;
    List<ReporteInventarioResponse.ItemInventario> items = new ArrayList<>();
    for (Producto p : lista) {
      BigDecimal val = p.getPrecio().multiply(BigDecimal.valueOf(p.getStockActual()));
      valTotal = valTotal.add(val);
      stockTotal += p.getStockActual();
      items.add(new ReporteInventarioResponse.ItemInventario(
          p.getId(), p.getNombre(), p.getCategoria(), p.getPrecio(),
          p.getStockActual(), val, p.getStockActual() <= umbral));
    }
    return new ReporteInventarioResponse(lista.size(), stockTotal, valTotal, items);
  }
}
