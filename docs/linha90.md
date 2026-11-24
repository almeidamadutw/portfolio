# LINHA90 — conta e acesso de vendedores

Atualizado em 24/11/2026.

## Acesso

- Cliente: `/conta.html`, cadastro com nome, e-mail real e senha, seguido de confirmação por e-mail.
- Vendedor: `/conta.html?acesso=vendedor`, identificador `nomedaloja/colaborador@linha90` e senha.
- Gestão: `/admin.html`, disponível a vendedor provisionado ou administrador autorizado.
- Catálogo: `/catalogo.html`.

O identificador de vendedor é normalizado para minúsculas. Loja e colaborador aceitam letras ASCII, números, `_` e `-`, até 40 caracteres cada. O servidor traduz o identificador para um endereço interno do Supabase, sem depender de envio de e-mail para esse endereço. O cadastro público rejeita identificadores e endereços internos de vendedor.

## Permissões

A autorização vem exclusivamente de `app_metadata` do Supabase Auth, validada pelo servidor. Nunca usar `user_metadata` para conceder acesso.

Vendedor usa:

- `linha90_role`: `seller`;
- `linha90_store_id`: identificador da loja;
- `linha90_login`: `nomedaloja/colaborador@linha90`.

`linha90_role=admin` continua reservado a administradores. Cadastro público e Google geram apenas clientes. A criação de vendedores deve ocorrer por operador autorizado, com vínculo explícito à loja. Os dois acessos de teste foram provisionados no projeto LINHA90; senhas não são versionadas no repositório.

## Sessão e API

`api/account.js` é uma função Node da Vercel. Usa Supabase Auth no projeto dedicado `blhtbiogihdwbyntzeib`, chave publishable e cookies `__Host-`, HttpOnly, Secure e SameSite=Lax. Nenhuma chave de serviço é exposta.

- `GET /api/account`: perfil validado pelo Supabase e disponibilidade do Google. Renova a sessão quando necessário, rotacionando o refresh token.
- `POST ?action=signup`: solicita confirmação do cadastro de cliente.
- `POST ?action=login`: e-mail ou identificador de colaborador, senha e contexto de acesso.
- `POST ?action=logout`: encerra a sessão atual e remove cookies.
- `POST ?action=google`: inicia OAuth com PKCE, apenas se o provedor estiver habilitado.
- `POST ?action=oauth`: troca o código por sessão, exigindo o verificador PKCE guardado no cookie.

POST exige JSON e origem exata do domínio confiável. Respostas usam `Cache-Control: no-store`. Tokens e verificadores não ficam em localStorage nem aparecem no perfil retornado.

Variáveis opcionais: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `APP_ORIGIN`. A origem de produção é `https://linha90.vercel.app`.

## Google

O código está preparado para Sign in with Google com PKCE. O botão aparece somente quando o Supabase informa que o provedor está habilitado. Em 24/11, o provedor estava desativado: o fluxo real Google ainda não foi validado.

Para ativar:

1. Criar cliente OAuth de aplicação Web no Google Auth Platform, com escopos `openid`, e-mail e perfil.
2. Origem autorizada: `https://linha90.vercel.app`.
3. Callback autorizado no Google: `https://blhtbiogihdwbyntzeib.supabase.co/auth/v1/callback`.
4. Inserir Client ID e Client Secret no provedor Google do Supabase.
5. Configurar Site URL `https://linha90.vercel.app` e permitir redirecionamento exato para `https://linha90.vercel.app/conta.html` no Supabase.
6. Testar entrada, retorno à conta e encerramento da sessão com uma conta Google real.

## Escopo atual da gestão

O painel mantém rascunhos de produtos no navegador. Eles agora ficam separados por loja (ou ID de administrador) e só são carregados depois da validação de acesso. Essa separação local não substitui políticas de banco para dados comerciais compartilhados. Publicação de produtos, pedidos, pagamentos e gestão de colaboradores pelo painel ainda precisam de backend próprio. A autenticação não transforma esses recursos em operações comerciais prontas.

## Validação

Execute `node --test tests/account.test.js` para verificar a tradução do identificador, limites entre cliente/vendedor/admin, rejeição de cadastro interno, origem, confirmação, renovação e PKCE.

Também foram executados testes de integração contra o Supabase real: login, leitura de perfil, renovação e logout dos dois perfis; a tentativa de acesso de cliente como vendedor foi negada. O login Google exige configuração externa e teste real após ativação.
