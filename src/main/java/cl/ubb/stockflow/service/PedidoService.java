package cl.ubb.stockflow.service;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.exception.NotFoundException;
import cl.ubb.stockflow.exception.StockInsuficienteException;
import cl.ubb.stockflow.model.*;
import cl.ubb.stockflow.repository.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {
  private final PedidoRepository pedidos;
  private final ClienteRepository clientes;
  private final ProductoRepository productos;

  public PedidoService(PedidoRepository pedidos, ClienteRepository clientes,
      ProductoRepository productos) {
    this.pedidos = pedidos;
    this.clientes = clientes;
    this.productos = productos;
  }

  /**
   * Crea un pedido multi-ítem en estado PENDIENTE.
   * Descuenta stock de TODOS los ítems de inmediato; ante falta de stock
   * o cualquier error, la transacción revierte TODO (rollback total).
   */
  @Transactional
  public PedidoResponse crear(PedidoRequest req) {
    Cliente cliente = clientes.findById(req.clienteId())
        .orElseThrow(() -> new NotFoundException("Cliente no encontrado id=" + req.clienteId()));

    Pedido pedido = new Pedido();
    pedido.setCliente(cliente);
    pedido.setFecha(LocalDateTime.now());
    pedido.setEstado(EstadoPedido.PENDIENTE);

    BigDecimal total = BigDecimal.ZERO;
    for (PedidoRequest.PedidoItemRequest item : req.items()) {
      Producto p = productos.findById(item.productoId())
          .orElseThrow(() -> new NotFoundException("Producto no encontrado id=" + item.productoId()));
      if (p.getStockActual() < item.cantidad()) {
        throw new StockInsuficienteException(p.getId());
      }
      // Descuento inmediato; @Version de Producto detecta carrera concurrente -> 409
      p.setStockActual(p.getStockActual() - item.cantidad());
      productos.save(p);

      DetallePedido d = new DetallePedido();
      d.setProducto(p);
      d.setCantidad(item.cantidad());
      d.setPrecioUnitario(p.getPrecio());
      pedido.addDetalle(d);
      total = total.add(p.getPrecio().multiply(BigDecimal.valueOf(item.cantidad())));
    }
    pedido.setTotal(total);
    Pedido saved = pedidos.save(pedido);
    // Recarga con EntityGraph para devolver detalle completo sin N+1
    Pedido completo = pedidos.findByIdConDetalle(saved.getId()).orElse(saved);
    return PedidoMapper.aDto(completo);
  }

  @Transactional(readOnly = true)
  public PedidoResponse obtener(Long id) {
    Pedido p = pedidos.findByIdConDetalle(id)
        .orElseThrow(() -> new NotFoundException("Pedido no encontrado id=" + id));
    return PedidoMapper.aDto(p);
  }

  @Transactional(readOnly = true)
  public Page<PedidoResponse> listar(EstadoPedido estado, LocalDateTime desde,
      LocalDateTime hasta, Pageable pageable) {
    return pedidos.filtrar(estado, desde, hasta, pageable).map(PedidoMapper::aDto);
  }
}
