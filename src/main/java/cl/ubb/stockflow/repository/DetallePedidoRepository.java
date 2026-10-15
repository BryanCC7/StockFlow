package cl.ubb.stockflow.repository;

import cl.ubb.stockflow.model.DetallePedido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
  List<DetallePedido> findByPedidoId(Long pedidoId);
}
