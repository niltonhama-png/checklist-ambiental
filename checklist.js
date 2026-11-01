/*
 * CHECKLIST DE INSPEÇÃO AMBIENTAL
 * ------------------------------------------------------------------
 * Para editar o checklist, altere somente este arquivo.
 *  - Cada seção tem: id, titulo, grupos[]
 *  - Cada grupo tem: rotulo (opcional), repetivel (opcional), itens[]
 *  - "nota" (opcional) aparece como texto informativo, sem botões.
 * Depois de editar, aumente a VERSAO em sw.js para os celulares
 * baixarem a atualização.
 */
const CHECKLIST = [
  {
    id: 1, titulo: 'Posto de Abastecimento de Combustível', icone: '⛽',
    grupos: [
      { itens: [
        'Possui capacidade de contenção de, pelo menos, 110% do maior tanque armazenado (165% em áreas ambientalmente sensíveis)?',
        'Possui sistema de contenção em bom estado?',
        'Possui piso de abastecimento?',
        'O piso de abastecimento está limpo e organizado?',
        'Possui caixa separadora de água e óleo (CSAO)?',
        'A caixa CSAO está funcionando adequadamente?',
        'A distância dos tanques de abastecimento em relação às outras edificações é superior a 4,5 metros?',
        'Possui extintor de incêndio na área?',
        'Realiza o controle diário do estoque, disponível no local?',
        'A régua de medição está de fácil leitura?',
        'A válvula entre a bacia e a caixa é aberta somente quando é feito o eventual esgotamento da bacia?',
        'A bomba de abastecimento está fora da bacia de contenção?',
        'Possui lista de telefones de emergência?',
        'Todos os tanques de armazenamento de diesel possuem a sinalética obrigatória?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Depósito de Combustível',
        'Placa: Área Restrita (somente pessoal autorizado)',
        'Placa: Perigo – Inflamável',
        'Placa: Atenção (Regras)',
        'Placa: Telefones de Emergência',
      ]},
    ],
  },
  {
    id: 2, titulo: 'Armazenamento de Defensivos', icone: '🧪',
    grupos: [
      { itens: [
        'O depósito de defensivos é construído com material adequado (alvenaria ou material sólido)?',
        'O acesso ao depósito de defensivos agrícolas é restrito?',
        'As chaves e o acesso às instalações de armazenamento limitam-se a trabalhadores com formação adequada no manuseio destes produtos?',
        'A ventilação do depósito é suficiente para que o ambiente não tenha cheiro forte de defensivo (ex.: exaustor ou aberturas teladas próximas ao teto)?',
        'A estrutura de emergência está a até 10 metros do depósito de defensivos e das áreas de manipulação?',
        'A estrutura de emergência contém chuveiro de emergência, lava-olhos, pia e caixa de primeiros socorros?',
        'O depósito tem iluminação suficiente para a leitura de rótulos e embalagens?',
        'O depósito está com temperatura entre 5 °C e 40 °C?',
        'Possui extintor de incêndio?',
        'O depósito tem retenção de derramamento nas portas/saídas ou caixas de contenção?',
        'A superfície das prateleiras é impermeável?',
        'Os produtos estão separados adequadamente nas prateleiras, de forma organizada, sinalizada e/ou por cultura?',
        'O armazenamento está adequado quanto à posição líquidos × sólidos (sólidos sempre acima dos líquidos)?',
        'As embalagens vazias de defensivos NÃO são reutilizadas?',
        'Estão disponíveis os EPIs necessários para a atividade, conforme o PGRTR (NR-31), inclusive para visitantes e subcontratados?',
        'O depósito possui telefones de emergência (SAMU, hospitais próximos, Bombeiros, responsáveis da propriedade)?',
        'Os produtos fitofarmacêuticos concentrados são transportados de modo seguro e protegido entre as unidades de produção (veículo apropriado)?',
        'Os defensivos obsoletos (vencidos/inutilizados) estão segregados, identificados com fita zebrada (preta e amarela) e guardados de forma segura até sua eliminação?',
        'Possui kit de contenção de derramamentos (pá, vassoura, balde com serragem e balde vazio para a serragem contaminada)?',
        'Possui controle diário de estoque de defensivos disponível no local?',
        'Possui FISPQ de todos os produtos disponível no local?',
        'Todos os fertilizantes são armazenados separados dos defensivos agrícolas?',
        'O depósito é exclusivo para defensivos?',
        'Os produtos estão afastados 0,5 m da parede, sobre paletes plastificados e/ou prateleiras impermeáveis?',
        'O piso é impermeável e permite limpeza e descontaminação?',
        'Possui sistema de contenção (canaletas, lombadas, muretas) que impede a saída de resíduos para fora do depósito?',
        'Não há aberturas que permitam a entrada de animais?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Depósito de Defensivos Agrícolas / Área Restrita (somente pessoal autorizado)',
        'Placas: Inseticidas / Herbicidas / Acaricidas / Fungicidas',
        'Placas: Chuveiro de Emergência / Lava-Olhos de Emergência',
        'Placas: Kit de Descontaminação / Kit de Primeiros Socorros',
        'Placas: EPI Obrigatório / Produtos Vencidos e Obsoletos',
        'Placas: Proibido Fumar / Queda ou Vazamento de Defensivos Agrícolas / Extintor de Incêndio',
      ]},
    ],
  },
  {
    id: 3, titulo: 'Armazenamento de Embalagens Vazias', icone: '📦',
    grupos: [
      { itens: [
        'O acesso é restrito a trabalhadores capacitados e o depósito permanece trancado?',
        'Todas as embalagens vazias de agrotóxicos são destinadas corretamente?',
        'As embalagens vazias (1 L, 5 L, 10 L, 20 L, flexíveis, papelão, tampas/lacres) estão separadas e identificadas?',
        'Possui extintor de incêndio?',
        'É exigido o uso obrigatório de EPIs?',
        'As embalagens passaram por tríplice lavagem?',
        'A estrutura do depósito é metálica, de alvenaria ou de madeira?',
        'O piso é cimentado, com canaletas, lombadas ou muretas direcionando para caixa de contenção de efluentes?',
        'A cobertura do depósito possui beiral de, no mínimo, 1 metro?',
        'Possui muretas de 1 m de altura com tela de proteção e cortina de lona em todo o perímetro (até o telhado), ou paredes com espaço superior para ventilação?',
        'Possui calçada de 1 metro de largura em todo o perímetro do depósito?',
        'Não há aberturas que permitam a entrada de animais?',
        'Possui caixa de contenção?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Depósito de Embalagens Vazias de Agrotóxicos',
        'Placa: Área Restrita (somente pessoal autorizado)',
        'Placas: Embalagens Vazias 20 L / 10 L / 5 L / 1 L / Embalagens Secundárias (papelão) / Embalagens Flexíveis / Resíduos Contaminados / Tampas e Lacres',
        'Placas: Kit de Descontaminação / Proibido Fumar / Queda ou Vazamento de Defensivos Agrícolas',
        'Placa: Kit de Primeiros Socorros',
      ]},
    ],
  },
  {
    id: 4, titulo: 'Preparo de Calda', icone: '🪣',
    grupos: [
      { itens: [
        'O acesso aos defensivos agrícolas é restrito na área de preparo de calda?',
        'As chaves e o acesso às instalações limitam-se a trabalhadores com formação adequada no manuseio destes produtos?',
        'A estrutura de emergência está próxima às áreas de manipulação de defensivos (máximo 10 m)?',
        'A estrutura de emergência está completa (chuveiro e lava-olhos de emergência, pia, caixa de primeiros socorros e telefones de emergência)?',
        'As áreas de manipulação possuem instrumentos de medida adequados (copos graduados, balanças calibradas e utensílios impermeáveis para mistura)?',
        'Há estojos de primeiros socorros com os itens definidos no PGRTR/PCMSO e EPIs para cada atividade, inclusive para visitantes e subcontratados?',
        'Os produtos fitofarmacêuticos concentrados são transportados de modo seguro e protegido entre as unidades de produção (veículo apropriado)?',
        'O piso para preparo da calda está adequado e em boas condições?',
        'Existe contenção na área de preparo para evitar que derramamentos acidentais atinjam o solo?',
        'A área de preparo de calda está a, no mínimo, 25 m de cursos d’água ou pontos de captação?',
        'É realizada a tríplice lavagem das embalagens vazias imediatamente após o preparo da calda?',
        'As embalagens vazias são inutilizadas imediatamente após a tríplice lavagem?',
        'As embalagens vazias são armazenadas de forma adequada (local próprio, com acesso restrito)?',
        'Os EPIs adequados estão disponíveis e em uso?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Preparo de Calda',
        'Placa: Tríplice Lavagem',
        'Placas: Acidentes com Produtos Químicos / Queda ou Vazamento de Defensivos Agrícolas',
        'Placas: Chuveiro de Emergência / Lava-Olhos de Emergência',
        'Placas: EPI Obrigatório / Proibido Fumar',
        'Placas: Água Não Potável / Kit de Primeiros Socorros / Telefones de Emergência',
      ]},
    ],
  },
  {
    id: 5, titulo: 'Armazenamento de Óleo / ARLA / Lubrificantes', icone: '🛢️',
    grupos: [
      { itens: [
        'Possui caixa de contenção?',
        'A contenção está ligada à caixa separadora de água e óleo?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
    ],
  },
  {
    id: 6, titulo: 'Lavador de Maquinário', icone: '🚜',
    grupos: [
      { itens: [
        'Possui piso impermeável, que comporte o tamanho do maquinário, com canaletas de contenção e condução da água para a caixa separadora de água e óleo?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
    ],
    nota: 'Conforme a Política Nacional de Resíduos Sólidos, a área de lavagem de maquinários deve ter piso impermeável que comporte o tamanho do maquinário, com canaleta ligada à caixa separadora de água e óleo. Recomenda-se construir junto à área de lavagem o depósito de óleos novos e usados e a casa da bomba de água do lavador, o que melhora a organização dos materiais, especialmente dos resíduos para descarte.',
  },
  {
    id: 7, titulo: 'Depósito de Adubo', icone: '🌱',
    grupos: [
      { itens: [
        'Possui estoque?',
        'Os produtos estão sobre paletes plastificados?',
        'Possui anotações/controle de estoque?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Depósito de Adubos',
        'Placa: Acesso Restrito (somente pessoal autorizado)',
        'Placa: Proibido Fumar',
        'Placa: Telefones de Emergência',
      ]},
    ],
  },
  {
    id: 8, titulo: 'Depósito de Foliar', icone: '🍃',
    grupos: [
      { itens: [
        'Possui estoque?',
        'Os produtos estão sobre paletes plastificados, com contenção no caso de líquidos?',
        'Possui anotações/controle de estoque?',
        'Os produtos vencidos estão identificados com fita zebrada?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Adubo Foliar',
        'Placa: Acesso Restrito (somente pessoal autorizado)',
        'Placa: Proibido Fumar',
        'Placa: Telefones de Emergência',
        'Placa: EPI Obrigatório',
        'Placa: Produtos Vencidos e Obsoletos',
      ]},
    ],
  },
  {
    id: 9, titulo: 'Área de Vivência e Banheiros no Campo', icone: '⛺',
    grupos: [
      { itens: [
        'É disponibilizado aos trabalhadores local para guardar alimentos e local para refeições, quando estas são feitas na unidade de produção?',
        'Há equipamento completo de lavagem de mãos nas áreas de vivência, banheiros e áreas de manipulação do produto colhido (pia, sabonete, antisséptico, papel toalha)?',
        'Possui mesas, cadeiras, lixeiras, armários e marmiteiro em boas condições?',
        'As instalações sanitárias são construídas com materiais fáceis de limpar?',
        'As instalações sanitárias estão a uma distância razoável do local de trabalho (ex.: 500 m ou 7 minutos)?',
        'Os equipamentos de lavagem de mãos estão acessíveis e próximos às instalações sanitárias, sem risco de contaminação cruzada?',
        'É disponibilizada água potável para os colaboradores?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas e itens de higiene', itens: [
        'Placas: Higienização das Mãos / Primeiros Socorros',
        'Placas: Instruções Gerais de Higiene / Proibido Fumar',
        'Placas: Kit de Primeiros Socorros / Telefones de Emergência',
        'Placa: Orientações de Segurança do Alimento',
        'Placa: EPI × Atividades',
        'Material de limpeza disponível',
        'Placa: Água Potável',
        'Sabonete líquido, álcool em gel e papel toalha disponíveis',
        'Quadro de comunicados',
      ]},
    ],
  },
  {
    id: 10, titulo: 'Banheiros', icone: '🚻',
    grupos: [
      { itens: [
        'Possui fossa séptica?',
        'As instalações sanitárias são construídas com materiais fáceis de limpar?',
        'As instalações sanitárias estão a uma distância razoável do local de trabalho (ex.: 500 m ou 7 minutos)?',
        'Os equipamentos de lavagem de mãos estão acessíveis e próximos às instalações sanitárias, sem risco de contaminação cruzada?',
        'As portas possuem travas?',
        'Os vasos possuem assento com tampa?',
        'A iluminação e a ventilação são adequadas?',
        'São separados por sexo (acima de 5 trabalhadores que utilizem a instalação)?',
        'O acesso é fácil e seguro?',
        'Há água limpa, sabão e papel toalha?',
        'Há papel higiênico e cesto de lixo?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placas: Masculino / Feminino',
        'Placas: Higiene das Mãos / Cuidados com o Banheiro',
      ]},
    ],
  },
  {
    id: 11, titulo: 'Casas', icone: '🏠',
    grupos: [
      { itens: [
        'Os alojamentos/casas dos trabalhadores são habitáveis, com telhado firme, janelas, portas e abastecimento de água?',
        'Possui instalações sanitárias e esgotamento sanitário?',
        'Possui caixa de gordura?',
        'Possui coleta/destinação de resíduos?',
      ]},
    ],
  },
  {
    id: 12, titulo: 'Refeitórios', icone: '🍽️',
    grupos: [
      { itens: [
        'Apresenta boas condições de higiene e conforto?',
        'Tem capacidade para atender todos os trabalhadores?',
        'Há água limpa?',
        'As mesas possuem tampos laváveis?',
        'Há água potável, sem uso de copos coletivos?',
        'Os depósitos de lixo possuem tampa?',
        'Há local para guardar e conservar as refeições?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placas: Refeitório / Água Potável / Higienização das Mãos',
        'Placas: Instruções Gerais de Higiene / Proibido Fumar / Orientações de Segurança do Alimento',
      ]},
    ],
  },
  {
    id: 13, titulo: 'Oficina', icone: '🔧',
    grupos: [
      { itens: [
        'Os resíduos contaminados são separados dos demais?',
        'Possui kit de descontaminação (1 pá, 2 vassouras, 1 balde com serragem limpa, 1 balde vazio)?',
        'Possui caixa separadora de água e óleo?',
        'Os resíduos são destinados corretamente?',
        'O local é utilizado somente para este tipo de atividade?',
        'Há local adequado para lavagem de peças?',
        'A oficina está organizada, garantindo eficiência, fácil acesso a ferramentas e peças e segurança do ambiente?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placas: Oficina / Estoque de Óleos e Lubrificantes / Kit de Descontaminação',
      ]},
    ],
  },
  {
    id: 14, titulo: 'Cozinha', icone: '🍳',
    grupos: [
      { itens: [
        'O balcão é de fácil limpeza e adequado ao manuseio de alimentos?',
        'Possui depósito adequado para alimentos?',
        'O gás é armazenado em ambiente externo?',
        'As janelas possuem telas e a ventilação é adequada?',
        'Possui caixa de gordura?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas e itens de higiene', itens: [
        'Placas: Cozinha / Água Potável / Instruções Gerais de Higiene',
        'Placas: Proibido Fumar / Orientações de Segurança do Alimento',
        'Sabonete líquido, álcool em gel e papel toalha disponíveis',
      ]},
    ],
  },
  {
    id: 15, titulo: 'Lavanderia de EPI / Vestiário', icone: '🧺',
    grupos: [
      { itens: [
        'Possui registro da lavagem dos EPIs de pulverização no local?',
        'A conservação, manutenção, limpeza e utilização dos EPIs são realizadas somente por pessoas previamente treinadas?',
        'Os EPIs de pulverização são secos à sombra?',
        'A água de lavagem de equipamentos contaminados é eliminada de modo a minimizar riscos à saúde, à segurança e ao meio ambiente?',
        'A água de lavagem dos EPIs é canalizada para caixa de contenção (reservatório) e/ou tratamento?',
        'Possui vestiário e armário para guardar EPIs?',
        'Possui chuveiro de emergência?',
        'O piso é impermeável, com contenção e canaletas?',
        'O local está limpo e organizado?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placa: Lavagem de EPIs',
        'Placa: Limpeza e Higienização de EPIs',
        'Placa: Como Retirar o EPI',
        'Placa: Como Colocar o EPI',
        'Placa/Formulário: Registro de Lavagem de EPIs',
      ]},
    ],
  },
  {
    id: 16, titulo: 'Armazenamento de Água / Reservatórios', icone: '💧',
    grupos: [
      { itens: [
        'Os reservatórios de água estão legalmente autorizados (possuem outorga)?',
        'Os piscinões estão em bom estado e adequadamente cercados/protegidos para evitar acidentes?',
        'Os piscinões possuem cadastro no IGAM?',
        'Todas as caixas d’água e poços artesianos estão em boas condições e identificados?',
        'Os bebedouros são adequados e identificados como água potável?',
        'As caixas d’água são lavadas a cada 6 meses?',
        'É realizada análise da água a cada 6 meses?',
        'A água potável é clorada (cloro residual livre entre 0,2 e 2 mg/L)?',
        'O local está limpo?',
      ]},
      { rotulo: 'Placas e identificação', itens: [
        'Identificação numerada das caixas d’água (Caixa 1, Caixa 2…)',
        'Placas: Água Potável / Água Não Potável',
        'Atendimento à Portaria GM/MS nº 888/2021 (consumo humano)',
        'Irrigação – captação direta: CONAMA 357 (simplificada)',
        'Irrigação – poço artesiano: CONAMA 396',
      ]},
    ],
  },
  {
    id: 17, titulo: 'Armazenamento de Resíduos', icone: '♻️',
    grupos: [
      { itens: [
        'O local possui estrutura adequada para todos os resíduos da propriedade, identificados?',
        'Todos os resíduos produzidos na fazenda são destinados corretamente?',
        'Possui empresa terceirizada contratada para recebimento dos resíduos?',
        'É evitada a queima de resíduos sem autorização?',
        'Realiza controle de saída de resíduos?',
        'O local é utilizado somente para este tipo de atividade?',
      ]},
      { rotulo: 'Placas', itens: [
        'Placas da Área de Resíduos Sólidos: Orgânicos (lixo doméstico) / Metal / Plástico / Papel e Papelão / Vidros / Pneus / Não Recicláveis / Produtos Contaminados',
      ]},
    ],
  },
  {
    id: 18, titulo: 'Captações', icone: '🚰',
    grupos: [
      { rotulo: 'Poço Artesiano', repetivel: true, itens: [
        'Hidrômetro / laudo da bomba',
        'Horímetro',
        'Anotação do sistema de medição',
        'Outorga',
        'Análise da água',
        'Identificação',
      ]},
      { rotulo: 'Captação Direta', repetivel: true, itens: [
        'Horímetro',
        'Curva da bomba',
        'Anotação do sistema de medição',
        'Outorga',
        'Análise da água',
        'Identificação',
      ]},
      { rotulo: 'Captação em Barramento', repetivel: true, itens: [
        'Horímetro',
        'Curva da bomba',
        'Régua',
        'Anotação do sistema de medição',
        'Outorga',
        'Análise da água',
        'Identificação',
      ]},
    ],
  },
  {
    id: 19, titulo: 'Bebedouro', icone: '🥤',
    grupos: [
      { itens: [
        'Os copos são individuais?',
        'É feita análise da água?',
        'É feita cloração da água?',
        'O local está limpo e organizado?',
      ]},
    ],
  },
  {
    id: 20, titulo: 'Campo', icone: '🌾',
    grupos: [
      { itens: [
        'O local está limpo e organizado?',
      ]},
    ],
  },
];

/* Dados padrão do emissor (editáveis em Configurações no app) */
const EMISSOR_PADRAO = {
  consultoria: 'LA Consultoria Ambiental LTDA',
  cnpj: '51.288.955/0001-27',
  profissional: 'Loren Ferreira Alvarenga',
  cargo: 'Engenheira Ambiental',
  registro: 'CREA MG-189834/D',
  cidade: 'Uberlândia/MG',
};

/* Configuração do envio automático ao Microsoft Teams (preencher após cadastro no Entra ID) */
const TEAMS_CONFIG_PADRAO = {
  clientId: '',   // ID do aplicativo (cliente)
  tenantId: '',   // ID do diretório (locatário)
};
