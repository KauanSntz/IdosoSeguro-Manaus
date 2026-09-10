# -*- coding: utf-8 -*-
import sys
import os
import io

# Ensure UTF-8 stdio
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Canvas de duas passagens para calcular total de páginas e inserir rodapé e cabeçalho dinâmicos.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#506579"))

        # Don't draw header/footer on cover page (page 1)
        if self._pageNumber > 1:
            # Running Header
            self.drawString(54, 842 - 36, "Idoso Seguro+ Manaus — Documentação Técnica do Sistema")
            self.setStrokeColor(colors.HexColor("#E1E8EE"))
            self.setLineWidth(0.5)
            self.line(54, 842 - 42, 595 - 54, 842 - 42)

            # Running Footer
            page_text = f"Página {self._pageNumber} de {page_count}"
            self.drawRightString(595 - 54, 36, page_text)
            self.drawString(54, 36, "Confidencial — Projeto de Graduação TCC / IHC & UX/UI")
            self.line(54, 48, 595 - 54, 48)

        self.restoreState()


def build_pdf(filename="Documentacao_Tecnica_Idoso_Seguro_Manaus.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palette Colors
    c_primary = colors.HexColor("#138A5B")
    c_primary_dark = colors.HexColor("#0B5D42")
    c_primary_light = colors.HexColor("#DDF5E9")
    c_secondary = colors.HexColor("#1D5D9B")
    c_secondary_light = colors.HexColor("#E6F2FF")
    c_text = colors.HexColor("#17324D")
    c_muted = colors.HexColor("#506579")
    c_bg_light = colors.HexColor("#F8FBFA")
    c_warning = colors.HexColor("#F4B740")
    c_border = colors.HexColor("#E1E8EE")

    # Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=c_primary_dark,
        alignment=0,
        spaceAfter=12
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=15,
        leading=20,
        textColor=c_secondary,
        alignment=0,
        spaceAfter=24
    )

    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_primary_dark,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_secondary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    style_h3 = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_text,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text,
        spaceAfter=8
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text,
        leftIndent=15,
        spaceAfter=4
    )

    style_callout = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white,
        alignment=0
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=c_text
    )

    story = []

    # =========================================================
    # CAPA DO DOCUMENTO
    # =========================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("DOCUMENTAÇÃO TÉCNICA E CONCEITUAL", ParagraphStyle('SubHeaderTag', fontName='Helvetica-Bold', fontSize=12, leading=14, textColor=c_primary, spaceAfter=8)))
    story.append(Paragraph("IDOSO SEGURO+ MANAUS", style_cover_title))
    story.append(Paragraph("Sistema Web Mobile-First Acessível, Educativo e Preventivo para Segurança Digital da Pessoa Idosa", style_cover_subtitle))
    
    story.append(HRFlowable(width="100%", thickness=4, color=c_primary, spaceBefore=0, spaceAfter=20))
    
    cover_meta_text = """
    <b>Escopo:</b> Protótipo Front-End Acessível (PWA) + API REST Node.js + Motor Heurístico Python + Banco SQLite<br/>
    <b>Área:</b> Interação Humano-Computador (IHC), Usabilidade (UX/UI), Acessibilidade (WCAG 2.2 / e-MAG)<br/>
    <b>Público-Alvo Representativo:</b> Dona Raimunda (67 anos, Manaus - AM)<br/>
    <b>Status do Projeto:</b> MVP Funcional Testado e Validado<br/>
    <b>Data:</b> Setembro / 2026
    """
    
    meta_table = Table(
        [[Paragraph(cover_meta_text, style_body)]],
        colWidths=[487]
    )
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary_light),
        ('BOX', (0, 0), (-1, -1), 1.5, c_primary),
        ('PADDING', (0, 0), (-1, -1), 16),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 40))

    # Executive Summary Card
    exec_summary_html = """
    <b>Resumo Executivo:</b><br/>
    Este documento apresenta a especificação técnica integral do sistema <b>Idoso Seguro+ Manaus</b>. 
    A solução visa capacitar pessoas idosas para navegação digital segura por meio de dois modos complementares: o <b>Modo Ensinar</b> (educação preventiva e prática com quizzes pedagógicos) e o <b>Modo Assistir</b> (verificação voluntária de textos, links, imagens e áudios). 
    A arquitetura foi desenvolvida utilizando <b>HTML5/CSS3/JavaScript Vanilla (PWA)</b> no front-end, <b>Node.js/Express</b> no back-end, banco de dados <b>SQLite</b> e um motor inteligente em <b>Python 3</b> para análise de riscos.
    """
    exec_table = Table([[Paragraph(exec_summary_html, style_callout)]], colWidths=[487])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_secondary_light),
        ('BOX', (0, 0), (-1, -1), 1, c_secondary),
        ('PADDING', (0, 0), (-1, -1), 14),
    ]))
    story.append(exec_table)

    story.append(PageBreak())

    # =========================================================
    # SEÇÃO 1: VISÃO GERAL E CONCEITUAÇÃO DO PROJETO
    # =========================================================
    story.append(Paragraph("1. Visão Geral e Conceituação do Projeto", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph("1.1 Contexto e Justificativa Social", style_h2))
    story.append(Paragraph(
        "A inclusão digital da pessoa idosa no Brasil avançou rapidamente impulsionada pela popularização dos smartphones, aplicativos de mensagens (WhatsApp) e serviços bancários digitais (Pix, internet banking). Contudo, esse público enfrenta desafios severos de segurança cibernética devido ao assédio constante de engenharia social, falsas centrais telefônicas, mensagens com senso de urgência e golpes de clonagem de perfil.",
        style_body
    ))
    story.append(Paragraph(
        "Muitas soluções de segurança tradicionais adotam abordagens puramente bloqueadoras, punitivas ou alarmistas (ex: 'VOCÊ FOI FRAUDADO' ou termos técnicos obscuros como 'Phishing Detectado 87.4%'). Esse tipo de abordagem gera medo, retira a autonomia da pessoa idosa e desencoraja a utilização da tecnologia. O <b>Idoso Seguro+ Manaus</b> foi concebido para preencher essa lacuna por meio de uma postura <b>assistiva, transparente e pedagógica</b>.",
        style_body
    ))

    story.append(Paragraph("1.2 A Persona Orientadora: Dona Raimunda", style_h2))
    persona_box = """
    <b>Persona: Dona Raimunda, 67 anos (Manaus - AM)</b><br/>
    • <b>Perfil:</b> Aposentada, nível tecnológico básico, possui smartphone intermediário com acesso à internet móvel.<br/>
    • <b>Usos Diários:</b> WhatsApp para falar com a família, Facebook para notícias e aplicativo do banco para checar saldo.<br/>
    • <b>Principais Dores:</b> Receio de clicar em links falsos, dúvida constante sobre se uma mensagem recebida de um filho pedindo Pix é verdadeira ou golpe, receio de perder o benefício do INSS por falta de atualização cadastral.<br/>
    • <b>Necessidades de Design:</b> Letras grandes e legíveis, botões amplos e fáceis de tocar, instruções por voz, alto contraste e linguagem simples sem jargões computacionais.
    """
    p_table = Table([[Paragraph(persona_box, style_callout)]], colWidths=[487])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_bg_light),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 10))

    story.append(Paragraph("1.3 O Diferencial: Ciclo Assistivo-Educativo", style_h2))
    story.append(Paragraph(
        "O principal pilar conceitual do sistema é o <b>Ciclo Assistivo-Educativo</b>. Em vez de apenas emitir um alerta pontual sobre uma mensagem analisada, o sistema conecta o resultado da verificação a um conteúdo educativo correspondente no Modo Ensinar. Assim, o momento da dúvida se transforma em uma oportunidade concreta de aprendizagem e autonomia.",
        style_body
    ))

    # Diagram Table for Cycle
    cycle_data = [
        [Paragraph("<b>Etapa 1:</b> O usuário recebe uma mensagem suspeita no WhatsApp.", style_table_cell)],
        [Paragraph("<b>Etapa 2:</b> Envia voluntariamente a mensagem para análise no Modo Assistir.", style_table_cell)],
        [Paragraph("<b>Etapa 3:</b> O motor Python avalia os sinais de risco e exibe indícios em linguagem amigável.", style_table_cell)],
        [Paragraph("<b>Etapa 4:</b> O sistema oferece o botão <i>'APRENDER SOBRE ISSO NO MODO ENSINAR'</i>.", style_table_cell)],
        [Paragraph("<b>Etapa 5:</b> O usuário acessa a aula temática e realiza um quiz prático, fixando o conhecimento.", style_table_cell)]
    ]
    cycle_table = Table(cycle_data, colWidths=[487])
    cycle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F0F7F4")),
        ('GRID', (0, 0), (-1, -1), 0.5, c_primary),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cycle_table)

    story.append(PageBreak())

    # =========================================================
    # SEÇÃO 2: ARQUITETURA TÉCNICA E TECNOLOGIAS
    # =========================================================
    story.append(Paragraph("2. Arquitetura Técnica e Engenharia de Software", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph("2.1 Visão Geral da Arquitetura em Camadas", style_h2))
    story.append(Paragraph(
        "A aplicação adota uma arquitetura desacoplada em camadas, dividida entre Front-End SPA/PWA, Back-End em Node.js com Express, Motor de Análise de Risco em Python e Banco de Dados Relacional SQLite. Essa estrutura garante facilidade de manutenção, baixo acoplamento e expansibilidade futura.",
        style_body
    ))

    # Architecture Diagram as Table
    arch_data = [
        [Paragraph("<b>Camada</b>", style_table_header), Paragraph("<b>Tecnologias Utilizadas</b>", style_table_header), Paragraph("<b>Responsabilidades Técnicas</b>", style_table_header)],
        [
            Paragraph("<b>Front-End</b><br/>(Interface Web)", style_table_cell),
            Paragraph("HTML5 Semântico<br/>CSS3 (Design Tokens)<br/>JavaScript Vanilla SPA<br/>Web Speech API", style_table_cell),
            Paragraph("Renderização das 10 telas acessíveis, gerenciamento de estado de acessibilidade, navegação SPA por hash, síntese e reconhecimento de voz.", style_table_cell)
        ],
        [
            Paragraph("<b>Back-End API</b><br/>(Servidor Node)", style_table_cell),
            Paragraph("Node.js (v24+)<br/>Express.js 4.19<br/>Helmet, CORS, Multer", style_table_cell),
            Paragraph("Orquestração de rotas REST, middlewares de segurança, upload temporário de mídias e mediação com o analisador Python.", style_table_cell)
        ],
        [
            Paragraph("<b>Motor Heurístico & IA</b><br/>(Python Engine)", style_table_cell),
            Paragraph("Python 3.9<br/>Modulo `re`, `urllib`<br/>Módulo `ai_nlp_module`<br/>STDIO JSON Wrapper", style_table_cell),
            Paragraph("Execução da verificação híbrida: regras determinísticas (regex/links) e inteligência artificial semântica (NLP) para textos, áudios e imagens.", style_table_cell)
        ],
        [
            Paragraph("<b>Banco de Dados</b><br/>(Persistência)", style_table_cell),
            Paragraph("SQLite 3<br/>`sqlite3` driver", style_table_cell),
            Paragraph("Armazenamento dos tópicos educativos, aulas, questões de quiz, histórico de análises e progresso dos usuários.", style_table_cell)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[90, 150, 247])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary_dark),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(arch_table)

    story.append(Spacer(1, 14))

    story.append(Paragraph("2.2 Especificação Detalhada das Linguagens e Bibliotecas", style_h2))

    story.append(Paragraph("<b>A. Front-End (HTML5, CSS3, JavaScript Vanilla):</b>", style_h3))
    story.append(Paragraph("• <b>HTML5 Semântico:</b> Uso rigoroso de tags como <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code> e atributos ARIA (<code>aria-label</code>, <code>role</code>) para acessibilidade.", style_bullet))
    story.append(Paragraph("• <b>CSS3 Modular & Variables:</b> Estruturado em 6 arquivos dedicados (<code>reset.css</code>, <code>variables.css</code>, <code>components.css</code>, <code>accessibility.css</code>, <code>responsive.css</code>, <code>style.css</code>). Utiliza unidades relativas (<code>rem</code>, <code>em</code>) e CSS Custom Properties para alterar dinamicamente o tamanho da fonte e ativar o Modo Alto Contraste.", style_bullet))
    story.append(Paragraph("• <b>JavaScript Vanilla (ES6+):</b> Sem frameworks pesados (como React ou Angular), garantindo carregamento instantâneo em smartphones antigos. Inclui um roteador SPA baseado em <code>hashchange</code>.", style_bullet))
    story.append(Paragraph("• <b>Web Speech API:</b> Utiliza <code>window.speechSynthesis</code> para leitura em voz alta do conteúdo das telas em português (pt-BR) e <code>webkitSpeechRecognition</code> para ditado por voz nos campos de entrada.", style_bullet))

    story.append(Paragraph("<b>B. Back-End (Node.js & Express):</b>", style_h3))
    story.append(Paragraph("• <b>Express.js:</b> Framework web minimalista estruturado no padrão <i>Controller ➔ Service ➔ Repository</i>.", style_bullet))
    story.append(Paragraph("• <b>Helmet & CORS:</b> Configuração de segurança HTTP para proteção de cabeçalhos.", style_bullet))
    story.append(Paragraph("• <b>Multer:</b> Gerenciamento seguro de uploads de mídias temporárias.", style_bullet))

    story.append(Paragraph("<b>C. Motor Heurístico e Inteligência Artificial em Python (Python 3.9):</b>", style_h3))
    story.append(Paragraph("• <b>PythonAdapter (`child_process.spawn`):</b> O servidor Node.js invoca o processo Python transmitindo o JSON via <code>stdin</code> e recebendo o diagnóstico estruturado via <code>stdout</code>. Um wrapper com <code>io.TextIOWrapper</code> garante a codificação de caracteres UTF-8 no Windows.", style_bullet))
    story.append(Paragraph("• <b>text_analyzer.py:</b> Avalia padrões de urgência, solicitações de senhas/código SMS, falso parente no WhatsApp e atua em conjunto com o módulo de IA semântica.", style_bullet))
    story.append(Paragraph("• <b>ai_nlp_module.py:</b> Módulo de Inteligência Artificial responsável pela análise semântica contextual, identificação de coerência de linguagem natural e engenharia social avançada.", style_bullet))
    story.append(Paragraph("• <b>link_analyzer.py:</b> Verifica ausência de HTTPS, domínios numéricos por IP, encurtadores conhecidos (bit.ly, t.co), TLDs suspeitos (.site, .xyz) e imitação de domínios oficiais (typosquatting).", style_bullet))
    story.append(Paragraph("• <b>risk_rules.py:</b> Realiza a ponderação do score e converte o resultado em níveis assistivos (<i>Baixo Risco Aparente</i>, <i>Sinais que Merecem Atenção</i>, <i>Alto Nível de Atenção</i>).", style_bullet))

    story.append(Paragraph("<b>D. Banco de Dados SQLite:</b>", style_h3))
    story.append(Paragraph("• <b>Esquema Relacional (`schema.sql`):</b> Tabelas para <code>education_topics</code>, <code>education_content</code>, <code>quiz_questions</code>, <code>quiz_answers</code>, <code>analyses</code> e <code>quiz_progress</code>.", style_bullet))

    story.append(Spacer(1, 10))

    story.append(Paragraph("2.3 Componente de Inteligência Artificial (IA) e Arquitetura Híbrida", style_h2))
    story.append(Paragraph(
        "Para garantir maior precisão e capacidade de resposta no reconhecimento de tentativas de golpe, o <b>Idoso Seguro+ Manaus</b> integra um componente de <b>Inteligência Artificial (IA / NLP)</b> em arquitetura híbrida com o motor em Python.",
        style_body
    ))

    ai_box = """
    <b>Especificação do Módulo de Inteligência Artificial (IA / NLP):</b><br/>
    • <b>Componente Implementado:</b> Módulo de Processamento de Linguagem Natural (NLP) e Transcrição Inteligente de Fala para Texto (Speech-to-Text via IA).<br/>
    • <b>Função Principal:</b> Análise semântica contextual de intenções maliciosas, detecção de padrões de engenharia social, identificação de tom de urgência velada e transcrição de áudios.<br/>
    • <b>Entradas Processadas:</b> Textos de mensagens recebidas, transcrições de voz (áudios do WhatsApp) e contextos visuais de imagens/comprovantes.<br/>
    • <b>Relação com o Motor Heurístico Python:</b><br/>
    &nbsp;&nbsp;- <i>Camada 1 (Motor Heurístico):</i> Realiza triagem determinística rápida (regex de links, verificação de HTTPS, TLDs suspeitos e palavras-chave estáticas).<br/>
    &nbsp;&nbsp;- <i>Camada 2 (Módulo de IA / NLP):</i> Avalia a mensagem sob o prisma semântico e contextual, identificando ambiguidades ou disfarces que regras estáticas não capturam isoladamente.<br/>
    • <b>Posicionamento Conceitual:</b> A IA é mantida estritamente como <b>ferramenta assistiva e de apoio educativo</b>, e NÃO como autoridade decisória absoluta ou punitiva. O sistema nunca rotula autoritariamente um conteúdo, mas apresenta indicadores transparentes e orienta o aprendizado do usuário.
    """
    ai_table = Table([[Paragraph(ai_box, style_callout)]], colWidths=[487])
    ai_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary_light),
        ('BOX', (0, 0), (-1, -1), 1, c_primary),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(ai_table)

    story.append(PageBreak())

    # =========================================================
    # SEÇÃO 3: ACESSIBILIDADE WCAG 2.2 E E-MAG
    # =========================================================
    story.append(Paragraph("3. Acessibilidade (WCAG 2.2 e e-MAG)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph(
        "A acessibilidade do <b>Idoso Seguro+ Manaus</b> foi projetada seguindo as diretrizes internacionais da <b>WCAG 2.2 (Web Content Accessibility Guidelines)</b> e o modelo brasileiro <b>e-MAG (Modelo de Acessibilidade em Governo Eletrônico)</b>.",
        style_body
    ))

    wcag_data = [
        [Paragraph("<b>Requisito de Acessibilidade</b>", style_table_header), Paragraph("<b>Critério WCAG / e-MAG</b>", style_table_header), Paragraph("<b>Implementação no Idoso Seguro+</b>", style_table_header)],
        [
            Paragraph("<b>Alvo de Toque Amplo</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 2.5.8 Target Size", style_table_cell),
            Paragraph("Todos os botões principais possuem altura mínima de <b>56px</b> e raio de curvatura de 16px, superando o requisito mínimo do W3C de 24 × 24 CSS pixels.", style_table_cell)
        ],
        [
            Paragraph("<b>Tamanho de Texto Escalável</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 1.4.4 Resize Text", style_table_cell),
            Paragraph("Fonte base padrão de <b>18px</b>. O usuário pode alternar facilmente entre tamanhos (A-, A, A+) aumentando até 120% sem quebrar o layout.", style_table_cell)
        ],
        [
            Paragraph("<b>Alto Contraste Visual</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 1.4.3 Contrast (Minimum)", style_table_cell),
            Paragraph("Botão dedicado de Alto Contraste na barra superior, aplicando fundo preto (<code>#000000</code>) e texto branco com verde neon (<code>#00FF66</code>).", style_table_cell)
        ],
        [
            Paragraph("<b>Leitura por Voz (TTS)</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 1.3.1 Info & Relationships", style_table_cell),
            Paragraph("Botão <b>'🔊 Ouvir esta tela'</b> presente em todas as views, utilizando a Web Speech API para leitura em voz alta e suporte a tecnologias assistivas.", style_table_cell)
        ],
        [
            Paragraph("<b>Alternativas Textuais</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 1.1.1 Non-text Content", style_table_cell),
            Paragraph("Descrição textual alternativa (atributos <code>alt</code> e rótulos ARIA) para todas as imagens, ícones ilustrativos e elementos visuais do sistema.", style_table_cell)
        ],
        [
            Paragraph("<b>Entrada por Voz (STT)</b>", style_table_cell),
            Paragraph("e-MAG — 3.6 Facilitar a entrada de dados", style_table_cell),
            Paragraph("Botão <b>'🎤 FALAR EM VEZ DE DIGITAR'</b> que permite ditar mensagens de dúvida via voz (Speech-to-Text), reduzindo o esforço motor e cognitivo.", style_table_cell)
        ],
        [
            Paragraph("<b>Navegação por Teclado</b>", style_table_cell),
            Paragraph("WCAG 2.2 — 2.1.1 Keyboard", style_table_cell),
            Paragraph("Foco visível (<i>focus indicator</i>) em destaque com contorno azul de 4px e Skip Link (<code>Pular para o conteúdo principal</code>).", style_table_cell)
        ]
    ]
    wcag_table = Table(wcag_data, colWidths=[110, 140, 237])
    wcag_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary_dark),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(wcag_table)

    story.append(Spacer(1, 14))

    # =========================================================
    # SEÇÃO 4: AVALIAÇÃO IHC - HEURÍSTICAS DE NIELSEN
    # =========================================================
    story.append(Paragraph("4. Avaliação de IHC: As 10 Heurísticas de Nielsen", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph(
        "A interface do protótipo foi minuciosamente avaliada sob a ótica das <b>10 Heurísticas de Usabilidade de Jakob Nielsen (H1 a H10)</b>, conforme exigido na disciplina de IHC:",
        style_body
    ))

    heuristics_data = [
        [Paragraph("<b>Heurística de Nielsen</b>", style_table_header), Paragraph("<b>Aplicação Prática no Idoso Seguro+ Manaus</b>", style_table_header)],
        [
            Paragraph("<b>H1 — Visibilidade do Status do Sistema</b>", style_table_cell),
            Paragraph("Durante a análise no Modo Assistir, o aplicativo exibe a tela acessível <i>'Estamos verificando...'</i> acompanhada de animação de spinner e indicador por voz.", style_table_cell)
        ],
        [
            Paragraph("<b>H2 — Correspondência entre o Sistema e o Mundo Real</b>", style_table_cell),
            Paragraph("Utiliza termos cotidianos como <i>'Verificar mensagem'</i> e <i>'Sinais que merecem atenção'</i> em vez de vocabulário técnico como <i>'Submeter payload'</i> ou <i>'Phishing'</i>.", style_table_cell)
        ],
        [
            Paragraph("<b>H3 — Controle e Liberdade do Usuário</b>", style_table_cell),
            Paragraph("Botões bem visíveis de <i>'⬅️ Voltar'</i> e <i>'Cancelar'</i> em todas as etapas de submissão, permitindo que a pessoa idosa desista de uma ação sem sobressaltos.", style_table_cell)
        ],
        [
            Paragraph("<b>H4 — Consistência e Padronização</b>", style_table_cell),
            Paragraph("Padrão visual uniforme em todas as telas: cards brancos com bordas arredondadas, botões de 56px nas cores verde/azul e cabeçalho com acesso a ajuda e acessibilidade.", style_table_cell)
        ],
        [
            Paragraph("<b>H5 — Prevenção de Erros</b>", style_table_cell),
            Paragraph("Avisos claros reforçando a privacidade antes da submissão: <i>'Não envie senhas secretas ou dados bancários pessoais'</i>.", style_table_cell)
        ],
        [
            Paragraph("<b>H6 — Reconhecimento em vez de Mencionamento</b>", style_table_cell),
            Paragraph("Opções de verificação organizadas em cards visuais com ícones grandes (💬 Mensagem, 🔗 Link, 🖼️ Imagem, 🎤 Áudio) sem exigir memorização.", style_table_cell)
        ],
        [
            Paragraph("<b>H7 — Flexibilidade e Eficiência de Uso</b>", style_table_cell),
            Paragraph("Possibilidade de interagir por toque, por teclado, por comandos de voz (ditado) ou por leitura por voz dos textos.", style_table_cell)
        ],
        [
            Paragraph("<b>H8 — Design Minimalista e Estética</b>", style_table_cell),
            Paragraph("Telas despoluídas com um ou dois focos de ação principais por vez, evitando sobrecarga cognitiva no público idoso.", style_table_cell)
        ],
        [
            Paragraph("<b>H9 — Ajuda aos Usuários a Reconhecer e Recuperar Erros</b>", style_table_cell),
            Paragraph("No quiz, se o usuário escolher uma opção incorreta, o feedback é acolhedor (<i>'Vamos entender juntos:'</i>) explicando o motivo sem julgamentos.", style_table_cell)
        ],
        [
            Paragraph("<b>H10 — Ajuda e Documentação</b>", style_table_cell),
            Paragraph("Tela dedicada de <b>❓ Ajuda</b> com respostas diretas a perguntas comuns sobre o aplicativo e dicas de segurança digital.", style_table_cell)
        ]
    ]
    h_table = Table(heuristics_data, colWidths=[160, 327])
    h_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary_dark),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_light])
    ]))
    story.append(h_table)

    story.append(PageBreak())

    # =========================================================
    # SEÇÃO 5: GUIA DE EXECUÇÃO E TESTES
    # =========================================================
    story.append(Paragraph("5. Guia de Execução, Instalação e Testes", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph("5.1 Requisitos de Ambiente", style_h2))
    story.append(Paragraph("• <b>Node.js:</b> Versão 18.0.0 ou superior (testado na v24.15.0).", style_bullet))
    story.append(Paragraph("• <b>Python:</b> Versão 3.9.0 ou superior.", style_bullet))
    story.append(Paragraph("• <b>Navegador Web:</b> Google Chrome, Microsoft Edge ou Mozilla Firefox com suporte a Web Speech API.", style_bullet))

    story.append(Paragraph("5.2 Comandos de Instalação e Execução", style_h2))
    cmd_box = """
    <b># 1. Instalar as dependências do Node.js</b><br/>
    npm install<br/><br/>
    <b># 2. Inicializar o banco de dados SQLite com a semente</b><br/>
    npm run db:init<br/><br/>
    <b># 3. Executar a suíte de testes automatizados</b><br/>
    npm test<br/><br/>
    <b># 4. Iniciar o servidor de aplicação</b><br/>
    npm start<br/><br/>
    <b># 5. Acessar no navegador:</b> http://localhost:3000
    """
    cmd_table = Table([[Paragraph(cmd_box, style_callout)]], colWidths=[487])
    cmd_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#17324D")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 1, c_primary),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(cmd_table)

    story.append(Spacer(1, 14))

    story.append(Paragraph("5.3 Roteiro de Demonstração para a Banca / Professora", style_h2))
    story.append(Paragraph("1. <b>Boas-Vindas e Acessibilidade:</b> Abra <code>http://localhost:3000</code>. Clique em <i>'⚙️ Acessibilidade'</i> para demonstrar o Modo Alto Contraste e o aumento de fonte <i>A+</i>.", style_bullet))
    story.append(Paragraph("2. <b>Modo Ensinar:</b> Acesse o tópico <i>'Links Suspeitos'</i>. Clique no botão <i>'🔊 Ouvir Explicação'</i> para demonstrar a síntese de voz e depois conclua o <i>Quiz</i>.", style_bullet))
    story.append(Paragraph("3. <b>Modo Assistir (Verificação):</b> Vá em <i>'Verificar Mensagem'</i> e submeta o texto de teste: <code>'Urgente! Seu benefício foi bloqueado. Digite sua senha no link http://atualiza-banco.site'</code>.", style_bullet))
    story.append(Paragraph("4. <b>Ciclo Assistivo-Educativo:</b> Mostre o resultado com a badge de <i>'🛑 Fortes Indícios de Risco'</i> e em seguida clique no botão verde <i>'📚 APRENDER SOBRE ISSO NO MODO ENSINAR'</i> para demonstrar o fechamento do ciclo.", style_bullet))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=10, spaceAfter=10))
    story.append(Paragraph("<b>Idoso Seguro+ Manaus — Segurança digital com autonomia, respeito e acessibilidade.</b>", ParagraphStyle('FooterTagline', fontName='Helvetica-Bold', fontSize=10, textColor=c_primary_dark, alignment=1)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ PDF gerado com sucesso: {filename}")

if __name__ == "__main__":
    build_pdf()
