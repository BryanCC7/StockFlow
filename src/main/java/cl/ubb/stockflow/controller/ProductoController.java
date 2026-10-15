package cl.ubb.stockflow.controller;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.service.ProductoService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
  private final ProductoService service;

  public ProductoController(ProductoService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest req) {
    ProductoResponse dto = service.crear(req);
    return ResponseEntity.created(URI.create("/api/productos/" + dto.id())).body(dto);
  }

  // Contrato Page serializado (Spring Data PageImpl: content/totalElements/totalPages/size/number...);
  // se documenta como estable para este cambio (no se migra a PagedModel en stockflow-base).
  @GetMapping
  public Page<ProductoResponse> listar(
      @RequestParam(required = false) String categoria,
      @RequestParam(required = false) String nombre,
      @RequestParam(required = false) BigDecimal precioMin,
      @RequestParam(required = false) BigDecimal precioMax,
      @PageableDefault(size = 20) Pageable pageable) {
    return service.listar(categoria, nombre, precioMin, precioMax, pageable);
  }

  @GetMapping("/stock-bajo")
  public List<ProductoResponse> stockBajo(@RequestParam(defaultValue = "5") int umbral) {
    return service.stockBajo(umbral);
  }

  @GetMapping("/{id}")
  public ProductoResponse obtener(@PathVariable Long id) {
    return service.obtener(id);
  }

  @PutMapping("/{id}")
  public ProductoResponse actualizar(@PathVariable Long id,
      @Valid @RequestBody ProductoRequest req) {
    return service.actualizar(id, req);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    service.eliminar(id);
    return ResponseEntity.noContent().build();
  }
}
