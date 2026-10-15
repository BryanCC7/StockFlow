package cl.ubb.stockflow.controller;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.model.EstadoPedido;
import cl.ubb.stockflow.service.PedidoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
  private final PedidoService service;

  public PedidoController(PedidoService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody PedidoRequest req) {
    PedidoResponse dto = service.crear(req);
    return ResponseEntity.created(URI.create("/api/pedidos/" + dto.id())).body(dto);
  }

  // Contrato Page serializado (Spring Data PageImpl: content/totalElements/totalPages/size/number...);
  // se documenta como estable para este cambio (no se migra a PagedModel en stockflow-base).
  @GetMapping
  public Page<PedidoResponse> listar(
      @RequestParam(value = "estado", required = false) EstadoPedido estado,
      @RequestParam(value = "fechaDesde", required = false) String fechaDesde,
      @RequestParam(value = "fechaHasta", required = false) String fechaHasta,
      @PageableDefault(size = 20) Pageable pageable) {
    // Acepta fecha sola (spec OP-2: 2026-01-01) o datetime completo; formato invalido -> 400.
    return service.listar(estado, parseDesde(fechaDesde), parseHasta(fechaHasta), pageable);
  }

  @GetMapping("/{id}")
  public PedidoResponse obtener(@PathVariable Long id) {
    return service.obtener(id);
  }

  private static LocalDateTime parseDesde(String s) {
    if (s == null || s.isBlank()) return null;
    try {
      return LocalDateTime.parse(s.trim());
    } catch (DateTimeParseException e1) {
      try {
        return LocalDate.parse(s.trim()).atStartOfDay();
      } catch (DateTimeParseException e2) {
        throw new IllegalArgumentException(
            "fechaDesde con formato inválido: '" + s + "'. Use yyyy-MM-dd o yyyy-MM-dd'T'HH:mm:ss");
      }
    }
  }

  private static LocalDateTime parseHasta(String s) {
    if (s == null || s.isBlank()) return null;
    try {
      return LocalDateTime.parse(s.trim());
    } catch (DateTimeParseException e1) {
      try {
        return LocalDate.parse(s.trim()).atTime(23, 59, 59);
      } catch (DateTimeParseException e2) {
        throw new IllegalArgumentException(
            "fechaHasta con formato inválido: '" + s + "'. Use yyyy-MM-dd o yyyy-MM-dd'T'HH:mm:ss");
      }
    }
  }
}
