# Check List – Inspeção Ambiental

App leve (PWA) que funciona em **Android e iPhone**, **sem internet** durante a inspeção. Ele gera o relatório em PDF no próprio celular e envia o arquivo para uma pasta de um canal do **Microsoft Teams**.

---

## 1. Publicar o app (gratuito) – GitHub Pages

O app precisa estar num endereço `https://` para a câmera, o modo offline e o login Microsoft funcionarem.

1. Crie uma conta gratuita em <https://github.com>.
2. Clique em **New repository**, dê o nome `checklist-ambiental`, marque **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file** e arraste **todo o conteúdo** desta pasta (arquivos e as pastas `img` e `lib`). Depois clique em **Commit changes**.
4. Vá em **Settings → Pages**. Em *Branch*, escolha `main` e `/ (root)`, depois clique em **Save**.
5. Em 1 a 2 minutos o app fica disponível em:
   `https://SEU-USUARIO.github.io/checklist-ambiental/`

> O repositório é público, mas **nenhum dado de inspeção vai para lá**. As inspeções ficam só no celular e os PDFs vão para o seu Teams. O "ID do aplicativo" do Microsoft não é segredo.

## 2. Instalar no celular

- **Android (Chrome):** abra o endereço, toque no menu **⋮** e depois em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o endereço, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

Abra o app pelo ícone ao menos uma vez com internet. Depois disso, ele funciona offline.

## 3. Configurar o envio automático ao Teams (feito uma vez, pelo administrador do Microsoft 365)

1. Acesse <https://entra.microsoft.com> e vá em **Identidade → Aplicativos → Registros de aplicativo → Novo registro**.
   - Nome: `Check List Inspeção Ambiental`
   - Tipos de conta: **Somente contas neste diretório organizacional**
   - URI de redirecionamento: plataforma **Aplicativo de página única (SPA)**, com o endereço exato do app (ex.: `https://SEU-USUARIO.github.io/checklist-ambiental/`, **com a barra no final**)
   - Clique em **Registrar**
2. Na tela de visão geral, copie:
   - **ID do aplicativo (cliente)**
   - **ID do diretório (locatário)**
3. Vá em **Permissões de API → Adicionar uma permissão → Microsoft Graph → Permissões delegadas** e adicione:
   - `User.Read`
   - `Team.ReadBasic.All`
   - `Channel.ReadBasic.All`
   - `Files.ReadWrite.All`

   Depois clique em **Conceder consentimento do administrador para (sua organização)**.
4. No app, abra **⚙️ Configurações → Microsoft Teams**:
   - cole os dois IDs;
   - toque em **Entrar com conta Microsoft** (use a conta da profissional, que precisa ser **membro da equipe**);
   - escolha a **Equipe**, o **Canal** e o nome da pasta (padrão: `Relatórios de Inspeção`).

Os PDFs serão salvos em: **Canal → Arquivos → Relatórios de Inspeção → (Nome da fazenda) → Relatorio_Inspecao_Fazenda_AAAA-MM-DD.pdf**

> Sem internet no momento de gerar o PDF? O arquivo fica salvo no celular. Quando houver sinal, abra a inspeção e toque em **Enviar para o Teams**.

## 4. Como usar

1. Na tela inicial, toque num item numerado (1 a 20).
2. Em cada subitem, toque em **Conforme**, **Não conforme** ou **N/A**.
   - Em **Não conforme** aparecem o campo de observações, o prazo de adequação e o botão **📷 Tirar foto**. Cada foto recebe data, hora e GPS gravados na imagem.
3. Volte pela seta **‹** ou vá para o item seguinte com **Próximo**.
4. Toque em **Finalizar e gerar relatório**, preencha empresa, fazenda, data e responsável (e as assinaturas, se quiser) e toque em **Gerar relatório PDF**.
5. Na tela seguinte você pode **Compartilhar / Salvar / Imprimir**, **Baixar** ou **Enviar para o Teams** (o envio é automático se estiver configurado).

Tudo é salvo automaticamente a cada toque. As inspeções anteriores ficam em **Inspeções salvas**.

## 5. Alterar o checklist

Edite o arquivo `checklist.js` (textos, itens, placas), depois abra `sw.js` e aumente o número em `VERSAO` (ex.: `checklist-v2`). Por fim, envie os dois arquivos ao GitHub. Os celulares recebem a atualização na próxima vez que abrirem o app com internet.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html`, `styles.css`, `app.js` | telas do app |
| `checklist.js` | **conteúdo do checklist e dados do emissor** |
| `pdf.js` | layout do relatório PDF |
| `teams.js` | envio ao Microsoft Teams (Microsoft Graph) |
| `db.js` | armazenamento local no celular |
| `sw.js`, `manifest.json` | funcionamento offline e instalação |
| `lib/` | bibliotecas jsPDF e MSAL (incluídas para funcionar offline) |
