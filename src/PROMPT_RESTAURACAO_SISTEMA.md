# 🔧 PROMPT COMPLETO - SISTEMA CASA DO AR - GESTÃO DE CLIMATIZAÇÃO

## 📋 VISÃO GERAL DO SISTEMA

Sistema completo de gestão para empresa de climatização com:
- Gestão de clientes e serviços
- Controle de equipes e técnicos
- Sistema financeiro com comissões automáticas
- Manutenções preventivas programadas
- Backup automático no Google Drive
- Dashboard com métricas em tempo real

---

## 🗄️ ENTIDADES DO SISTEMA

### 1. Cliente
```json
{
  "name": "Cliente",
  "type": "object",
  "properties": {
    "nome": { "type": "string", "description": "Nome completo do cliente" },
    "cpf": { "type": "string", "description": "CPF do cliente (opcional)" },
    "telefone": { "type": "string", "description": "Número de telefone com DDD" },
    "endereco": { "type": "string", "description": "Endereço completo do cliente" },
    "latitude": { "type": "number", "description": "Latitude da localização" },
    "longitude": { "type": "number", "description": "Longitude da localização" },
    "observacoes": { "type": "string", "description": "Observações sobre o cliente" },
    "ultima_manutencao": { "type": "string", "format": "date", "description": "Data da última manutenção" },
    "proxima_manutencao": { "type": "string", "format": "date", "description": "Data da próxima manutenção programada" },
    "segmentacao": { "type": "string", "enum": ["Potencial", "Regular", "VIP"], "default": "Regular" },
    "notas_internas": { "type": "string", "description": "Notas internas confidenciais" },
    "total_gasto": { "type": "number", "default": 0, "description": "Valor total gasto" },
    "quantidade_servicos": { "type": "integer", "default": 0, "description": "Total de serviços realizados" }
  },
  "required": ["nome", "telefone"]
}
```

### 2. Servico
```json
{
  "name": "Servico",
  "type": "object",
  "properties": {
    "cliente_nome": { "type": "string" },
    "cpf": { "type": "string" },
    "telefone": { "type": "string" },
    "endereco": { "type": "string" },
    "latitude": { "type": "number" },
    "longitude": { "type": "number" },
    "tipo_servico": {
      "type": "string",
      "enum": [
        "Limpeza de 9k", "Limpeza de 12k", "Limpeza de 18k", "Limpeza de 18k licitação 25/26",
        "Limpeza de 22 a 24k", "Limpeza de 24k", "Limpeza de 30 a 32k", "Limpeza piso e teto",
        "Limpeza no bolsão ar de 9 a 22k", "Limpeza no bolsão ar de 24 a 32k",
        "Instalação de 9k", "Instalação de 12k", "Instalação de 18k", "Instalação de 22 a 24k",
        "Instalação de 24k", "Instalação de 30 a 32k", "Instalação piso e teto",
        "Instalação de cortina de ar", "Mudança + limpeza ar 9/12/18", "Mudança + limpeza 22/24/30",
        "Retirada cortina de ar", "Troca de compressor", "Troca de capacitor",
        "Recarga de gás", "Carga de gás completa", "1/3 de gás", "2/3 de gás", "1/2 carga de gás",
        "Serviço de solda", "Troca de relé da placa", "Troca de sensor", "Troca de chave contadora",
        "Conserto de placa eletrônica", "Retirada de ar condicionado",
        "Serviço de passar tubulação de infra", "Ver defeito", "Troca de local", "Outro tipo de serviço"
      ]
    },
    "dia_semana": { "type": "string" },
    "data_programada": { "type": "string", "format": "date" },
    "horario": { "type": "string" },
    "descricao": { "type": "string" },
    "valor": { "type": "number" },
    "status": { "type": "string", "enum": ["aberto", "andamento", "concluido", "agendado", "reagendado"], "default": "aberto" },
    "observacoes_conclusao": { "type": "string" },
    "ativo": { "type": "boolean", "default": true },
    "usuario_atualizacao_status": { "type": "string" },
    "data_atualizacao_status": { "type": "string", "format": "date-time" },
    "equipe_id": { "type": "string" },
    "equipe_nome": { "type": "string" },
    "gerar_comissao": { "type": "boolean", "default": true },
    "comissao_gerada": { "type": "boolean", "default": false },
    "data_conclusao": { "type": "string", "format": "date-time" }
  },
  "required": ["cliente_nome", "telefone", "tipo_servico", "data_programada"]
}
```

