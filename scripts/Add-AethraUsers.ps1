param(
  [string]$UsersFile = (Join-Path $PSScriptRoot '..\users.json')
)

$ErrorActionPreference = 'Stop'
$baseUrl = $env:AETHRA_SUPABASE_URL
$adminKey = $env:AETHRA_SUPABASE_SERVICE_ROLE_KEY
if (-not $baseUrl -or -not $adminKey) {
  throw 'Defina AETHRA_SUPABASE_URL e AETHRA_SUPABASE_SERVICE_ROLE_KEY apenas no terminal local antes de executar.'
}
if (-not (Test-Path -LiteralPath $UsersFile)) {
  throw 'Não encontrei a lista privada de usuários. Consulte o guia administrativo local ou gerencie as contas pelo painel do Supabase.'
}

$document = Get-Content -LiteralPath $UsersFile -Raw | ConvertFrom-Json
if (-not $document.users -or $document.users.Count -eq 0) { throw 'A lista users em users.json está vazia.' }
$seen = @{}
foreach ($entry in $document.users) {
  if (-not $entry.enabled) { continue }
  if ($entry.username -notmatch '^[a-zA-Z0-9._-]{2,40}$') { throw "Nome de usuário inválido: $($entry.username)" }
  if ($entry.email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw "E-mail inválido para $($entry.username)." }
  $emailKey = $entry.email.ToLowerInvariant()
  if ($seen.ContainsKey($emailKey)) { throw "E-mail duplicado na lista: $($entry.email)" }
  $seen[$emailKey] = $true
}

$headers = @{ apikey = $adminKey; Authorization = "Bearer $adminKey"; 'Content-Type' = 'application/json' }
$root = $baseUrl.TrimEnd('/')
foreach ($entry in $document.users) {
  if (-not $entry.enabled) { continue }
  $passwordSecure = Read-Host "Senha inicial para $($entry.username) <$($entry.email)>" -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure)
  try { $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
  if ($password.Length -lt 8) { $password = $null; $passwordSecure.Dispose(); throw 'A senha inicial deve ter pelo menos 8 caracteres.' }

  $body = @{
    email = $entry.email.Trim()
    password = $password
    email_confirm = $true
    user_metadata = @{ username = $entry.username; display_name = $entry.displayName }
  } | ConvertTo-Json -Depth 6 -Compress
  $password = $null
  try {
    $created = Invoke-RestMethod -Method Post -Uri "$root/auth/v1/admin/users" -Headers $headers -Body $body
    Write-Host "Conta criada: $($entry.username) <$($entry.email)> (ID $($created.id)). Entregue a senha inicial em privado."
  } catch {
    $status = [int]$_.Exception.Response.StatusCode
    if ($status -eq 422 -or $status -eq 409) {
      Write-Warning "A conta $($entry.email) já existe. Nenhuma senha foi alterada."
      continue
    }
    throw "Não foi possível criar $($entry.email) (HTTP $status). Confira a URL e a chave administrativa local."
  } finally { $body = $null; $passwordSecure.Dispose() }
}
