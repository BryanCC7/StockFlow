package cl.ubb.stockflow.exception;

import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final org.slf4j.Logger log =
      org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail validacion(MethodArgumentNotValidException ex) {
    String detalle = ex.getBindingResult().getFieldErrors().stream()
        .map(f -> f.getField() + ": " + f.getDefaultMessage())
        .collect(Collectors.joining("; "));
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detalle);
    pd.setTitle("Validación fallida");
    pd.setType(URI.create("https://stockflow/errors/validacion"));
    return pd;
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ProblemDetail violacion(ConstraintViolationException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    pd.setTitle("Validación fallida");
    return pd;
  }

  @ExceptionHandler(NotFoundException.class)
  public ProblemDetail noEncontrado(NotFoundException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    pd.setTitle("Recurso no encontrado");
    return pd;
  }

  @ExceptionHandler({StockInsuficienteException.class, EmailDuplicadoException.class})
  public ProblemDetail conflicto(RuntimeException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    pd.setTitle("Conflicto");
    return pd;
  }

  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ProblemDetail versionConflicto(ObjectOptimisticLockingFailureException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
        "Conflicto de concurrencia: el recurso fue modificado por otra transacción");
    pd.setTitle("Conflicto de versión");
    return pd;
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ProblemDetail integridad(DataIntegrityViolationException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
        "Violación de integridad (posible duplicado)");
    pd.setTitle("Conflicto");
    return pd;
  }

  @ExceptionHandler({MethodArgumentTypeMismatchException.class,
      java.time.format.DateTimeParseException.class})
  public ProblemDetail tipoInvalido(Exception ex) {
    String detalle = "Parámetro con formato inválido: " + ex.getMessage();
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detalle);
    pd.setTitle("Parámetro inválido");
    pd.setType(URI.create("https://stockflow/errors/parametro-invalido"));
    return pd;
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ProblemDetail argumentoInvalido(IllegalArgumentException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    pd.setTitle("Parámetro inválido");
    pd.setType(URI.create("https://stockflow/errors/parametro-invalido"));
    return pd;
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail inesperado(Exception ex) {
    log.error("Error inesperado", ex);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "Error inesperado");
    pd.setTitle("Error interno");
    return pd;
  }
}