### 3. Atendimento
```json
{
  "name": "Atendimento",
  "type": "object",
  "properties": {
    "servico_id": { "type": "string" },
    "cliente_nome": { "type": "string" },
    "cpf": { "type": "string" },
    "telefone": { "type": "string" },
    "endereco": { "type": "string" },
    "latitude": { "type": "number" },
    "longitude": { "type": "number" },
    "data_atendimento": { "type": "string", "format": "date" },
    "horario": { "type": "string" },
    "dia_semana": { "type": "string" },
    "tipo_servico": { "type": "string" },
    "descricao": { "type": "string" },
    "valor": { "type": "number" },
    "observacoes_conclusao": { "type": "string" },
    "equipe_id": { "type": "string" },
    "equipe_nome": { "type": "string" },
    "usuario_conclusao": { "type": "string" },
    "data_conclusao": { "type": "string", "format": "date-time" },
    "detalhes": { "type": "string", "description": "JSON com histórico completo" }
  },
  "required": ["cliente_nome", "tipo_servico"]
}
```

### 4. Equipe
```json
{
  "name": "Equipe",
  "type": "object",
  "properties": {
    "nome": { "type": "string" },
    "descricao": { "type": "string" },
    "cor": { "type": "string", "default": "#3b82f6" },
    "ativa": { "type": "boolean", "default": true }
  },
  "required": ["nome"]
}
```

### 5. LancamentoFinanceiro
```json
{
  "name": "LancamentoFinanceiro",
  "type": "object",
  "properties": {
    "servico_id": { "type": "string" },
    "equipe_id": { "type": "string" },
    "equipe_nome": { "type": "string" },
    "tecnico_id": { "type": "string", "description": "Email do técnico" },
    "tecnico_nome": { "type": "string" },
    "cliente_nome": { "type": "string" },
    "tipo_servico": { "type": "string" },
    "valor_total_servico": { "type": "number" },
    "percentual_equipe": { "type": "number", "default": 30 },
    "valor_comissao_equipe": { "type": "number" },
    "percentual_tecnico": { "type": "number", "default": 15 },
    "valor_comissao_tecnico": { "type": "number" },
    "status": { "type": "string", "enum": ["pendente", "creditado", "pago"], "default": "pendente" },
    "data_geracao": { "type": "string", "format": "date-time" },
    "usuario_geracao": { "type": "string" },
    "data_pagamento": { "type": "string", "format": "date-time" },
    "usuario_pagamento": { "type": "string" },
    "observacoes": { "type": "string" }
  },
  "required": ["servico_id", "equipe_id", "tecnico_id", "valor_total_servico", "valor_comissao_tecnico"]
}
```

### 6. TecnicoFinanceiro
```json
{
  "name": "TecnicoFinanceiro",
  "type": "object",
  "properties": {
    "tecnico_id": { "type": "string" },
    "tecnico_nome": { "type": "string" },
    "equipe_id": { "type": "string" },
    "equipe_nome": { "type": "string" },
    "credito_pendente": { "type": "number", "default": 0 },
    "credito_pago": { "type": "number", "default": 0 },
    "total_ganho": { "type": "number", "default": 0 },
    "data_ultimo_pagamento": { "type": "string", "format": "date-time" },
    "data_ultima_atualizacao": { "type": "string", "format": "date-time" }
  },
  "required": ["tecnico_id", "equipe_id"]
}
```

### 7. PagamentoTecnico
```json
{
  "name": "PagamentoTecnico",
  "type": "object",
  "properties": {
    "tecnico_id": { "type": "string" },
    "tecnico_nome": { "type": "string" },
    "equipe_id": { "type": "string" },
    "equipe_nome": { "type": "string" },
    "lancamentos_id": { "type": "array", "items": { "type": "string" } },
    "valor_pago": { "type": "number" },
    "data_pagamento": { "type": "string", "format": "date" },
    "metodo_pagamento": { "type": "string", "enum": ["Dinheiro", "PIX", "Transferência Bancária", "Cheque", "Outro"] },
    "observacao": { "type": "string" },
    "registrado_por": { "type": "string" },
    "status": { "type": "string", "enum": ["Confirmado", "Estornado"], "default": "Confirmado" },
    "motivo_estorno": { "type": "string" }
  },
  "required": ["tecnico_id", "valor_pago", "data_pagamento", "metodo_pagamento"]
}
```

