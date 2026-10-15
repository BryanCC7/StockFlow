package cl.ubb.stockflow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductoControllerTest {

  @Autowired MockMvc mvc;

  @Test
  void crearValidoDevuelve201() throws Exception {
    mvc.perform(post("/api/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"nombre":"Nuevo Prod","categoria":"Test","precio":100,"stockActual":10}"""))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").exists());
  }

  @Test
  void precioInvalidoDevuelve400() throws Exception {
    mvc.perform(post("/api/productos")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"nombre":"Malo","precio":-5,"stockActual":10}"""))
        .andExpect(status().isBadRequest());
  }

  @Test
  void productoInexistenteDevuelve404() throws Exception {
    mvc.perform(get("/api/productos/999999")).andExpect(status().isNotFound());
  }

  @Test
  void filtroCombinadoYStockBajo() throws Exception {
    mvc.perform(get("/api/productos")
            .param("categoria", "Deporte")
            .param("precioMin", "10000")
            .param("precioMax", "40000"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray());
    mvc.perform(get("/api/productos/stock-bajo").param("umbral", "5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());
  }

  @Test
  void emailDuplicadoDevuelve409() throws Exception {
    String body = """
        {"nombre":"Dup","email":"ana.torres@mail.cl"}""";
    mvc.perform(post("/api/clientes")
            .contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isConflict());
  }

  @Test
  void pedidoSinStockDevuelve409() throws Exception {
    // Lámpara LED (id 7 del seed) tiene stock 0
    String body = """
        {"clienteId":1,"items":[{"productoId":7,"cantidad":1}]}""";
    mvc.perform(post("/api/pedidos")
            .contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isConflict());
  }

  @Test
  void reportesResponden() throws Exception {
    mvc.perform(get("/api/reportes/inventario")).andExpect(status().isOk())
        .andExpect(jsonPath("$.valorizacionTotal").exists());
    mvc.perform(get("/api/reportes/ventas")
            .param("desde", "2026-01-01").param("hasta", "2026-12-31"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalVendido").exists());
  }
}
