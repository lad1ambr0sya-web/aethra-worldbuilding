# Segurança do Aethra

O código HTML/CSS/JavaScript servido ao navegador é público. O URL do Supabase e a chave `sb_publishable` identificam o projeto e foram feitos para uso público; não são senhas administrativas. As permissões reais são verificadas pelo Supabase em cada requisição.

## Proteções

- Cadastro público e acesso anônimo ao banco desativados.
- `aethra_workspaces` usa RLS com `auth.uid() = user_id`, tanto para consultar quanto para gravar dados.
- Senhas e chaves administrativas ficam fora do código. `users.json`, `.env`, certificados, credenciais e backups locais são ignorados pelo Git. `.gitignore` não remove arquivos já versionados.
- GitHub Secret Scanning e Push Protection ativados no repositório.
- Antes de cada publicação, o Gitleaks verifica todo o histórico e oculta valores dos alertas nos logs. Apenas chaves `sb_publishable` têm uma exceção explícita; nenhuma exceção existe para chaves administrativas.
- O gerador da configuração recusa chaves secretas ou JWT com papel `service_role`, evitando que uma variável de deploy incorreta seja publicada no navegador.

## Auditoria de 5 de novembro de 2026

Gitleaks 8.30.1 analisou o histórico de 57 commits e os arquivos atuais. O único alerta inicial era a chave pública do Supabase, confirmado como falso positivo. Após a exceção específica para esse tipo público, as duas análises terminaram sem achados. Isso não é garantia de ausência de toda vulnerabilidade e não substitui uma auditoria completa de aplicação.

O endpoint público de configurações confirmou `disable_signup: true`; consulta ao banco sem autenticação retornou HTTP 401. A política ativa foi inspecionada no Dashboard. O teste de isolamento com duas contas reais e acesso autenticado não foi realizado nesta revisão, pois não usamos senhas dos usuários.

## Credencial exposta

Revogue ou rotacione a credencial no serviço emissor antes de remover o valor dos arquivos. Remover somente o último commit não a apaga do histórico, clones ou forks. Nunca coloque `service_role`, `sb_secret`, senha do banco, token GitHub, tokens de sessão ou senhas de usuários em arquivos publicados.

O login do app guarda a sessão no navegador. Saia da conta em computadores compartilhados e proteja o acesso administrativo ao GitHub/Supabase com autenticação de dois fatores. A administração de contas é feita no Supabase, não há painel administrativo público no Aethra.