### 8. TipoServicoValor
```json
{
  "name": "TipoServicoValor",
  "type": "object",
  "properties": {
    "tipo_servico": { "type": "string", "enum": ["(mesma lista de Servico)"] },
    "valor_tabela": { "type": "number" },
    "percentual_equipe": { "type": "number", "default": 30 },
    "percentual_tecnico": { "type": "number", "default": 15 },
    "ativo": { "type": "boolean", "default": true }
  },
  "required": ["tipo_servico", "valor_tabela"]
}
```

### 9. Outras Entidades Complementares
- **Notificacao**: Sistema de notificações para usuários
- **PreferenciaNotificacao**: Preferências de notificação por usuário
- **AlteracaoStatus**: Histórico de mudanças de status
- **ConfiguracaoRelatorio**: Configurações de relatórios automáticos
- **RelatorioGerado**: Histórico de relatórios gerados
- **ManutencaoPreventiva**: Controle de manutenções preventivas
- **CompanySettings**: Configurações da empresa (nome, logo)
- **ChatConversation** e **ChatMessage**: Sistema de chat/suporte

---

## ⚙️ FUNÇÕES BACKEND (Backend Functions)

### 1. gerarComissoes
**Propósito**: Gera automaticamente comissões quando um serviço é concluído

**Trigger**: Automação de entidade `Servico` no evento `update`

**Lógica**:
1. Verifica se o serviço está com status "concluido"
2. Verifica se `gerar_comissao = true` e `comissao_gerada = false`
3. Busca valor do serviço (se não tiver, busca na tabela TipoServicoValor)
4. Se tipo_servico contém "+", soma valores de múltiplos serviços
5. Busca técnicos da equipe (role = 'user' ou 'admin' e equipe_id correspondente)
6. Calcula comissão: 30% do valor total dividido igualmente entre técnicos
7. Cria lançamentos em `LancamentoFinanceiro` para cada técnico
8. Atualiza/cria registros em `TecnicoFinanceiro` (respeitando créditos negativos)
9. Marca serviço como `comissao_gerada = true`

**Código**: Ver arquivo `functions/gerarComissoes.js` completo acima

---

### 2. registrarPagamentoTecnico
**Propósito**: Registra pagamento a um técnico

**Acesso**: Somente admin

**Lógica**:
1. Valida entrada (tecnico_id, valor_pago > 0)
2. Busca dados do técnico em `TecnicoFinanceiro`
3. Cria registro em `PagamentoTecnico`
4. Atualiza `TecnicoFinanceiro`:
   - `credito_pendente` -= `valor_pago` (pode ficar negativo = adiantamento)
   - `credito_pago` += `valor_pago`
5. Se `lancamentos_id` fornecidos, marca como "pago"

**Código**: Ver arquivo `functions/registrarPagamentoTecnico.js` acima

---

### 3. estornarPagamentoTecnico
**Propósito**: Estorna um pagamento já realizado

**Acesso**: Somente admin

**Lógica**:
1. Busca pagamento por ID
2. Marca status como "Estornado"
3. Restaura crédito em `TecnicoFinanceiro`
4. Reverte status dos lançamentos para "pendente"

**Código**: Ver arquivo `functions/estornarPagamentoTecnico.js` acima

---

### 4. resetarComissoesSemanais
**Propósito**: Marca lançamentos antigos como atraso

**Trigger**: Automação agendada (toda segunda-feira 02:00 UTC = domingo 23:00 São Paulo)

**Lógica**:
1. Busca lançamentos pendentes anteriores à semana atual
2. Adiciona observação "[ATRASO - Gerado em semana anterior]"

**Código**: Ver arquivo `functions/resetarComissoesSemanais.js` acima

---

### 5. backupSemanalDrive
**Propósito**: Backup automático completo no Google Drive

**Trigger**: Automação agendada (todo sábado 03:00 São Paulo)

**Lógica**:
1. Busca TODAS as 11 entidades do sistema
2. Cria JSON com metadados (data, totais, dados completos)
3. Faz upload para Google Drive com nome `backup_casa_do_ar_YYYY-MM-DD.json`
4. Retorna link do arquivo e estatísticas

