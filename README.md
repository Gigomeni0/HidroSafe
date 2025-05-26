📋 Documentação da API REST - HidroSafe Backend
🔧 Configuração Base
Base URL: http://localhost:8080/api
Content-Type: application/json
Métodos: GET, POST
Autenticação: Não implementada (futuro)
🎯 Endpoints Necessários
1. Monitoramento de Dados
GET /monitoramento/dados-atuais
Descrição: Retorna dados em tempo real dos sensores

Response:

2. Histórico de Eventos
GET /historico/eventos
Descrição: Lista histórico de eventos do sistema

Response:

3. Sistema de Alertas
GET /alertas
Descrição: Retorna alertas ativos do sistema

Response:

4. Controle do Sistema
GET /controles/estado
Descrição: Retorna estado atual dos controles

Response:

POST /controles/comando
Descrição: Executa comando individual nos controles

Request Body:

Response:

🎛️ Estruturas de Dados
DadosMonitoramento
Evento
Alerta
ControlesSistema
ComandoControle
⚠️ Tratamento de Erros
Response de Erro
Códigos de Status HTTP
200 - Sucesso
400 - Requisição inválida
404 - Recurso não encontrado
500 - Erro interno do servidor
503 - Serviço indisponível (sensores offline)
🔄 Fluxo de Funcionamento
1. App Inicializa
GET /controles/estado - Carrega estado atual
GET /monitoramento/dados-atuais - Dados dos sensores
GET /alertas - Alertas ativos
2. Usuário Interage
Clica em switch individual → POST /controles/comando
Clica "Desligar Todos" → 3x POST /controles/comando (bomba, filtro, alertas = false)
Clica "Ligar Todos" → 3x POST /controles/comando (bomba, filtro, alertas = true)
3. Atualização Automática
Pull-to-refresh nas telas
Polling a cada 30 segundos (configurável)
WebSocket (implementação futura)
🛠️ Implementação Sugerida
Framework Recomendado
Node.js + Express.js
Java + Spring Boot
Python + FastAPI
C# + ASP.NET Core
Banco de Dados
PostgreSQL (produção)
SQLite (desenvolvimento)
MongoDB (se preferir NoSQL)
Estrutura de Tabelas
📱 Compatibilidade com App
O app React Native está configurado para funcionar com esta API através dos seguintes arquivos:

api.ts - Cliente HTTP que consome a API
controle.tsx - Tela de controles
monitoramento.tsx - Tela de monitoramento (a implementar)
alertas.tsx - Tela de alertas (a implementar)
historico.tsx - Tela de histórico
Configuração Inicial
Altere USE_MOCK_DATA = false em api.ts
Configure a API_BASE_URL para seu backend
Implemente os endpoints conforme documentado
Está tudo pronto para integração! 🚀