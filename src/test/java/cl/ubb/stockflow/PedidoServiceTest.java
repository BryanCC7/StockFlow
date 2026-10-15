package cl.ubb.stockflow;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.exception.StockInsuficienteException;
import cl.ubb.stockflow.model.*;
import cl.ubb.stockflow.repository.*;
import cl.ubb.stockflow.service.PedidoService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
class PedidoServiceTest {

  @Autowired PedidoService pedidos;
  @Autowired ClienteRepository clientes;
  @Autowired ProductoRepository productos;
  @Autowired PedidoRepository pedidoRepo;

  private Cliente cliente() {
    Cliente c = new Cliente();
    c.setNombre("Test User");
    c.setEmail("test" + System.nanoTime() + "@mail.cl");
    return clientes.save(c);
  }

  private Producto producto(String nombre, int stock, String precio) {
    Producto p = new Producto();
    p.setNombre(nombre);
    p.setCategoria("Test");
    p.setPrecio(new BigDecimal(precio));
    p.setStockActual(stock);
    return productos.save(p);
  }

  @Test
  @Transactional
  void pedidoMultiItemExitosoDescuentaStock() {
    Cliente c = cliente();
    Producto a = producto("Prod A", 10, "100.00");
    Producto b = producto("Prod B", 5, "50.00");

    PedidoResponse resp = pedidos.crear(new PedidoRequest(c.getId(), List.of(
        new PedidoRequest.PedidoItemRequest(a.getId(), 2),
        new PedidoRequest.PedidoItemRequest(b.getId(), 1))));

    assertThat(resp.estado()).isEqualTo("PENDIENTE");
    assertThat(resp.total()).isEqualByComparingTo("250.00");
    assertThat(productos.findById(a.getId()).orElseThrow().getStockActual()).isEqualTo(8);
    assertThat(productos.findById(b.getId()).orElseThrow().getStockActual()).isEqualTo(4);
  }

  @Test
  void faltaStockRevierteTodo() {
    // Sin @Transactional envolvente: el rollback del service debe ser total y observable.
    Cliente c = cliente();
    Producto a = producto("Prod A2 " + System.nanoTime(), 10, "100.00");
    Producto b = producto("Prod B2 " + System.nanoTime(), 0, "50.00");
    long antes = pedidoRepo.count();

    assertThatThrownBy(() -> pedidos.crear(new PedidoRequest(c.getId(), List.of(
        new PedidoRequest.PedidoItemRequest(a.getId(), 2),
        new PedidoRequest.PedidoItemRequest(b.getId(), 1)))))
        .isInstanceOf(StockInsuficienteException.class);

    // Rollback total: stock intacto y cero pedidos nuevos
    assertThat(productos.findById(a.getId()).orElseThrow().getStockActual()).isEqualTo(10);
    assertThat(pedidoRepo.count()).isEqualTo(antes);
  }
}
