# Script de Limpeza de Banners

Este script (`fix-banner-urls.js`) foi criado para identificar e limpar banners com URLs inválidas no banco de dados Firestore.

## Como usar

1. **Navegue até a pasta do projeto:**
   ```bash
   cd /Users/rafaelsalles/conexaogoias
   ```

2. **Execute o script:**
   ```bash
   node scripts/fix-banner-urls.js
   ```

## O que o script faz

1. **Analisa todos os banners** no Firestore
2. **Identifica banners com URLs inválidas** (que não começam com `http://` ou `https://`)
3. **Mostra um relatório** com todos os banners problemáticos
4. **Oferece opções de limpeza:**
   - Deletar todos os banners com URLs inválidas
   - Desativar todos os banners com URLs inválidas
   - Deletar banners específicos (seleção manual)
   - Sair sem fazer alterações

## Exemplo de saída

```
🔍 Analisando banners no Firestore...

📊 Total de banners encontrados: 5

✅ Banners com URLs válidas: 2
❌ Banners com URLs inválidas: 3

📋 Banners com URLs inválidas:
────────────────────────────────────────────────────────────────────────────────
1. ID: 0KWBTnmVjgnPdARHtYN5j
   Título: Banner Principal
   URL: "0KWBTnmVjgnPdARHtYN5j"
   Posição: header
   Ativo: Sim
   Criado: 21/10/2025

🔧 Opções disponíveis:
1. Deletar todos os banners com URLs inválidas
2. Desativar todos os banners com URLs inválidas
3. Deletar banners específicos
4. Sair sem fazer alterações
```

## Segurança

- O script pede confirmação antes de fazer qualquer alteração
- Você pode escolher apenas desativar os banners ao invés de deletá-los
- Todas as operações são registradas no console

## Pré-requisitos

- Node.js instalado
- Arquivo `firebase-admin-key.json` configurado
- Permissões de escrita no Firestore
