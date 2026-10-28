package cl.ubb.stockflow.service;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.exception.EmailDuplicadoException;
import cl.ubb.stockflow.exception.NotFoundException;
import cl.ubb.stockflow.model.Cliente;
import cl.ubb.stockflow.repository.ClienteRepository;
import cl.ubb.stockflow.repository.PedidoRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {
  private final ClienteRepository clientes;
  private final PedidoRepository pedidos;

  public ClienteService(ClienteRepository clientes, PedidoRepository pedidos) {
    this.clientes = clientes;
    this.pedidos = pedidos;
  }

  @Transactional
  public ClienteResponse crear(ClienteRequest req) {
    if (clientes.existsByEmail(req.email())) throw new EmailDuplicadoException(req.email());
    Cliente c = new Cliente();
    c.setNombre(req.nombre());
    c.setEmail(req.email());
    c.setTelefono(req.telefono());
    Cliente saved = clientes.save(c);
    return aDto(saved);
  }

  @Transactional(readOnly = true)
  public ClienteResponse obtener(Long id) {
    return aDto(buscar(id));
  }

  @Transactional(readOnly = true)
  public Page<ClienteResponse> listar(String nombre, Pageable pageable) {
    Page<Cliente> page = (nombre == null || nombre.isBlank())
        ? clientes.findAll(pageable)
        : clientes.findByNombreContainingIgnoreCase(nombre, pageable);
    return page.map(this::aDto);
  }

  @Transactional
  public ClienteResponse actualizar(Long id, ClienteRequest req) {
    Cliente c = buscar(id);
    if (!c.getEmail().equalsIgnoreCase(req.email()) && clientes.existsByEmail(req.email())) {
      throw new EmailDuplicadoException(req.email());
    }
    c.setNombre(req.nombre());
    c.setEmail(req.email());
    c.setTelefono(req.telefono());
    return aDto(clientes.save(c));
  }

  @Transactional
  public void eliminar(Long id) {
    buscar(id);
    clientes.deleteById(id);
  }

  @Transactional(readOnly = true)
  public List<PedidoResponse> historial(Long clienteId) {
    buscar(clienteId);
    return pedidos.findByClienteIdOrderByFechaDesc(clienteId).stream()
        .map(PedidoMapper::aDto).toList();
  }

  private Cliente buscar(Long id) {
    return clientes.findById(id)
        .orElseThrow(() -> new NotFoundException("Cliente no encontrado id=" + id));
  }

  private ClienteResponse aDto(Cliente c) {
    return new ClienteResponse(c.getId(), c.getNombre(), c.getEmail(),
        c.getTelefono(), c.getVersion(), c.getCreatedAt(), c.getUpdatedAt());
  }
}
