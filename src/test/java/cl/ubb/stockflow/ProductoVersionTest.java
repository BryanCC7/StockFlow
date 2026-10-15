package cl.ubb.stockflow;

import cl.ubb.stockflow.model.Producto;
import cl.ubb.stockflow.repository.ProductoRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class ProductoVersionTest {

  @Autowired ProductoRepository productos;
  @Autowired TestEntityManager em;

  @Test
  void conflictoConcurrenteSegundaEscrituraFalla() {
    Producto p = new Producto();
    p.setNombre("Concurrente");
    p.setPrecio(new BigDecimal("10.00"));
    p.setStockActual(10);
    p = productos.saveAndFlush(p);
    Long id = p.getId();
    em.detach(p);

    // Copia stale (version antigua) leida antes del cambio concurrente
    Producto stale = productos.findById(id).orElseThrow();
    em.detach(stale);

    // Cambio concurrente que avanza la version
    Producto fresh = productos.findById(id).orElseThrow();
    fresh.setStockActual(9);
    productos.saveAndFlush(fresh);

    // La copia stale intenta guardar con version vieja -> 409
    stale.setStockActual(8);
    assertThatThrownBy(() -> productos.saveAndFlush(stale))
        .isInstanceOf(ObjectOptimisticLockingFailureException.class);
  }

  @Test
  void finderStockBajo() {
    Producto p = new Producto();
    p.setNombre("Bajo");
    p.setPrecio(new BigDecimal("5.00"));
    p.setStockActual(2);
    productos.saveAndFlush(p);
    assertThat(productos.findByStockActualLessThanEqual(5))
        .anyMatch(x -> x.getId().equals(p.getId()));
  }
}
