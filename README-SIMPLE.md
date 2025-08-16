# Compartilhamento Simples de Arquivos

Uma versão simples e direta para compartilhar arquivos entre máquinas na rede local através do browser.

## ✨ Características

- **Sem autenticação** - Acesso direto e imediato
- **Porta aleatória** - Sempre acima de 20000 para evitar conflitos
- **Interface moderna** - Drag & drop e design responsivo
- **Rede local** - Mostra IP da rede local automaticamente
- **Qualquer arquivo** - Sem restrições de tipo ou tamanho (limite 500MB)
- **Download direto** - Lista todos os arquivos disponíveis

## 🚀 Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm run share
```

### 3. Acessar pela rede
O servidor mostrará automaticamente:
- URL local: `http://localhost:PORTA`
- URL da rede: `http://IP-DA-REDE:PORTA`

### 4. Compartilhar arquivos
- Abra o browser e acesse qualquer uma das URLs
- Arraste arquivos ou clique para selecionar
- Os arquivos ficam disponíveis para download na mesma página

## 📁 Estrutura

```
├── simple-server.js      # Servidor simplificado
├── public/
│   └── simple.html      # Interface web moderna
├── shared-files/        # Pasta dos arquivos compartilhados
└── .port               # Porta atual do servidor
```

## 🌐 Acesso pela rede

Qualquer dispositivo na mesma rede pode:
1. Abrir um browser
2. Acessar `http://IP-DO-SERVIDOR:PORTA`
3. Enviar e baixar arquivos

## ⚡ Comandos úteis

```bash
npm run share    # Iniciar servidor de compartilhamento
npm run simple   # Mesmo que 'share'
```

## 🔧 Configuração

A única configuração opcional é definir uma porta específica:
```bash
PORT=25000 npm run share
```

## 📋 Funcionalidades

- ✅ Upload por drag & drop
- ✅ Upload por clique
- ✅ Lista de arquivos em tempo real
- ✅ Download direto
- ✅ Interface responsiva
- ✅ Informações de arquivo (nome, tamanho, data)
- ✅ Barra de progresso visual
- ✅ Porta automática acima de 20000
- ✅ IP da rede local automático

---

**Nota:** Esta é uma versão simplificada sem segurança, ideal para uso rápido em redes locais confiáveis.