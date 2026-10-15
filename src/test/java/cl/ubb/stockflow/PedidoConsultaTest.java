package cl.ubb.stockflow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Cubre huecos del verify FAIL: CM-1 historial, OP-2 filtros (formato spec
 * solo-fecha) + detalle 404, handler 400 de fechas, y WARNINGS (filtro nombre,
 * totales/valorizacion de reportes).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PedidoConsultaTest {

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;

  private String crearPedido(int clienteId, int productoId, int cantidad) throws Exception {
    MvcResult r = mvc.perform(post("/api/pedidos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"clienteId\":" + clienteId
                + ",\"items\":[{\"productoId\":" + productoId
                + ",\"cantidad\":" + cantidad + "}]}"))
        .andExpect(status().isCreated())
        .andReturn();
    return r.getResponse().getContentAsString();
  }

  @Test
  void historialClienteDevuelve200OrdenDesc() throws Exception {
    crearPedido(1, 1, 1);
    Thread.sleep(10);
    crearPedido(1, 4, 1);

    MvcResult r = mvc.perform(get("/api/clientes/1/pedidos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2))
        .andReturn();

    JsonNode arr = mapper.readTree(r.getResponse().getContentAsString());
    assertThat(arr.size()).isEqualTo(2);
    assertThat(arr.get(0).get("clienteId").asLong()).isEqualTo(1L);
    // Orden descendente por fecha: el mas reciente primero
    String f0 = arr.get(0).get("fecha").asText();
    String f1 = arr.get(1).get("fecha").asText();
    assertThat(f0.compareTo(f1)).isGreaterThanOrEqualTo(0);
  }

  @Test
  void filtrarPorEstadoYFechaSoloFechaFormatoSpec() throws Exception {
    crearPedido(2, 1, 1);

    mvc.perform(get("/api/pedidos")
            .param("estado", "PENDIENTE")
            .param("fechaDesde", "2026-01-01")
            .param("fechaHasta", "2026-12-31"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray())
        .andExpect(jsonPath("$.content.length()").value(1))
        .andExpect(jsonPath("$.content[0].estado").value("PENDIENTE"));
  }

  @Test
  void pedidoInexistenteDevuelve404() throws Exception {
    mvc.perform(get("/api/pedidos/999999")).andExpect(status().isNotFound());
  }

  @Test
  void fechaInvalidaDevuelve400() throws Exception {
    mvc.perform(get("/api/pedidos").param("fechaDesde", "no-es-fecha"))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/pedidos").param("estado", "INEXISTENTE"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void filtroNombreEjerceBusquedaParcial() throws Exception {
    mvc.perform(get("/api/productos").param("nombre", "laptop"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray())
        .andExpect(jsonPath("$.content.length()").value(1))
        .andExpect(jsonPath("$.content[0].nombre").value("Laptop Pro 14"));
  }

  @Test
  void reportesConTotalesYValorizacionConsistentes() throws Exception {
    crearPedido(3, 1, 2); // Cafe Grano 8990 x2 = 17980

    MvcResult ventas = mvc.perform(get("/api/reportes/ventas")
            .param("desde", "2026-01-01").param("hasta", "2026-12-31"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.numeroPedidos").value(1))
        .andExpect(jsonPath("$.totalVendido").value(17980.0))
        .andExpect(jsonPath("$.porProducto[0].productoId").value(1))
        .andExpect(jsonPath("$.porProducto[0].cantidadVendida").value(2))
        .andExpect(jsonPath("$.porProducto[0].montoVendido").value(17980.0))
        .andReturn();
    JsonNode v = mapper.readTree(ventas.getResponse().getContentAsString());
    assertThat(v.get("numeroPedidos").asLong()).isEqualTo(1L);

    MvcResult inv = mvc.perform(get("/api/reportes/inventario"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalProductos").value(12))
        .andExpect(jsonPath("$.valorizacionTotal").exists())
        .andExpect(jsonPath("$.items.length()").value(12))
        .andReturn();
    JsonNode items = mapper.readTree(inv.getResponse().getContentAsString()).get("items");
    BigDecimal suma = BigDecimal.ZERO;
    for (JsonNode it : items) {
      BigDecimal precio = new BigDecimal(it.get("precio").asText());
      BigDecimal esperada = precio.multiply(BigDecimal.valueOf(it.get("stock").asLong()));
      assertThat(new BigDecimal(it.get("valorizacion").asText()))
          .isEqualByComparingTo(esperada);
      suma = suma.add(esperada);
      // bajoStock coherente con umbral por defecto 5
      assertThat(it.get("bajoStock").asBoolean())
          .isEqualTo(it.get("stock").asLong() <= 5);
    }
    BigDecimal total = new BigDecimal(
        mapper.readTree(inv.getResponse().getContentAsString()).get("valorizacionTotal").asText());
    assertThat(total).isEqualByComparingTo(suma);
  }
}
