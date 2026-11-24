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