**Entidades incluídas**:
- Cliente, Servico, Atendimento, Equipe
- AlteracaoStatus, Notificacao, PreferenciaNotificacao
- ConfiguracaoRelatorio, RelatorioGerado
- ManutencaoPreventiva, User

**Código**: Ver arquivo `functions/backupSemanalDrive.js` completo no snapshot

---

### 6. recalcularComissoes
**Propósito**: Recalcula comissões de um serviço específico

**Uso**: Para correções manuais quando necessário

---

### 7. verificarContaGoogleDrive
**Propósito**: Mostra qual conta Google está conectada para backups

**Retorna**: email, nome, ID, foto do perfil da conta Google

---

### 8. Outras Funções Auxiliares
- **exportarClientesDrive**: Exporta lista de clientes para Drive
- **duplicarGanhosEquipe**: (desativada) Duplicava ganhos por equipe
- **vincularEquipesServicos**: (desativada) Vinculava equipe padrão
- **sincronizarGanhosServicos**: (desativada) Sincronizava ganhos

---

## 🔄 AUTOMAÇÕES CONFIGURADAS

### 1. Backup Semanal - Google Drive
- **Tipo**: Agendada (scheduled)
- **Frequência**: Todo sábado às 03:00 (São Paulo)
- **Função**: `backupSemanalDrive`
- **Status**: Ativa ✅

### 2. Gerar Comissões ao Concluir Serviço
- **Tipo**: Entidade (entity)
- **Entidade**: Servico
- **Eventos**: update
- **Função**: `gerarComissoes`
- **Status**: Ativa ✅

### 3. Reset Semanal de Comissões
- **Tipo**: Agendada (scheduled)
- **Frequência**: Segunda-feira 02:00 UTC (domingo 23:00 São Paulo)
- **Cron**: `0 2 * * 1`
- **Função**: `resetarComissoesSemanais`
- **Status**: Ativa ✅

### 4. Reset Semanal de Ganhos
- **Tipo**: Agendada (scheduled)
- **Frequência**: Domingo 23:59
- **Cron**: `59 23 * * 0`
- **Função**: `resetarGanhosSemanal`
- **Status**: Ativa ✅

---

## 🎨 PÁGINAS PRINCIPAIS

### 1. Dashboard (`pages/Dashboard.jsx`)
**Funcionalidades**:
- Cards com métricas: Clientes, Atendimentos, Preventivas, Concluídos
- Serviços de hoje organizados por equipe (com cores)
- Ganhos semanais dos técnicos (para admin)
- Card pessoal de ganhos (para técnicos)
- Filtro de serviços (dia/semana/mês)
- Manutenções vencidas em destaque
- Últimos clientes cadastrados

### 2. Serviços (`pages/Servicos.jsx`)
**Funcionalidades**:
- Grid semanal (segunda a domingo + não agendados)
- Cards coloridos por status e equipe
- Filtros por busca, equipe, status
- Formulário completo de criação/edição
- Reagendamento com histórico
- Conclusão com observações
- Compartilhamento de relatórios
- Alertas de atraso automáticos

### 3. Clientes (`pages/Clientes.jsx`)
**Funcionalidades**:
- Lista completa com busca
- CRUD completo
- Histórico de atendimentos por cliente
- Integração com Google Maps (coordenadas)
- Importação de contatos do celular
- Segmentação (Potencial, Regular, VIP)
- Total gasto e quantidade de serviços

### 4. Atendimentos (`pages/Atendimentos.jsx`)
**Funcionalidades**:
- Histórico completo de serviços concluídos
- Filtros por tipo, cliente, data
- Visualização de detalhes completos
- Compartilhamento de relatórios
- Exclusão de registros (admin)

### 5. Preventivas Futuras (`pages/PreventivasFuturas.jsx`)
**Funcionalidades**:
- Lista de manutenções programadas
- Alertas por cor (verde, amarelo, vermelho)
- Cálculo automático de dias até vencimento
- Edição de datas de manutenção
- Criação de serviço direto da lista
- Links rápidos para WhatsApp e Maps

### 6. Financeiro Admin (`pages/FinanceiroAdmin.jsx`)
**Funcionalidades**:
- Visão geral de todos os técnicos
- Lançamentos por técnico
- Registro de pagamentos
- Estorno de pagamentos
- Histórico completo
- Filtros por período e status

