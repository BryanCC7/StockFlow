package cl.ubb.stockflow.controller;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.service.ClienteService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
  private final ClienteService service;

  public ClienteController(ClienteService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<ClienteResponse> crear(@Valid @RequestBody ClienteRequest req) {
    ClienteResponse dto = service.crear(req);
    return ResponseEntity.created(URI.create("/api/clientes/" + dto.id())).body(dto);
  }

  @GetMapping
  public Page<ClienteResponse> listar(@RequestParam(required = false) String nombre,
      @PageableDefault(size = 20) Pageable pageable) {
    return service.listar(nombre, pageable);
  }

  @GetMapping("/{id}")
  public ClienteResponse obtener(@PathVariable Long id) {
    return service.obtener(id);
  }

  @GetMapping("/{id}/pedidos")
  public List<PedidoResponse> historial(@PathVariable Long id) {
    return service.historial(id);
  }

  @PutMapping("/{id}")
  public ClienteResponse actualizar(@PathVariable Long id,
      @Valid @RequestBody ClienteRequest req) {
    return service.actualizar(id, req);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
