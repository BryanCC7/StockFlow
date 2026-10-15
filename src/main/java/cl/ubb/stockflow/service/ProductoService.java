package cl.ubb.stockflow.service;

import cl.ubb.stockflow.dto.*;
import cl.ubb.stockflow.exception.NotFoundException;
import cl.ubb.stockflow.model.Producto;
import cl.ubb.stockflow.repository.ProductoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {
  private final ProductoRepository productos;

  public ProductoService(ProductoRepository productos) {
    this.productos = productos;
  }

  @Transactional
  public ProductoResponse crear(ProductoRequest req) {
    Producto p = new Producto();
    p.setNombre(req.nombre());
    p.setCategoria(req.categoria());
    p.setPrecio(req.precio());
    p.setStockActual(req.stockActual());
    return aDto(productos.save(p));
  }

  @Transactional(readOnly = true)
  public ProductoResponse obtener(Long id) {
    return aDto(buscar(id));
  }

  @Transactional(readOnly = true)
  public Page<ProductoResponse> listar(String categoria, String nombre,
      BigDecimal precioMin, BigDecimal precioMax, Pageable pageable) {
    boolean sinFiltros = (categoria == null || categoria.isBlank())
        && (nombre == null || nombre.isBlank()) && precioMin == null && precioMax == null;
    Page<Producto> page = sinFiltros
        ? productos.findAll(pageable)
        : productos.filtrar(categoria, nombre, precioMin, precioMax, pageable);
    return page.map(this::aDto);
  }

  @Transactional
  public ProductoResponse actualizar(Long id, ProductoRequest req) {
    Producto p = buscar(id);
    p.setNombre(req.nombre());
    p.setCategoria(req.categoria());
    p.setPrecio(req.precio());
    p.setStockActual(req.stockActual());
    return aDto(productos.save(p));
  }

  @Transactional
  public void eliminar(Long id) {
    buscar(id);
    productos.deleteById(id);
  }

  @Transactional(readOnly = true)
  public List<ProductoResponse> stockBajo(int umbral) {
    return productos.findByStockActualLessThanEqual(umbral).stream().map(this::aDto).toList();
  }

  private Producto buscar(Long id) {
    return productos.findById(id)
        .orElseThrow(() -> new NotFoundException("Producto no encontrado id=" + id));
  }

  private ProductoResponse aDto(Producto p) {
    return new ProductoResponse(p.getId(), p.getNombre(), p.getCategoria(),
        p.getPrecio(), p.getStockActual(), null, p.getCreatedAt(), p.getUpdatedAt());
  }
}
