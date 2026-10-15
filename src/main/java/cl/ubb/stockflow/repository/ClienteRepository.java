package cl.ubb.stockflow.repository;

import cl.ubb.stockflow.model.Cliente;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
  Optional<Cliente> findByEmail(String email);
  boolean existsByEmail(String email);
  Page<Cliente> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}
