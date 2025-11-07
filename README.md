# Sistema de Gestão de Obras

Sistema completo e robusto de gestão de obras com React.js frontend e API Go backend, desenvolvido para atender todas as necessidades de construtoras, engenheiros e empreiteiros.

## � API Backend

### Repositório da API

- **GitHub**: [MarkHiarley/OBRA](https://github.com/MarkHiarley/OBRA)
- **Endpoint Base**: `http://92.113.34.172:9090`
- **Documentação completa**: Veja [API_INTEGRATION.md](./API_INTEGRATION.md)
- **Guia de testes**: Veja [TESTANDO_API.md](./TESTANDO_API.md)

### Tecnologias Backend (API Go)

- **Go 1.25** - Linguagem de programação
- **Gin** - Framework web HTTP
- **PostgreSQL 12** - Banco de dados relacional
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **golang-migrate** - Migrations de banco de dados

### Tecnologias Frontend

- **React.js 19.1.1** - Biblioteca UI
- **TypeScript 4.9.5** - Tipagem estática
- **Material-UI (MUI) v7.3.2** - Componentes UI
- **React Router v6** - Roteamento
- **Recharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **React Toastify** - Notificações

## 📋 Funcionalidades Principais

### 1. **Cadastro de Empresas**

- Validação automática de CPF/CNPJ
- Preenchimento automático de endereço via CEP
- Campos condicionais baseados no tipo de pessoa (Física/Jurídica)
- Gestão de contatos e observações

### 2. **Gestão de Obras**

- Cadastro completo de obras com ART
- Vinculação de clientes, responsáveis e parceiros
- Controle de orçamento inicial e atual
- Acompanhamento de status (Planejada, Em Andamento, Concluída, Cancelada)
- Controle de prazos

### 3. **Sistema de Despesas**

- Categorização de despesas (Material, Mão de Obra, Impostos, Parceiros, Outros)
- Controle de formas de pagamento (À Vista, PIX, Boleto, Cartão)
- Status de pagamento (Pendente, Pago)
- Vinculação com obras específicas
- Relatórios financeiros detalhados

### 4. **Diário de Obra**

- Registro diário das atividades
- Controle de ferramentas utilizadas
- Quantidade de pessoas trabalhando
- Registro de condições climáticas
- Upload de fotos (planejado)
- Controle de horários de trabalho

### 5. **Relatórios Dinâmicos**

- Relatório de Obras (orçamento vs gasto real)
- Relatório de Despesas por categoria
- Relatório de Pagamentos (feitos e pendentes)
- Relatório de Materiais consumidos
- Relatório de Profissionais e mão de obra
- Exportação para PDF/Excel (planejado)

### 6. **Dashboard Interativo**

- Gráficos financeiros em tempo real
- Monitoramento de status das obras
- Alertas de prazos e orçamentos
- Estatísticas de produtividade
- Últimas atividades registradas

### 7. **Sistema de Autenticação**

- Login seguro com JWT
- Níveis de permissão (Admin, Engenheiro, Financeiro)
- Controle de acesso baseado em roles

### 8. **Sistema de Notificações**

- Alertas automáticos para:
  - Pagamentos pendentes há mais de 30 dias
  - Orçamentos excedidos (90%+ do valor)
  - Prazos próximos do vencimento
- Notificações personalizadas
- Sistema de prioridades

## Tecnologias Utilizadas

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **Axios** - Cliente HTTP
- **Joi** - Validação de dados
- **cpf-cnpj-validator** - Validação de documentos
- **Nodemailer** - Envio de emails

### Frontend

- **React.js** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Material-UI** - Biblioteca de componentes
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de formulários
- **Recharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **React Toastify** - Notificações

## 📁 Estrutura do Projeto

```
projeto2/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React (Layout, Login)
│   │   ├── pages/          # Páginas (Dashboard, Pessoas, Obras, Despesas, Diário)
│   │   ├── services/       # Serviços de API conectados ao backend Go
│   │   ├── contexts/       # Contextos React (AuthContext)
│   │   ├── types/          # Tipos TypeScript (Pessoa, Obra, Despesa, DiarioObra)
│   │   └── utils/          # Utilitários e formatadores
│   ├── public/
│   └── package.json
├── API_INTEGRATION.md      # Documentação da integração com a API
├── TESTANDO_API.md         # Guia de testes da API
└── README.md               # Este arquivo
```

**API Backend separada**: [github.com/MarkHiarley/OBRA](https://github.com/MarkHiarley/OBRA)

## Como Executar

### Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB (local ou na nuvem)
- npm ou yarn

### Instalação

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd projeto2
```

2. **Instale as dependências:**

```bash
npm run install-all
```

3. **Configure as variáveis de ambiente:**

**Backend** - Crie o arquivo `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestao_obras
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
VIACEP_API=https://viacep.com.br/ws
```

**Frontend** - O arquivo `frontend/.env` já está configurado:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Executando a Aplicação

**Modo de Desenvolvimento (ambos os serviços):**

```bash
npm run dev
```

**Executar apenas o backend:**

```bash
npm run server
```

**Executar apenas o frontend:**

```bash
npm run client
```

**Modo de Produção:**

```bash
npm run build
npm start
```

## 📡 Endpoints da API

**Base URL**: `http://92.113.34.172:9090`

### 👥 Pessoas

- `GET /pessoas` - Listar todas as pessoas
- `POST /pessoas` - Criar nova pessoa
- `GET /pessoas/:id` - Buscar pessoa por ID
- `PUT /pessoas/:id` - Atualizar pessoa
- `DELETE /pessoas/:id` - Deletar pessoa

### 🏗️ Obras

- `GET /obras` - Listar todas as obras
- `POST /obras` - Criar nova obra
- `GET /obras/:id` - Buscar obra por ID
- `PUT /obras/:id` - Atualizar obra
- `DELETE /obras/:id` - Deletar obra

### 📖 Diários de Obra

- `GET /diarios` - Listar todos os diários
- `POST /diarios` - Criar novo diário
- `GET /diarios/:id` - Buscar diário por ID
- `GET /diarios/:id/obra` - Buscar diários por obra
- `PUT /diarios/:id` - Atualizar diário
- `DELETE /diarios/:id` - Deletar diário

### 👤 Usuários

- `GET /usuarios` - Listar todos os usuários
- `POST /usuarios` - Criar novo usuário
- `GET /usuarios/:id` - Buscar usuário por ID
- `PUT /usuarios/:id` - Atualizar usuário
- `DELETE /usuarios/:id` - Deletar usuário

**📚 Documentação completa**: [API_INTEGRATION.md](./API_INTEGRATION.md)

- `PATCH /api/despesas/:id/pagamento` - Atualizar status de pagamento

### Diário de Obra

- `GET /api/diario` - Listar entradas do diário
- `POST /api/diario` - Criar nova entrada
- `GET /api/diario/obra/:obraId` - Buscar entradas por obra
- `GET /api/diario/estatisticas/:obraId` - Estatísticas da obra

### Dashboard

- `GET /api/dashboard` - Dados do dashboard principal
- `GET /api/dashboard/obras/estatisticas` - Estatísticas de obras
- `GET /api/dashboard/financeiro/estatisticas` - Estatísticas financeiras

### Relatórios

- `GET /api/relatorios/obras` - Relatório geral de obras
- `GET /api/relatorios/obras/:obraId` - Relatório detalhado da obra
- `GET /api/relatorios/despesas` - Relatório de despesas
- `GET /api/relatorios/pagamentos` - Relatório de pagamentos
- `GET /api/relatorios/materiais` - Relatório de materiais
- `GET /api/relatorios/profissionais` - Relatório de profissionais

### Notificações

- `GET /api/notificacoes` - Listar notificações
- `PATCH /api/notificacoes/:id/lida` - Marcar como lida
- `POST /api/notificacoes/verificar-automaticas` - Verificar notificações automáticas

## Próximas Funcionalidades

- [ ] Upload de fotos no diário de obra
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Sistema de backup automático
- [ ] Aplicativo mobile
- [ ] Integração com APIs de pagamento
- [ ] Sistema de chat em tempo real
- [ ] Módulo de contratos
- [ ] Gestão de estoque de materiais
- [ ] Sistema de aprovação de despesas
- [ ] Relatórios personalizáveis

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

**Sistema de Gestão de Obras** - Desenvolvido para facilitar o controle e acompanhamento de obras de construção civil.
#   c o n s t r u r o r a 
 
 