### 7. Meu Financeiro (`pages/MeuFinanceiro.jsx`)
**Funcionalidades**:
- Visão pessoal do técnico
- Ganhos da semana
- Lançamentos detalhados
- Crédito pendente e pago
- Histórico de pagamentos recebidos

### 8. Tabela de Serviços (`pages/TabelaServicos.jsx`)
**Funcionalidades**:
- CRUD de valores de serviços
- Configuração de percentuais de comissão
- Edição inline de valores
- Status ativo/inativo

### 9. Outras Páginas
- **Usuários**: Gestão de usuários e equipes
- **Configurações**: Logo, nome da empresa, preferências
- **Relatórios**: Configuração e geração de relatórios
- **Backup e Restaurar**: Download/Upload manual de backups
- **Histórico de Clientes**: Visão detalhada por cliente
- **Suporte**: Chat de suporte

---

## 🎯 REGRAS DE NEGÓCIO IMPORTANTES

### Sistema Financeiro
1. **Comissão padrão**: 30% do valor total do serviço
2. **Divisão**: 30% dividido igualmente entre todos os técnicos da equipe
3. **Créditos negativos**: Sistema permite adiantamentos (crédito negativo)
4. **Recalculo automático**: Serviços combinados (com "+") somam valores da tabela
5. **Status de lançamento**: pendente → pago (não usa "creditado" atualmente)

### Serviços
1. **Status possíveis**: aberto, andamento, concluido, agendado, reagendado
2. **Comissão**: Só gera ao marcar como "concluido" se `gerar_comissao = true`
3. **Atendimento**: Criado automaticamente ao concluir serviço
4. **Histórico**: Mantém todas as alterações de status em AlteracaoStatus

### Clientes
1. **Cadastro automático**: Cliente é criado/atualizado ao criar serviço
2. **Manutenção preventiva**: Data calculada automaticamente após conclusão
3. **Total gasto**: Atualizado ao concluir cada serviço

### Permissões
1. **Admin**: Acesso total, pode gerenciar financeiro e configurações
2. **Técnico (user)**: Vê apenas serviços da própria equipe, acesso limitado ao financeiro
3. **Equipes**: Usuários vinculados por `equipe_id` no User

---

## 📱 COMPONENTES REUTILIZÁVEIS

### Dashboard
- `GanhosSemanaDashboard`: Card de ganhos semanais para técnicos
- `StatCard`: Card de estatística genérico

### Serviços
- `ServicoForm`: Formulário completo de serviço
- `ServicoCard`: Card visual de serviço
- `ReagendarModal`: Modal de reagendamento
- `ConclusaoModal`: Modal de conclusão
- `CompartilharModal`: Modal de compartilhamento
- `AlertaAtraso`: Alerta de serviços atrasados

### Clientes
- `ClienteForm`: Formulário de cliente
- `ClientesTable`: Tabela de clientes
- `HistoricoModal`: Modal de histórico

### Financeiro
- `RegistrarPagamentoModal`: Modal de pagamento

### Atendimentos
- `DetalhesModal`: Detalhes de atendimento
- `AtendimentoForm`: Formulário de atendimento

### UI Global
- `NotificationCenter`: Central de notificações
- `UserMenu`: Menu do usuário
- `EmptyState`: Estado vazio genérico
- `LoadingSpinner`: Spinner de carregamento
- `ErrorBoundary`: Tratamento de erros

---

## 🔧 CONFIGURAÇÕES E INTEGRAÇÕES

### Google Drive
- **Conector**: googledrive
- **Escopo**: `drive.file` (criar e acessar arquivos próprios)
- **Conta conectada**: cleyton_trylogya@hotmail.com
- **Uso**: Backup semanal automático

### Mapa de Cores (Layout)
- Sidebar: `#1e3a8a` (azul escuro)
- Destaque: `#f59e0b` (laranja/amarelo)
- Logo background: `#F5C800` (amarelo)
- Background geral: `#f0f4f8` (cinza claro)

### Estrutura de Usuário
- **Entidade User**: Built-in da Base44
- **Campos personalizados**: `equipe_id`, `tipo_usuario` (deprecado - usar `role`)
- **Roles**: "admin" ou "user" (técnico)

---

## 📦 PACOTES NPM INSTALADOS

