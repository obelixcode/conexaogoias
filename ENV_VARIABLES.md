# Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Vercel:

## Firebase Configuration (Públicas)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBjdbOl0xyru5TfEQtu2iC2wqIz3QvrRQM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aconexaogoias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aconexaogoias
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aconexaogoias.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=6509088743
NEXT_PUBLIC_FIREBASE_APP_ID=1:6509088743:web:f1866c676e18c53204f742
```

## App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Firebase Admin (Privadas - para operações server-side)
```
FIREBASE_ADMIN_PRIVATE_KEY=your_firebase_admin_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_ADMIN_PROJECT_ID=aconexaogoias
```

## Como configurar no Vercel:

1. Acesse o dashboard do Vercel
2. Vá para o projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione cada variável com seu valor correspondente
5. Certifique-se de marcar as variáveis como "Production", "Preview" e "Development" conforme necessário

## Valores do Firebase Admin:

Para obter as credenciais do Firebase Admin:
1. Acesse https://console.firebase.google.com/
2. Selecione o projeto "aconexaogoias"
3. Vá em "Project Settings" > "Service accounts"
4. Clique em "Generate new private key"
5. Baixe o arquivo JSON e use os valores:
   - `private_key` → FIREBASE_ADMIN_PRIVATE_KEY
   - `client_email` → FIREBASE_ADMIN_CLIENT_EMAIL
   - `project_id` → FIREBASE_ADMIN_PROJECT_ID
