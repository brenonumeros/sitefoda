# 🎁 Sistema Interativo de Presentes para Maria Clara

Sistema web interativo para coletar listas de preferências (filmes, livros, séries, músicas) e enviar por email.

## 📧 Configuração do Sistema de Email

O sistema está configurado para enviar emails para: **wilson.brenovieira@gmail.com**

### Configuração no Vercel (Produção)

1. **Criar conta no Resend:**
   - Acesse: https://resend.com
   - Crie uma conta gratuita (3.000 emails/mês)
   - Obtenha sua API Key

2. **Configurar variável de ambiente no Vercel:**
   - No painel do Vercel, vá em Settings > Environment Variables
   - Adicione: `RESEND_API_KEY` = sua_api_key_do_resend

3. **Configurar domínio no Resend (opcional):**
   - Para emails profissionais, configure um domínio
   - Ou use o domínio padrão do Resend

### Desenvolvimento Local

Para testar localmente:

```bash
# Instalar dependências
npm install

# Criar arquivo .env.local
echo "RESEND_API_KEY=sua_api_key_aqui" > .env.local

# Executar em modo desenvolvimento
npm run dev
```

## 🚀 Como Funciona

1. **Frontend:** Usuários preenchem listas de filmes, livros, séries e playlist
2. **API:** Dados são enviados para `/api/submit`
3. **Email:** Sistema envia email formatado para wilson.brenovieira@gmail.com
4. **Confirmação:** Remetente recebe confirmação (se forneceu email)

## 📁 Estrutura dos Arquivos

```
├── api/
│   ├── config.js      # Configurações centralizadas
│   └── submit.js      # API endpoint para envio
├── index.html         # Interface principal
├── script.js          # Lógica do frontend
├── style.css          # Estilos
├── package.json       # Dependências
└── vercel.json        # Configuração Vercel
```

## 🔧 Configurações Principais

### api/config.js
- Email de destino: `wilson.brenovieira@gmail.com`
- Configurações do Resend
- Validações de ambiente

### Funcionalidades
- ✅ Busca de músicas no YouTube
- ✅ Listas drag & drop para filmes/livros/séries
- ✅ Playlist interativa
- ✅ Envio de email formatado
- ✅ Confirmação para o remetente
- ✅ Modo desenvolvimento (logs sem envio)

## 📱 Deploy

O sistema está pronto para deploy no Vercel:

```bash
# Deploy automático
vercel --prod
```

Lembre-se de configurar a variável `RESEND_API_KEY` no painel do Vercel!

## 🎯 Status do Sistema

- ✅ Frontend completo e funcional
- ✅ API configurada com Resend
- ✅ Email de destino: wilson.brenovieira@gmail.com
- ✅ Sistema de confirmação
- ✅ Tratamento de erros
- ⚠️ Necessário configurar RESEND_API_KEY para produção

---

💖 Sistema criado com carinho para Maria Clara!
