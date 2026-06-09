# Controle de Entregas — Deploy na Vercel + Neon

## Estrutura do projeto

```
entregas-app/
├── index.html          ← Frontend do app
├── package.json        ← Dependência do Neon
├── vercel.json         ← Configuração de rotas
└── api/
    ├── entregadores.js ← API: cadastro de entregadores
    └── dados.js        ← API: entregas diárias
```

## Passo a passo do deploy

### 1. Subir o código no GitHub
- Crie um repositório no github.com
- Faça upload de todos os arquivos desta pasta

### 2. Criar projeto na Vercel
- Acesse vercel.com e clique em "Add New Project"
- Importe o repositório do GitHub
- Clique em "Deploy" (sem alterar nada)

### 3. Criar o banco Neon
- No painel do projeto na Vercel, vá em "Storage"
- Clique em "Create Database" → escolha "Neon"
- Dê um nome e clique em "Create"
- A variável `DATABASE_URL` é injetada automaticamente no projeto

### 4. Pronto!
- Acesse a URL gerada pela Vercel
- O banco é criado automaticamente na primeira visita
- Qualquer pessoa com o link acessa e edita os dados

## Variáveis de ambiente (automáticas via integração Neon)
- `DATABASE_URL` — string de conexão com o banco Postgres
