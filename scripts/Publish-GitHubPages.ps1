param(
  [string]$RepositoryName = 'aethra-worldbuilding',
  [ValidateSet('public', 'private')]
  [string]$Visibility = 'public'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $projectRoot
try {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Instale GitHub CLI (gh) e autentique com gh auth login.' }
  gh auth status | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'O GitHub CLI não está autenticado. Execute gh auth login.' }

  $confirmation = Read-Host "Criar/publicar o repositório $RepositoryName como $Visibility? Digite S para continuar"
  if ($confirmation -notmatch '^(s|sim)$') { Write-Host 'Publicação cancelada.'; return }

  git add -A
  if ($LASTEXITCODE -ne 0) { throw 'Não consegui preparar os arquivos do projeto.' }
  git diff --cached --quiet
  if ($LASTEXITCODE -eq 1) {
    git commit -m 'Prepare Aethra for GitHub Pages and private user workspaces'
    if ($LASTEXITCODE -ne 0) { throw 'O commit falhou. Confira git config user.name e git config user.email.' }
  } elseif ($LASTEXITCODE -gt 1) { throw 'Não consegui conferir as alterações do Git.' }

  $repo = (gh repo view $RepositoryName --json nameWithOwner --jq .nameWithOwner 2>$null | Select-Object -First 1)
  if (-not $repo) {
    $visibilityFlag = "--$Visibility"
    gh repo create $RepositoryName $visibilityFlag --description 'Aethra — fantasy worldbuilding studio' 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível criar o repositório no GitHub.' }
    $repo = (gh repo view $RepositoryName --json nameWithOwner --jq .nameWithOwner | Select-Object -First 1)
  }
  if (-not $repo) { throw 'Não consegui identificar o nome do repositório criado.' }

  $remote = (git remote get-url origin 2>$null | Select-Object -First 1)
  if (-not $remote) {
    git remote add origin "https://github.com/$repo.git"
    if ($LASTEXITCODE -ne 0) { throw 'Não consegui configurar o endereço origin.' }
  } elseif ($remote -notmatch [regex]::Escape($repo)) {
    throw "Já existe um origin diferente ($remote). Confira o destino antes de publicar para $repo."
  }

  gh api "repos/$repo/pages" --method POST --field build_type=workflow | Out-Null
  if ($LASTEXITCODE -ne 0) {
    gh api "repos/$repo/pages" --method PUT --field build_type=workflow | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warning 'O Pages ainda não foi habilitado. Habilite-o em Settings > Pages > GitHub Actions.' }
  }

  $supabaseUrl = Read-Host 'URL do projeto Supabase (Enter para configurar depois)'
  $anonKey = Read-Host 'Chave anon/public do Supabase (Enter para configurar depois)'
  if ($supabaseUrl -and $anonKey) {
    gh variable set AETHRA_SUPABASE_URL --repo $repo --body $supabaseUrl
    if ($LASTEXITCODE -ne 0) { throw 'Não consegui salvar a variável pública AETHRA_SUPABASE_URL.' }
    gh variable set AETHRA_SUPABASE_ANON_KEY --repo $repo --body $anonKey
    if ($LASTEXITCODE -ne 0) { throw 'Não consegui salvar a variável pública AETHRA_SUPABASE_ANON_KEY.' }
  } else { Write-Warning 'O workflow exige ambas as variáveis AETHRA_SUPABASE_URL e AETHRA_SUPABASE_ANON_KEY antes de publicar.' }

  $branch = (git branch --show-current).Trim()
  if (-not $branch) { throw 'Crie um branch Git antes de publicar.' }
  git push --set-upstream origin $branch
  if ($LASTEXITCODE -ne 0) { throw 'O push falhou. Confira a permissão do GitHub e tente novamente.' }
  Write-Host "Código enviado: https://github.com/$repo"
  Write-Host "Acompanhe a publicação em https://github.com/$repo/actions"
  Write-Host 'Após a conclusão do workflow, o endereço do site aparecerá na aba Settings > Pages.'
} finally { Pop-Location }
