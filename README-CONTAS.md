# Publicação e contas Aethra

O GitHub Pages publica somente o site estático. O Supabase fornece autenticação e armazenamento remoto. O login aceita contas existentes; não há botão de cadastro. Desative também novos cadastros no provedor para impedir a criação de usuários pela API de autenticação.

## Preparar o Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). A tabela usa RLS: cada usuário só pode ler ou alterar a linha cujo `user_id` corresponde à sua sessão.
3. No Dashboard, abra **Authentication → Sign In / Providers → User Signups** e desligue **Allow new users to sign up**. Deixe também **Allow anonymous sign-ins** desligado. Com os cadastros desligados, só usuários criados por uma pessoa administradora podem entrar.
4. Em **Project Settings → API**, copie o **Project URL** e a chave **anon/public**. A chave pública pode ser usada pelo navegador; a chave `service_role` jamais deve ser publicada.

## Criar o repositório e publicar

No PowerShell, abra a pasta do projeto Aethra (`aethra`, a mesma que contém este README) e execute:

```powershell
gh auth login
.\scripts\Publish-GitHubPages.ps1
```

O script pede confirmação, prepara um commit com os arquivos do projeto, cria o repositório (público por padrão), ativa GitHub Pages e pergunta pelo URL e pela chave anon/public para salvá-los como variáveis do repositório. Para preferir um repositório privado:

```powershell
.\scripts\Publish-GitHubPages.ps1 -RepositoryName aethra-wordbuilding -Visibility private
```

O workflow `.github/workflows/deploy-pages.yml` publica a pasta `dist` em cada push para `main` ou `master`. O endereço aparecerá em **Settings → Pages**. Se você deixar as variáveis do Supabase vazias no script, adicione `AETHRA_SUPABASE_URL` e `AETHRA_SUPABASE_ANON_KEY` em **Settings → Secrets and variables → Actions → Variables** e execute novamente o workflow. O workflow falha de propósito sem essas duas variáveis, para não publicar o app em modo sem login. Repositório público é a opção mais simples para um site de compartilhamento; escolha privado apenas se seu plano do GitHub permitir publicar Pages a partir dele.

## Adicionar usuários

O documento que você edita é **`users.json` na raiz da pasta Aethra**. Ele não é enviado ao GitHub: `.gitignore` o exclui porque contém e-mails pessoais. Comece criando sua cópia privada:

```powershell
Copy-Item .\users.json.example .\users.json
notepad .\users.json
```

No seu `users.json`, adicione entradas como:

```json
{
  "users": [
    { "username": "ana", "email": "ana@exemplo.com", "displayName": "Ana", "enabled": true },
    { "username": "leitora", "email": "pessoa@exemplo.com", "displayName": "Leitora", "enabled": true }
  ]
}
```

Depois, crie as contas listadas pelo script administrativo. A senha é solicitada em modo oculto para cada conta; entregue-a à pessoa em privado.

```powershell
$env:AETHRA_SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
$secret = Read-Host 'Chave administrativa service_role do Supabase' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
  $env:AETHRA_SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  .\scripts\Add-AethraUsers.ps1
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  $env:AETHRA_SUPABASE_SERVICE_ROLE_KEY = $null
  $secret.Dispose()
}
```

Use a chave administrativa antiga `service_role` do Dashboard apenas neste terminal local. Ela ignora RLS. Nunca a coloque em `dist/auth-config.js`, GitHub Variables/Secrets de deploy, `users.json`, commits ou código do navegador. O script cria contas no Auth; adicionar ou remover uma linha no JSON não apaga nem bloqueia automaticamente uma conta já criada. Para revogar acesso, bloqueie ou apague a conta em **Authentication → Users** no Supabase.

## O que é sincronizado

Cada conta recebe uma cópia própria de universos, notas, fichas, mapas, temas e links do YouTube. A sincronização grava uma linha por conta e usa RLS no banco. Os arquivos de música MP3/MP4 importados ficam no IndexedDB local do navegador, separados por usuário e dispositivo; para ouvi-los em outro aparelho, importe-os novamente. Mantenha backups JSON além da cópia na nuvem.

O projeto local e o GitHub Pages estão configurados para o mesmo backend Supabase. `dist/auth-config.js` contém apenas o URL e a chave pública, com `required: true`; nunca use uma chave administrativa no navegador. O login usa contas do Aethra cadastradas em Authentication → Users, separadas da conta administrativa do Dashboard Supabase.
