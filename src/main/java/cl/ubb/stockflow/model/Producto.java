package cl.ubb.stockflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto",
    indexes = {
      @Index(name = "idx_producto_categoria", columnList = "categoria"),
      @Index(name = "idx_producto_precio", columnList = "precio")
    })
public class Producto extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 140)
  private String nombre;

  @Column(length = 80)
  private String categoria;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal precio;

  @Column(name = "stock_actual", nullable = false)
  private Integer stockActual = 0;

  @Version
  private Long version;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }
  public String getCategoria() { return categoria; }
  public void setCategoria(String categoria) { this.categoria = categoria; }
  public BigDecimal getPrecio() { return precio; }
  public void setPrecio(BigDecimal precio) { this.precio = precio; }
  public Integer getStockActual() { return stockActual; }
  public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }
  public Long getVersion() { return version; }
}
