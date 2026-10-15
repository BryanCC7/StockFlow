package cl.ubb.stockflow.exception;

public class StockInsuficienteException extends RuntimeException {
  private final Long productoId;
  public StockInsuficienteException(Long productoId) {
    super("Stock insuficiente para producto id=" + productoId);
    this.productoId = productoId;
  }
  public Long getProductoId() { return productoId; }
}
