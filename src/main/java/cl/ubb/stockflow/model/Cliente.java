package cl.ubb.stockflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cliente",
    uniqueConstraints = @UniqueConstraint(name = "uq_cliente_email", columnNames = "email"))
public class Cliente extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(nullable = false, length = 160)
  private String email;

  @Column(length = 40)
  private String telefono;

  @Version
  private Long version;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getTelefono() { return telefono; }
  public void setTelefono(String telefono) { this.telefono = telefono; }
  public Long getVersion() { return version; }
}
