# LINHA90 — redesign

A branch main permanece intacta. A branch linha90-redesign parte do commit 7b7d36c220da86c2d3ae9d4a3af150fbc1123877.

## Teste local

Sirva a raiz do projeto com `python -m http.server 8000` e acesse http://localhost:8000/ (vitrine) e http://localhost:8000/admin.html (painel). Use a mesma origem e navegador para sincronizar os dados de teste.

1. Cadastre ou edite um produto de demonstração não regulado, com SKU único, descrição, preço, custo, estoque e imagem HTTPS opcional.
2. Na vitrine, teste busca, categorias, ordenação, favoritos, detalhes e carrinho.
3. Simule um pedido sem pagamento nem dados pessoais. O estoque de teste será atualizado.
4. No painel, avance o status do pedido um passo por vez. Cancelar antes de concluir estorna o estoque. Concluir alimenta os indicadores simulados de receita, custo e margem bruta.
5. Restaurar demo apaga os dados locais de teste.

## Arquivos

- index.html: vitrine
- admin.html: gestão demo
- style.css: CSS original preservado
- store.css: extensão da identidade visual HUD, azul-marinho, azul elétrico e Orbitron/Inter
- store.js: lógica de demonstração local

## Bloqueios e requisitos

O projeto é um protótipo estático, não uma operação comercial. Não existe autorização real no painel e noindex não protege acesso. Não publique o painel como gestão real. localStorage é local ao navegador e não oferece segurança, integridade transacional, sincronização entre dispositivos ou backup. Não insira informações pessoais, credenciais ou vendas reais. Os produtos e preços são fictícios.

Antes de qualquer operação real é necessário banco compartilhado, autenticação com autorização no servidor, transações atômicas, armazenamento de imagens, catálogo validado, testes de segurança, políticas de privacidade, histórico de pedidos, integração de frete e pagamento para produtos permitidos. A tela Clientes é informativa e ainda não gerencia clientes. Não foram configurados pagamentos, entregas, banco ou login.

A consulta Vercel ao projeto informado retornou 404, portanto não há deploy confirmado. Mantenha a produção original na main até validar o protótipo.

## Identidade visual atualizada

As quatro referências de marca foram inspecionadas. A versão clara e a versão escura foram vetorizadas a partir dos contornos das imagens PNG transparentes, com proporções preservadas e pequenas aproximações de contorno. Os arquivos web estão em assets/linha90-light.svg e assets/linha90-dark.svg; o favicon é inspirado no zero da marca. O degradê horizontal da referência colorida usa #006EFF → #4DA4FF; o fundo neutro de referência é #1A1A1A e o lettering claro é #EEEDE9. A vitrine utiliza a marca clara no cabeçalho, título e rodapé, e a escura no bloco azul da página inicial. O painel usa a marca clara e os mesmos acentos de cor. O CSS e os fluxos de demonstração anteriores foram preservados. A main permanece intacta.

## Cadastro e login (24/11/2026)

A página conta.html foi adicionada à navegação. A função Vercel api/account.js usa Supabase Auth do projeto dedicado LINHA90 (blhtbiogihdwbyntzeib), com URL e chave publishable padrão; as variáveis SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY podem sobrescrevê-las. Não foi usada chave de serviço. A sessão usa cookie HttpOnly, Secure e SameSite=Lax com validade de até uma hora. Após expiração é necessário entrar novamente. O cadastro solicita confirmação de e-mail; a configuração de SMTP, Site URL e redirecionamentos do Supabase ainda deve ser validada. Configure APP_ORIGIN com o domínio HTTPS exato se não estiver presente nas origens confiáveis de VERCEL_URL/VERCEL_PROJECT_PRODUCTION_URL. O formulário falha de forma fechada quando o serviço não está disponível.

O perfil administrativo é reconhecido apenas por app_metadata.linha90_role = admin, atribuído por operador autorizado após cadastro e confirmação de e-mail. Isso habilita o link no perfil, mas não constitui proteção do antigo painel estático. O painel admin.html continua destinado somente a dados locais fictícios, sem acesso administrativo real ao banco. A produção requer autorização no servidor para cada operação e políticas RLS. Ainda não foi integrado pagamento, nem foi verificado o deploy da nova API. A Vercel não retornou o projeto da loja na equipe conectada. Nenhuma alteração foi feita nos demais projetos Supabase.

## Vitrine, catálogo e acesso do vendedor (main)

A main agora possui catalogo.html, links de catálogo e Área do vendedor (conta.html?acesso=vendedor). O catálogo público começa vazio, sem produtos fictícios e sem simulação de pedido. O checkout está desabilitado até existir uma integração autorizada. A interface administrativa consulta GET /api/account e só mostra o painel se o perfil retornado pelo servidor tiver admin=true. A página é estática e o controle visual não substitui autorização de dados no backend. O painel usa rascunhos locais separados da vitrine e não publica produtos. Não há sincronização real de catálogo. O login do vendedor requer usuário confirmado no Supabase Auth e app_metadata.linha90_role=admin atribuído por operador autorizado. Teste de sintaxe dos scripts store.js e account.js concluído; teste em navegador e deploy não confirmados.
