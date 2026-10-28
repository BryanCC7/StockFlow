package cl.ubb.stockflow.repository;

import cl.ubb.stockflow.model.EstadoPedido;
import cl.ubb.stockflow.model.Pedido;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
  @EntityGraph(attributePaths = {"detalles", "detalles.producto", "cliente"})
  @Query("SELECT p FROM Pedido p WHERE p.id = :id")
  Optional<Pedido> findByIdConDetalle(@Param("id") Long id);

  @EntityGraph(attributePaths = {"detalles", "detalles.producto", "cliente"})
  List<Pedido> findByClienteIdOrderByFechaDesc(Long clienteId);

  @EntityGraph(attributePaths = {"cliente"})
  @Query("SELECT p FROM Pedido p WHERE "
      + "(:estado IS NULL OR p.estado = :estado) AND "
      + "(:desde IS NULL OR p.fecha >= :desde) AND "
      + "(:hasta IS NULL OR p.fecha <= :hasta)")
  Page<Pedido> filtrar(@Param("estado") EstadoPedido estado,
                       @Param("desde") LocalDateTime desde,
                       @Param("hasta") LocalDateTime hasta,
                       Pageable pageable);

  @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
  @Query("SELECT p FROM Pedido p WHERE p.estado <> cl.ubb.stockflow.model.EstadoPedido.CANCELADO"
      + " AND p.fecha BETWEEN :desde AND :hasta")
  List<Pedido> buscarVentas(@Param("desde") LocalDateTime desde,
      @Param("hasta") LocalDateTime hasta);
}
