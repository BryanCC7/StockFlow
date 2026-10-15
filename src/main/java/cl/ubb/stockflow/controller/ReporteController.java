package cl.ubb.stockflow.controller;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.service.ReporteService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
  private final ReporteService service;

  public ReporteController(ReporteService service) {
    this.service = service;
  }

  @GetMapping("/ventas")
  public ReporteVentasResponse ventas(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
    return service.ventas(desde, hasta);
  }

  @GetMapping("/inventario")
  public ReporteInventarioResponse inventario(
      @RequestParam(defaultValue = "5") int umbral) {
    return service.inventario(umbral);
  }
}
