# 📦 File Upload Server

Um servidor Node.js simples e elegante para upload de arquivos compactados com interface web moderna.

## 🚀 Características

- **Upload de arquivos compactados**: Suporte para .zip, .rar, .7z, .tar, .gz, .bz2, .xz
- **Interface moderna**: Interface web responsiva com drag & drop
- **Limite de tamanho**: Máximo de 100MB por arquivo
- **Visualização de arquivos**: Lista todos os arquivos enviados com detalhes
- **Barra de progresso**: Acompanhe o progresso do upload em tempo real
- **Validação de tipos**: Apenas arquivos compactados são aceitos

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone ou baixe o projeto
2. Instale as dependências:

```bash
npm install
```

## 🚀 Como usar

### Iniciando o servidor

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Fazendo upload de arquivos

1. Acesse `http://localhost:3000` no seu navegador
2. Clique na área de upload ou arraste um arquivo compactado
3. Aguarde o upload completar
4. Visualize a lista de arquivos enviados

### Endpoints da API

#### `POST /upload`
Faz upload de um arquivo compactado.

**Parâmetros:**
- `file`: Arquivo compactado (form-data)

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Arquivo enviado com sucesso!",
  "file": {
    "originalName": "arquivo.zip",
    "filename": "2024-01-01T12-00-00-000Z-arquivo.zip",
    "size": 1048576,
    "path": "/uploads/2024-01-01T12-00-00-000Z-arquivo.zip",
    "uploadTime": "2024-01-01T12:00:00.000Z"
  }
}
```

#### `GET /files`
Lista todos os arquivos enviados.

**Resposta:**
```json
{
  "files": [
    {
      "filename": "2024-01-01T12-00-00-000Z-arquivo.zip",
      "size": 1048576,
      "uploadTime": "2024-01-01T12:00:00.000Z",
      "sizeFormatted": "1.00 MB"
    }
  ]
}
```

## 📁 Estrutura do projeto

```
recebe-file/
├── server.js              # Servidor Express principal
├── package.json           # Dependências e scripts
├── public/
│   └── index.html         # Interface web
├── uploads/               # Diretório dos arquivos enviados
├── .gitignore            # Arquivos ignorados pelo Git
└── README.md             # Este arquivo
```

## ⚙️ Configuração

### Variáveis de ambiente

- `PORT`: Porta do servidor (padrão: 3000)

### Limites e restrições

- **Tamanho máximo**: 100MB por arquivo
- **Tipos aceitos**: .zip, .rar, .7z, .tar, .gz, .bz2, .xz
- **Diretório de upload**: `./uploads/`

## 🔧 Personalização

### Alterando o limite de tamanho

No arquivo [`server.js`](server.js), modifique a linha:

```javascript
limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
}
```

### Adicionando novos tipos de arquivo

No arquivo [`server.js`](server.js), modifique o array:

```javascript
const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'];
```

### Mudando o diretório de upload

No arquivo [`server.js`](server.js), modifique:

```javascript
const uploadsDir = path.join(__dirname, 'uploads');
```

## 🛡️ Segurança

- Validação de tipos de arquivo
- Limite de tamanho de arquivo
- Nomes de arquivo com timestamp para evitar conflitos
- Tratamento de erros robusto

## 📝 Scripts disponíveis

- `npm start`: Inicia o servidor em modo produção
- `npm run dev`: Inicia o servidor em modo desenvolvimento com nodemon

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🐛 Problemas conhecidos

- Apenas um arquivo por vez pode ser enviado
- Não há autenticação implementada
- Arquivos não são excluídos automaticamente

## 🔮 Funcionalidades futuras

- [ ] Autenticação de usuários
- [ ] Upload múltiplo de arquivos
- [ ] Exclusão de arquivos
- [ ] Compressão automática
- [ ] Download de arquivos
- [ ] Preview de conteúdo

## 📞 Suporte

Se encontrar problemas ou tiver sugestões, abra uma issue no repositório do projeto.