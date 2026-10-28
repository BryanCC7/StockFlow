package cl.ubb.stockflow.repository;

import cl.ubb.stockflow.model.Producto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
  List<Producto> findByStockActualLessThanEqual(Integer umbral);

  @Query("SELECT p FROM Producto p WHERE "
      + "(:categoria IS NULL OR LOWER(p.categoria) = LOWER(:categoria)) AND "
      + "(:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND "
      + "(:precioMin IS NULL OR p.precio >= :precioMin) AND "
      + "(:precioMax IS NULL OR p.precio <= :precioMax)")
  Page<Producto> filtrar(@Param("categoria") String categoria,
                         @Param("nombre") String nombre,
                         @Param("precioMin") BigDecimal precioMin,
                         @Param("precioMax") BigDecimal precioMax,
                         Pageable pageable);
}