Principais:
- @base44/sdk@^0.8.0
- @tanstack/react-query@^5.84.1
- react-router-dom@^6.26.0
- lucide-react@^0.475.0
- date-fns@^3.6.0
- moment@^2.30.1
- react-hook-form@^7.54.2
- framer-motion@^11.16.4
- jspdf@^4.0.0
- @hello-pangea/dnd@^17.0.0
- Radix UI (todos os componentes)
- tailwindcss-animate@^1.0.7

---

## 🚀 PROMPT DE RESTAURAÇÃO

Se precisar recriar o sistema do zero, use este prompt:

```
Crie um sistema completo de gestão para empresa de climatização com as seguintes especificações:

1. ENTIDADES:
   - Crie as 8 entidades principais: Cliente, Servico, Atendimento, Equipe, LancamentoFinanceiro, TecnicoFinanceiro, PagamentoTecnico, TipoServicoValor
   - Use os schemas JSON exatamente como especificados neste documento
   - Adicione entidades complementares: Notificacao, PreferenciaNotificacao, AlteracaoStatus, ConfiguracaoRelatorio, RelatorioGerado, ManutencaoPreventiva, CompanySettings

2. FUNÇÕES BACKEND:
   - gerarComissoes: Automação que gera comissões ao concluir serviço (30% dividido entre técnicos da equipe)
   - registrarPagamentoTecnico: Registra pagamento a técnico
   - estornarPagamentoTecnico: Estorna pagamento
   - resetarComissoesSemanais: Marca lançamentos antigos como atraso
   - backupSemanalDrive: Backup completo automático no Google Drive
   - verificarContaGoogleDrive: Mostra conta Google conectada

3. AUTOMAÇÕES:
   - Backup semanal: Sábado 03:00 → backupSemanalDrive
   - Gerar comissões: Servico.update → gerarComissoes
   - Reset semanal: Segunda 02:00 UTC → resetarComissoesSemanais

4. PÁGINAS:
   - Dashboard: Métricas, serviços por equipe, ganhos semanais
   - Serviços: Grid semanal, CRUD, reagendamento, conclusão
   - Clientes: Lista com CRUD, histórico, manutenções preventivas
   - Atendimentos: Histórico completo de serviços
   - Preventivas Futuras: Manutenções programadas com alertas
   - Financeiro Admin: Gestão completa de pagamentos
   - Meu Financeiro: Visão pessoal do técnico
   - Tabela de Serviços: CRUD de valores e comissões

5. DESIGN:
   - Sidebar azul escuro (#1e3a8a)
   - Destaques em laranja/amarelo (#f59e0b)
   - Cards brancos com sombras suaves
   - Responsivo mobile-first
   - Animações com framer-motion

6. REGRAS DE NEGÓCIO:
   - Comissão: 30% do serviço dividido entre técnicos da equipe
   - Créditos negativos permitidos (adiantamentos)
   - Serviços combinados (com "+") somam valores da tabela
   - Status: aberto → andamento → concluido
   - Atendimento criado automaticamente ao concluir

7. INTEGRAÇÕES:
   - Google Drive para backups automáticos
   - Google Maps para coordenadas de endereços
   - WhatsApp para contato direto

Siga exatamente as especificações deste documento para garantir compatibilidade total.
```

---

## 📝 NOTAS DE MANUTENÇÃO

- **Data de criação deste prompt**: 18/03/2026
- **Última atualização do sistema**: 18/03/2026
- **Versão do backup**: 1.0
- **Último backup automático**: 14/03/2026 às 03:00
- **Próximo backup**: 22/03/2026 às 03:00

### Mudanças Recentes
- Adicionado campo `percentual_equipe` e `percentual_tecnico` em TipoServicoValor
- Dashboard atualizado com contadores dinâmicos
- GanhosSemanaDashboard mostra total ganho, valor pago e crédito pendente

### Problemas Conhecidos
- Nenhum problema crítico identificado no momento

---

## 🔐 SEGURANÇA

- Backups automáticos no Google Drive
- Histórico completo de alterações em AlteracaoStatus
- Logs de quem fez pagamentos/estornos
- Permissões por role (admin/user)
- Dados financeiros protegidos por autenticação

---

**FIM DO DOCUMENTO DE RESTAURAÇÃO**

Guarde este documento em local seguro. Em caso de perda do sistema, use o prompt de restauração acima com uma IA assistente da Base44 para reconstruir tudo.