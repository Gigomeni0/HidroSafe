# HidroSafe Backend API REST

Este documento descreve detalhadamente os endpoints REST, estruturas de dados, fluxos de funcionamento e recomendações para implementação de um backend em **Spring Boot** (Java) que atenderá o aplicativo React Native HidroSafe.

---

## 📑 Sumário

- [Configuração Geral](#configuração-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Monitoramento de Dados](#1-monitoramento-de-dados)
  - [Histórico de Eventos](#2-histórico-de-eventos)
  - [Sistema de Alertas](#3-sistema-de-alertas)
  - [Controle do Sistema](#4-controle-do-sistema)
- [Modelos de Dados / DTOs](#modelos-de-dados--dtos)
- [Tratamento de Erros](#tratamento-de-erros)
- [Fluxo de Funcionamento](#fluxo-de-funcionamento)
- [Recomendações Spring Boot](#recomendações-spring-boot)
- [Banco de Dados](#banco-de-dados)
- [Integração com App React Native](#integração-com-app-react-native)

---

## Configuração Geral

- Base URL: `http://localhost:8080/api`
- Content-Type: `application/json`
- Métodos HTTP suportados: `GET`, `POST`

## Autenticação

Não há autenticação implementada por enquanto. Todas as rotas são públicas. Futuramente, pode-se integrar Spring Security com JWT.

## Endpoints

### 1. Monitoramento de Dados

**GET** `/monitoramento/dados-atuais`

- **Descrição:** Retorna os dados em tempo real dos sensores.
- **Response Body (200):**
  ```json
  {
    "nivelRio": number,        // metros
    "precipitacao": number,    // mm/h
    "temperatura": number,     // °C
    "risco": "baixo"|"medio"|"alto"|"critico",
    "ultimaAtualizacao": "ISO8601",
    "localizacao": "string"
  }
  ```

### 2. Histórico de Eventos

**GET** `/historico/eventos`

- **Descrição:** Lista o histórico de eventos do sistema (alertas, medições, controles, etc.).
- **Response Body (200):**
  ```json
  [
    {
      "id": "uuid",
      "tipo": "ALERTA"|"MEDICAO"|"SISTEMA"|"CONTROLE"|"MANUTENCAO",
      "descricao": "string",
      "timestamp": "ISO8601",
      "valor": "string"        // opcional
    },
    ...
  ]
  ```

### 3. Sistema de Alertas

**GET** `/alertas`

- **Descrição:** Retorna os alertas ativos (críticos, avisos, informativos).
- **Response Body (200):**
  ```json
  [
    {
      "id": "uuid",
      "tipo": "critico"|"aviso"|"info",
      "titulo": "string",
      "descricao": "string",
      "timestamp": "ISO8601",
      "resolvido": boolean
    },
    ...
  ]
  ```

### 4. Controle do Sistema

#### 4.1 Estado Atual

**GET** `/controles/estado`

- **Descrição:** Retorna estado atual dos controles (bombas, comportas, alertas).
- **Response Body (200):**
  ```json
  {
    "bombasDrenagem": boolean,
    "comportasAbertas": boolean,
    "alertasAtivos": boolean
  }
  ```

#### 4.2 Executar Comando

**POST** `/controles/comando`

- **Descrição:** Executa um comando de controle individual.
- **Request Body:**
  ```json
  {
    "tipo": "bombas"|"comportas"|"alertas",
    "valor": boolean
  }
  ```
- **Response Body (200):** Mesmos campos do estado atual (`/controles/estado`).

---

## Modelos de Dados / DTOs

Em **Java/Spring Boot**, recomenda-se criar classes em `dto/` e `model/`. Exemplos de DTO:

```java
public class DadosMonitoramentoDTO {
    private double nivelRio;
    private double precipitacao;
    private double temperatura;
    private String risco;
    private Instant ultimaAtualizacao;
    private String localizacao;
    // getters e setters
}

public class EventoDTO {
    private UUID id;
    private String tipo;
    private String descricao;
    private Instant timestamp;
    private String valor;
    // getters e setters
}

public class AlertaDTO {
    private UUID id;
    private String tipo;
    private String titulo;
    private String descricao;
    private Instant timestamp;
    private boolean resolvido;
    // getters e setters
}

public class ControlesSistemaDTO {
    private boolean bombasDrenagem;
    private boolean comportasAbertas;
    private boolean alertasAtivos;
    // getters e setters
}

public class ComandoControleDTO {
    private String tipo;
    private boolean valor;
    // getters e setters
}
```

---

## Tratamento de Erros

- **400 Bad Request:** Parâmetros inválidos.
- **404 Not Found:** Recurso não encontrado.
- **500 Internal Server Error:** Erro interno no servidor.
- **503 Service Unavailable:** Sensores offline ou indisponibilidade externa.

Resposta de erro padrão:
```json
{
  "timestamp": "ISO8601",
  "status": number,
  "error": "string",
  "message": "string",
  "path": "string"
}
```

---

## Fluxo de Funcionamento

1. **App Inicializa**
   - `GET /controles/estado`  → carrega estado dos controles
   - `GET /monitoramento/dados-atuais` → carrega dados dos sensores
   - `GET /alertas` → carrega alertas ativos
2. **Usuário Interage**
   - Alterna um switch → `POST /controles/comando`
   - Ações globais (Desligar/Ligar todos) → múltiplos `POST /controles/comando`
3. **Atualização Automática**
   - Pull-to-refresh (React Native)
   - Polling a cada 30s (configurável)
   - **Futuro:** WebSocket para push em tempo real

---

## Recomendações Spring Boot

1. Gere o projeto no [Spring Initializr](https://start.spring.io/) com:
   - Dependências: **Spring Web**, **Spring Data JPA**, **Spring Boot DevTools**, **PostgreSQL Driver**
2. Estrutura de pacotes:
   ```
   com.hidrosafe
   ├── controller  (REST controllers)
   ├── service     (lógica de negócio)
   ├── repository  (interfaces JPA)
   ├── dto         (DTOs)
   ├── model       (entidades JPA)
   └── exception   (tratamento de erros)
   ```
3. Defina controllers anotados com `@RestController` e `@RequestMapping("/api")`.
4. Utilize `@GetMapping` e `@PostMapping` para mapear endpoints com validação via `@Valid`.
5. Exemplo de Controller:
   ```java
   @RestController
   @RequestMapping("/api/monitoramento")
   public class MonitoramentoController {

     @Autowired
     private MonitoramentoService service;

     @GetMapping("/dados-atuais")
     public ResponseEntity<DadosMonitoramentoDTO> getDados() {
       return ResponseEntity.ok(service.obterDadosAtuais());
     }
   }
   ```
6. Exponha logs e utilize `@ControllerAdvice` para tratamento global de exceções.

---

## Banco de Dados

- **Produção:** PostgreSQL
- **Desenvolvimento:** H2 ou SQLite (em memória) para testes rápidos
- **NoSQL (opcional):** MongoDB para armazenar séries temporais

Entidades JPA: mapeie `DadosMonitoramento`, `Evento`, `Alerta` e `ControleSistema` com chaves primárias e índices em `timestamp`.

---

## Integração com App React Native

O cliente HTTP (`services/api.ts`) consome exatamente estes caminhos:
```ts
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
axios.get<DTO[]>(`${API_BASE_URL}/historico/eventos`);
// ...outros métodos GET e POST conforme documentação
```

Configure `API_BASE_URL` e `USE_MOCK_DATA = false` em `api.ts` antes de rodar.

