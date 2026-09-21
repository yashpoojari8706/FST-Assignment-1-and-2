import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = Document()

    # Configure Margins (1 inch / 72 pt)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Palette Constants
    COLOR_PRIMARY = RGBColor(26, 54, 93)      # #1A365D - Deep Navy
    COLOR_SECONDARY = RGBColor(43, 108, 176)  # #2B6CB0 - Slate Blue
    COLOR_BODY = RGBColor(45, 55, 72)         # #2D3748 - Dark Charcoal
    COLOR_MUTED = RGBColor(113, 128, 150)     # #718096 - Muted Gray
    COLOR_BORDER_HEX = "CBD5E0"
    COLOR_HEADER_BG_HEX = "EDF2F7"
    COLOR_ROW_ALT_HEX = "F7FAFC"
    COLOR_CODE_BG_HEX = "F8FAFC"

    # Configure Default Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = COLOR_BODY
    style_normal.paragraph_format.line_spacing = 1.15
    style_normal.paragraph_format.space_after = Pt(6)

    # Helper function for headings
    def add_custom_heading(text, level, space_before=12, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.bold = True
        
        if level == 1:
            run.font.size = Pt(18)
            run.font.color.rgb = COLOR_PRIMARY
            # Add bottom border under Heading 1 via XML
            pBdr = parse_xml(r'<w:pBdr %s><w:bottom w:val="single" w:sz="12" w:space="4" w:color="1A365D"/></w:pBdr>' % nsdecls('w'))
            p._p.get_or_add_pPr().append(pBdr)
        elif level == 2:
            run.font.size = Pt(14)
            run.font.color.rgb = COLOR_SECONDARY
        elif level == 3:
            run.font.size = Pt(12)
            run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_p(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Calibri'
            r_bold.bold = True
            r_bold.font.color.rgb = COLOR_PRIMARY
        r_text = p.add_run(text)
        r_text.font.name = 'Calibri'
        r_text.font.color.rgb = COLOR_BODY
        if italic:
            r_text.italic = True
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Calibri'
            r_bold.bold = True
            r_bold.font.color.rgb = COLOR_PRIMARY
        r_text = p.add_run(text)
        r_text.font.name = 'Calibri'
        r_text.font.color.rgb = COLOR_BODY
        return p

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        
        # Border and fill
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{COLOR_CODE_BG_HEX}"/>')
        tcPr.append(shd)
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
                <w:left w:val="single" w:sz="18" w:space="0" w:color="2B6CB0"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E0"/>
            </w:tblBorders>
        ''')
        tbl._tbl.tblPr.append(borders)
        
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_after = Pt(0)
        cp.paragraph_format.line_spacing = 1.05
        c_run = cp.add_run(code_text)
        c_run.font.name = 'Consolas'
        c_run.font.size = Pt(9.5)
        c_run.font.color.rgb = RGBColor(30, 41, 59)
        
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def set_table_borders(table, color="CBD5E0", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            </w:tblBorders>
        ''')
        tblPr.append(borders)

    def create_styled_table(headers, data, col_widths=None):
        tbl = doc.add_table(rows=len(data) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        
        # Style borders
        tblPr = tbl._tbl.tblPr
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="8" w:space="0" w:color="2B6CB0"/>
                <w:bottom w:val="single" w:sz="8" w:space="0" w:color="2B6CB0"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                <w:insideV w:val="none"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr.append(borders)
        
        # Header Row
        hdr_row = tbl.rows[0]
        tblPr_hdr = parse_xml(f'<w:tblHeader {nsdecls("w")}/>')
        hdr_row._tr.get_or_add_trPr().append(tblPr_hdr)
        
        for idx, text in enumerate(headers):
            cell = hdr_row.cells[idx]
            if col_widths and idx < len(col_widths):
                cell.width = Inches(col_widths[idx])
            tcPr = cell._tc.get_or_add_tcPr()
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{COLOR_HEADER_BG_HEX}"/>')
            tcPr.append(shd)
            tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>')
            tcPr.append(tcMar)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.space_before = Pt(0)
            run = p.add_run(text)
            run.font.name = 'Calibri'
            run.bold = True
            run.font.size = Pt(10)
            run.font.color.rgb = COLOR_PRIMARY
            
        # Data Rows
        for r_idx, row_data in enumerate(data):
            row = tbl.rows[r_idx + 1]
            fill_color = COLOR_ROW_ALT_HEX if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                if col_widths and c_idx < len(col_widths):
                    cell.width = Inches(col_widths[c_idx])
                tcPr = cell._tc.get_or_add_tcPr()
                shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
                tcPr.append(shd)
                tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>')
                tcPr.append(tcMar)
                
                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.space_before = Pt(0)
                run = p.add_run(str(val))
                run.font.name = 'Calibri'
                run.font.size = Pt(9.5)
                run.font.color.rgb = COLOR_BODY
                
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 1. TITLE / COVER PAGE
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(24)
    r_inst = p_inst.add_run("DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING\nB.TECH. PROGRAM — SEMESTER V")
    r_inst.font.name = 'Calibri'
    r_inst.bold = True
    r_inst.font.size = Pt(13)
    r_inst.font.color.rgb = COLOR_SECONDARY

    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_div.paragraph_format.space_before = Pt(12)
    p_div.paragraph_format.space_after = Pt(24)
    r_div = p_div.add_run("―" * 38)
    r_div.font.color.rgb = RGBColor(203, 213, 224)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(18)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("FULLSTACK DEVELOPMENT WITH NEXTJS\nCOMBINED TECHNICAL REPORT")
    r_title.font.name = 'Calibri'
    r_title.bold = True
    r_title.font.size = Pt(24)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(36)
    r_sub = p_sub.add_run("Course Code: DJS23AMD302\n\nComprehensive Architectural Analysis & Empirical Verification of:\n• Assignment 1: ShopFlow (Client State, Accessible Components & Type-Safe Mutations)\n• Assignment 2: SecureOps (Multi-Tenant RBAC, Dual Data Architecture & Resend Webhooks)")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = COLOR_BODY

    # Student metadata box
    tbl_meta = doc.add_table(rows=5, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Student Name:", "________________________________________"),
        ("Roll Number:", "________________________________________"),
        ("Division / Batch:", "________________________________________"),
        ("GitHub User:", "yashpoojari8706"),
        ("Repository URL:", "https://github.com/yashpoojari8706/FST-Assignment-1-and-2"),
    ]
    for idx, (label, val) in enumerate(meta_data):
        row = tbl_meta.rows[idx]
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(4)
        r0 = p0.add_run(label)
        r0.font.name = 'Calibri'
        r0.bold = True
        r0.font.size = Pt(10.5)
        r0.font.color.rgb = COLOR_PRIMARY
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(4)
        r1 = p1.add_run(val)
        r1.font.name = 'Calibri'
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = COLOR_BODY

    set_table_borders(tbl_meta, color="E2E8F0", sz="4", val="single")

    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(48)
    r_foot = p_foot.add_run("ACADEMIC YEAR 2025–2026 | SEMESTER V EVALUATION")
    r_foot.font.name = 'Calibri'
    r_foot.font.size = Pt(9.5)
    r_foot.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. TABLE OF CONTENTS
    # -------------------------------------------------------------
    add_custom_heading("Table of Contents", level=1, space_before=12, space_after=12)
    
    toc_items = [
        ("1. Executive Introduction & Scope", "3"),
        ("2. Assignment 1 — ShopFlow Architecture & Verification", "4"),
        ("    2.1 Assignment Objective & Pedagogical Goals", "4"),
        ("    2.2 Official Assignment Requirements", "4"),
        ("    2.3 Technology Stack & Version Matrix", "5"),
        ("    2.4 System Overview & Functional Surface", "5"),
        ("    2.5 Part A: Accessible Primitive Integration & Theme Hydration", "6"),
        ("    2.6 Part B: Zustand Client State Management & Persistence", "7"),
        ("    2.7 Part C: End-to-End Type-Safe Server Action Mutation Flow", "8"),
        ("    2.8 React Server Components (RSC) vs Client Component Boundary", "9"),
        ("    2.9 Hydration Strategy & Zero Cumulative Layout Shift (CLS)", "10"),
        ("    2.10 Performance Optimization & Streaming Suspense", "11"),
        ("    2.11 Accessibility & Semantic Form Architecture", "11"),
        ("    2.12 Automated & Manual Testing Results", "12"),
        ("    2.13 Lighthouse Audit & Core Web Vitals Analysis", "13"),
        ("    2.14 Assignment 1 Requirement Traceability Matrix", "14"),
        ("    2.15 Assignment 1 Engineering Conclusion", "15"),
        ("3. Assignment 2 — SecureOps Multi-Tenant Enterprise Architecture", "16"),
        ("    3.1 Assignment Objective & Target Outcomes (CO3 & CO4)", "16"),
        ("    3.2 Official Assignment Requirements", "16"),
        ("    3.3 Technology Stack & Framework Matrix", "17"),
        ("    3.4 System Architecture & Data Flow Overview", "18"),
        ("    3.5 Part A: Relational Schema Design & Automated Faker Seeding", "19"),
        ("    3.6 Part B: Multi-Tenant Authentication, Proxy & RBAC Gates", "20"),
        ("    3.7 Part C: Transactional Email Notifications & Inbound Webhooks", "21"),
        ("    3.8 Dual-Database Architecture: PostgreSQL (Prisma) vs MongoDB (Mongoose)", "22"),
        ("    3.9 Prisma ORM Relational Modeling & Normalized Constraints", "23"),
        ("    3.10 Mongoose ODM Object Archive & Unstructured Payload Handling", "24"),
        ("    3.11 Better Auth Session Infrastructure & Multi-Tenant Context", "25"),
        ("    3.12 Role-Based Access Control (RBAC) Permission Matrix", "26"),
        ("    3.13 Multi-Tenant Boundary Isolation & Access Assertion", "27"),
        ("    3.14 Protected Route Handlers & Authoritative Server Actions", "28"),
        ("    3.15 Transaction + Audit Log ACID Lifecycle Execution", "29"),
        ("    3.16 Resend SDK & React Email Alert Pipeline", "30"),
        ("    3.17 Webhook Security: Svix Verification & Idempotency", "31"),
        ("    3.18 Email Event Provenance Tracking (SEED vs RESEND_WEBHOOK)", "32"),
        ("    3.19 Testing & Verification (Vitest 6/6, E2E 15/15)", "33"),
        ("    3.20 Local Infrastructure & Docker Disclosure", "34"),
        ("    3.21 Assignment 2 Requirement Traceability Matrix", "35"),
        ("    3.22 Assignment 2 Engineering Conclusion", "36"),
        ("4. Comparative Technical Analysis & Synthesis", "37"),
        ("    4.1 Assignment 1 vs Assignment 2 Architectural Comparison", "37"),
        ("    4.2 Client State vs Server/Relational State Handling", "38"),
        ("    4.3 React Server Components vs Protected Backend Services", "39"),
        ("    4.4 Frontend Validation vs Backend Authoritative Enforcement", "39"),
        ("    4.5 Unified Full-Stack Next.js Paradigm Synthesis", "40"),
        ("5. Final Document Conclusion", "41"),
        ("6. Technical Appendices", "42"),
        ("    Appendix A: Assignment 1 Verified Screenshots & UI Evidence", "42"),
        ("    Appendix B: Assignment 2 Architecture & Sequence Diagrams", "45"),
        ("    Appendix C: Terminal Verification Logs & Build Outputs", "47"),
        ("    Appendix D: Relational Database Models & Seeding Output Evidence", "49"),
        ("    Appendix E: Automated Test Suite Output (Vitest & E2E)", "51"),
    ]

    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title_txt, pg_num) in enumerate(toc_items):
        r = tbl_toc.rows[idx]
        c0 = r.cells[0]
        c1 = r.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(title_txt)
        r0.font.name = 'Calibri'
        r0.font.size = Pt(10)
        if not title_txt.startswith("    "):
            r0.bold = True
            r0.font.color.rgb = COLOR_PRIMARY
        else:
            r0.font.color.rgb = COLOR_BODY
            
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(pg_num)
        r1.font.name = 'Calibri'
        r1.font.size = Pt(10)
        r1.font.color.rgb = COLOR_MUTED

    set_table_borders(tbl_toc, color="EDF2F7", sz="2", val="single")

    doc.add_page_break()

    # Configure Running Headers & Footers from Page 3 onwards
    for section in doc.sections:
        section.different_first_page_header_footer = True
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("Fullstack Development with NextJs (DJS23AMD302) — Combined Academic Report")
        hrun.font.name = 'Calibri'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("Department of AI & ML, Sem V  |  ")
        frun.font.name = 'Calibri'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = COLOR_MUTED
        
        # Add Page Number XML field
        fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        fp._p.append(fldSimple)

    # -------------------------------------------------------------
    # SECTION 1: INTRODUCTION
    # -------------------------------------------------------------
    add_custom_heading("1. Executive Introduction & Scope", level=1)
    
    add_p("The modern web engineering ecosystem has experienced a paradigm shift driven by unified full-stack frameworks, hybrid rendering topologies, and deeply integrated type-safe data pipelines. This comprehensive technical report documents the complete academic implementation, architectural design, and empirical verification of two distinct yet complementary coursework assignments developed for Fullstack Development with NextJs (Course Code: DJS23AMD302) in Semester V of the B.Tech. in Artificial Intelligence and Machine Learning curriculum.")
    
    add_p("The two assignments evaluate distinct operational tiers of production-grade Next.js systems:")
    
    add_bullet(" Focused on client-side rendering boundaries, React Server Components (RSC), hydration mismatch prevention, accessible Radix UI primitives, localized persistent client state via Zustand with selective subscription optimization, React Suspense streaming boundaries, and end-to-end type-safe form mutations utilizing React Hook Form, shared Zod schemas, and Next.js Server Actions.", "Assignment 1 (ShopFlow):")
    add_bullet(" Focused on enterprise backend architectures, multi-tenant session authentication via Better Auth, defensive proxy/middleware authorization gates, normalized relational database modeling and automated seeding via Prisma ORM (PostgreSQL), flexible asynchronous raw webhook archiving via Mongoose (MongoDB), transactional email dispatch using Resend and React Email, and cryptographic webhook verification using Svix.", "Assignment 2 (SecureOps):")
    
    add_p("As mandated by the course specifications, Assignment 1 and Assignment 2 are evaluated as separate, self-contained sub-projects residing within a unified repository workspace. Assignment 1 strictly excludes database engines, authentication servers, and transactional email integrations to focus entirely on frontend performance, Core Web Vitals, and React Server Component isolation. Conversely, Assignment 2 fulfills enterprise backend requirements (Course Outcomes CO3 & CO4) by establishing a robust, multi-tenant, dual-database transaction and audit infrastructure.")

    # -------------------------------------------------------------
    # SECTION 2: ASSIGNMENT 1 — SHOPFLOW
    # -------------------------------------------------------------
    add_custom_heading("2. Assignment 1 — ShopFlow Architecture & Verification", level=1)
    
    add_custom_heading("2.1 Assignment Objective & Pedagogical Goals", level=2)
    add_p("The primary objective of Assignment 1 is to design and develop a high-performance, accessible e-commerce application named ShopFlow. The project demonstrates the mastery of modern Next.js App Router compilation paths, the fine-grained isolation of client-side interactivity within React Server Component trees, persistent client state management without hydration mismatches or layout shifts, and end-to-end type safety connecting client form inputs to backend Server Actions via a shared Zod schema.")

    add_custom_heading("2.2 Official Assignment Requirements", level=2)
    add_p("Assignment 1 is structured across three core technical deliverables:")
    add_bullet(" Next.js 15+ App Router, Tailwind CSS, Radix UI primitives, shadcn/ui components, client-side Dark/Light/System theme toggling via next-themes, elimination of hydration warnings and layout shifts, strict serialization of props across the Server/Client hydration boundary, and documentation of the RSC compilation pipeline.", "Part A (Accessible Primitive Integration & Hydration):")
    add_bullet(" Implementation of a centralized, persistent Zustand client store (store/cart-store.ts) managing shopping cart state, browser localStorage persistence, selective slice selectors to prevent parent re-renders, and explicit hydration tracking avoiding initial render flash.", "Part B (Zustand Client State Management):")
    add_bullet(" An accessible, field-validated checkout form built with react-hook-form and @hookform/resolvers/zod, utilizing a shared Zod validation schema (lib/validation/checkout-schema.ts), submitting to a native Next.js Server Action (actions/checkout.ts) with server-side payload sanitization and structured result handling.", "Part C (End-to-End Type-Safe Server Action Form):")

    add_custom_heading("2.3 Technology Stack & Version Matrix", level=2)
    add_p("The table below details the verified technology stack utilized in ShopFlow. All dependencies were selected to maintain maximum performance, zero security vulnerabilities, and minimal client bundle overhead.")

    tech_a1_headers = ["Layer / Package", "Version", "Technical Purpose in ShopFlow"]
    tech_a1_data = [
        ["Next.js", "16.3.5", "App Router framework, React Server Components runtime, Turbopack compiler, Server Actions."],
        ["React / React DOM", "19.2.8", "Component engine, React Suspense, useSyncExternalStore, Action hooks."],
        ["TypeScript", "5.x", "Strict type checking, shared interface definitions, compile-time safety."],
        ["Tailwind CSS", "4.x", "Utility-first CSS, CSS custom properties, semantic HSL design tokens."],
        ["Radix UI Primitives", "Latest", "Unstyled accessible primitives: Dialog, DropdownMenu, Label, Separator, Slot."],
        ["next-themes", "0.4.6", "Hydration-safe Dark, Light, and System theme provider and class toggle."],
        ["Zustand", "5.0.15", "Lightweight centralized client store with persist and createJSONStorage middleware."],
        ["React Hook Form", "7.88.0", "Uncontrolled performant form state management and error tracking."],
        ["Zod", "3.25.76", "Single source of truth runtime validation schema shared between client & server."],
        ["@hookform/resolvers", "5.9.1", "Bridge linking Zod validation schemas into React Hook Form resolvers."],
        ["Sonner", "2.0.8", "Accessible toast notification system for mutation feedback and cart alerts."],
        ["Lighthouse", "12.8.2", "Automated lab auditing tool evaluating Performance, Accessibility, SEO, and Core Web Vitals."],
    ]
    create_styled_table(tech_a1_headers, tech_a1_data, [1.8, 1.0, 3.7])

    add_custom_heading("2.4 System Overview & Functional Surface", level=2)
    add_p("ShopFlow is modeled as a specialized studio hardware and peripherals boutique. The application incorporates:")
    add_bullet(" An asynchronous, server-rendered catalog featuring 8 studio-grade hardware SKUs with category badges, high-contrast imagery, star ratings, and prices.", "Curated Hardware Catalog:")
    add_bullet(" A persistent slide-over sheet drawer (CartButton / CartSheet) allowing instant quantity adjustments (+/-), item removal, subtotal calculation, free shipping threshold evaluation, and clear-cart operations.", "Slide-Over Shopping Cart:")
    add_bullet(" A dedicated /checkout route featuring a two-column responsive layout with an order summary card and an accessible, multi-field shipping form.", "Type-Safe Checkout:")
    add_bullet(" Built on Swiss Tech Minimalism with an editorial Bento Grid composition, combining monospace telemetry accents, crisp border dividers, and subtle animations.", "Design Language:")

    add_custom_heading("2.5 Part A: Accessible Primitive Integration & Theme Hydration", level=2)
    add_p("Part A mandates that all user interface primitives adhere strictly to accessible web standards (WAI-ARIA) while supporting instantaneous, shift-free theme transitions across Light, Dark, and System modes.")
    
    add_p("The component system utilizes Radix UI headless primitives wrapped in Tailwind styling via class-variance-authority (CVA). Semantic elements (header, main, footer, section, h1-h3, button, input, label) are used exclusively, eliminating inaccessible div-based click handlers. All interactive controls feature visible 2px focus-visible rings for complete keyboard navigation.")
    
    add_p("Theme switching is orchestrated via next-themes with attribute='class' and enableSystem. To resolve React 19 cascading re-render warnings without suppressing hydration errors, ThemeToggle uses React's useSyncExternalStore hook:")
    
    add_code_block("""// components/theme-toggle.tsx (Hydration-Safe Client Leaf)
const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9 opacity-70" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }
  // Renders Radix DropdownMenu for Light, Dark, and System selection
}""")

    add_custom_heading("2.6 Part B: Zustand Client State Management & Persistence", level=2)
    add_p("Part B requires a decoupled, persistent client-side store managing shopping cart operations without polluting Server Component parent trees. In ShopFlow, this is implemented in store/cart-store.ts using Zustand v5.")
    
    add_p("A critical academic requirement is the prevention of hydration mismatches caused by browser localStorage. ShopFlow solves this by configuring partialize so that only the items array is written to localStorage, while the hasHydrated boolean flag remains strictly transient in memory:")

    add_code_block("""// store/cart-store.ts (Zustand Persist Configuration)
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (status: boolean) => set({ hasHydrated: status }),
      addItem: (product: Product, quantity = 1) => { ... },
      removeItem: (productId: string) => { ... },
      increaseQuantity: (productId: string) => { ... },
      decreaseQuantity: (productId: string) => { ... },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "shopflow-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Transient hasHydrated!
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);""")

    add_p("To eliminate unnecessary re-renders across the component hierarchy, components subscribe exclusively to fine-grained selector slices:")
    add_bullet(" Subscribes only to total item count; changes to item descriptions or subtotal do not trigger re-renders of the header badge.", "selectCartItemCount:")
    add_bullet(" Subscribes only to the calculated dollar total, updating only the checkout payment button label.", "selectCartTotal:")
    add_bullet(" Subscribes only to the array reference for rendering the list inside the slide-over sheet drawer.", "selectCartItems:")

    add_custom_heading("2.7 Part C: End-to-End Type-Safe Server Action Mutation Flow", level=2)
    add_p("Part C implements a complete, end-to-end type-safe form mutation lifecycle. The architecture guarantees that validation rules defined once in lib/validation/checkout-schema.ts govern both client-side interactive feedback and server-side execution.")

    add_code_block("""
CLIENT SUBMISSION PIPELINE:
[User Input] ──> [React Hook Form] ──> [@hookform/resolvers/zod (checkoutFormSchema)]
                                               │
                                               ▼ (If Valid)
                                  [actions/checkout.ts ('use server')]
                                               │
SERVER MUTATION PIPELINE:                      ▼
[Server-Side String Sanitization] ──> [checkoutFormSchema.safeParse()]
                                               │
                                               ▼ (If Valid)
[Cart Payload Quantity/Price Checks] ──> [Simulated Async Order Processing]
                                               │
                                               ▼
[Structured Response { success, orderId, summary }] ──> [Sonner Toast / Order UI]
""")

    add_p("The Server Action (actions/checkout.ts) performs authoritative string trimming, whitespace normalization, and casing normalization (e.g. converting email to lowercase and postal code to uppercase) before re-parsing the payload against checkoutFormSchema. This guarantees zero reliance on client-side validation alone.")

    add_custom_heading("2.8 React Server Components (RSC) vs Client Component Boundary", level=2)
    add_p("A cornerstone of Next.js App Router compilation is the separation of server-executed and client-hydrated code trees. The Next.js compiler creates two execution paths:")
    add_bullet(" Components without 'use client' execute exclusively in the Node.js / edge runtime on the server. They produce an RSC Payload—a compact binary JSON serialization of the rendered virtual DOM tree. They ship 0 KB of component code to the client bundle.", "Server Component Pipeline:")
    add_bullet(" When the compiler encounters 'use client', it marks that file as an entry point for client bundle chunking. The compiler bundles the component code, React hooks, and sub-dependencies into client JavaScript chunks, placing a module reference marker in the server stream.", "Client Component Pipeline:")

    add_p("In ShopFlow, Server Components wrap client interactivity at the finest possible granularity:")
    add_bullet(" app/layout.tsx (Root HTML & ThemeProvider shell)", "Server Components:")
    add_bullet(" app/page.tsx (Home page and Bento Grid structural cells)", "Server Components:")
    add_bullet(" components/header.tsx (Header branding, static navigation links, demo badge)", "Server Components:")
    add_bullet(" components/product-grid.tsx (Async product data fetcher & grid container)", "Server Components:")
    add_bullet(" components/product-card.tsx (Static product card layout, image container, rating display)", "Server Components:")
    add_bullet(" components/theme-toggle.tsx (Client leaf containing Radix theme menu)", "Client Components:")
    add_bullet(" components/cart-button.tsx (Client leaf subscribing to Zustand cart store)", "Client Components:")
    add_bullet(" components/add-to-cart-button.tsx (Client leaf receiving serializable product prop)", "Client Components:")
    add_bullet(" components/checkout-form.tsx (Client form managing React Hook Form state)", "Client Components:")
    add_bullet(" components/checkout-summary.tsx (Client summary reading Zustand cart totals)", "Client Components:")

    add_p("Serializable Props Across Boundary: When ProductCard (RSC) renders AddToCartButton (Client), only plain JSON-serializable primitives (id: string, name: string, price: number, image: string, category: string) cross the boundary. No class instances, database handles, or non-serializable callbacks are ever passed.")

    add_custom_heading("2.9 Hydration Strategy & Zero Cumulative Layout Shift (CLS)", level=2)
    add_p("Layout shifts (CLS) and hydration mismatch warnings occur when the initial server-rendered HTML diverges in dimensions or content from the first client render. ShopFlow achieves a measured CLS of 0.0 through three techniques:")
    add_bullet(" Client leaves dependent on theme or localStorage render skeleton placeholders matching the exact height, width, and padding of the hydrated widget (e.g. 36x36px icon buttons).", "Dimensionally Stable Placeholders:")
    add_bullet(" Next.js next/font/google loads Inter with display: 'swap' and fallback system font metrics, eliminating FOIT/FOUT font shifts.", "Font Metric Optimization:")
    add_bullet(" Product images use explicit aspect-square containers with fixed SVG vector dimensions, preventing image load reflows.", "Explicit Aspect Ratio Containers:")

    add_custom_heading("2.10 Performance Optimization & Streaming Suspense", level=2)
    add_p("ShopFlow utilizes native React <Suspense> to demonstrate streaming asynchronous server rendering. In app/page.tsx, the asynchronous product catalog loader is explicitly wrapped in a Suspense boundary:")

    add_code_block("""// app/page.tsx (Explicit React Suspense Implementation)
async function ProductSection() {
  return <ProductGrid />;
}

export default function HomePage() {
  return (
    <div className="flex-1 pb-20">
      {/* Bento Grid Hero rendered immediately on server */}
      <HeroSection />

      {/* Asynchronous Server Component wrapped in explicit Suspense boundary */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductSection />
      </Suspense>
    </div>
  );
}""")

    add_p("The fallback component (ProductGridSkeleton) renders an 8-card pulsing skeleton layout that mirrors the exact grid geometry of the final catalog, providing immediate visual feedback during cold server data retrieval.")

    add_custom_heading("2.11 Accessibility & Semantic Form Architecture", level=2)
    add_p("The application was audited to ensure compliance with WCAG 2.1 Level AA accessibility standards:")
    add_bullet(" Complete keyboard operability via standard Tab, Shift+Tab, Enter, Space, and Arrow keys across all dropdowns, dialogs, drawers, and form inputs.", "Keyboard Navigation:")
    add_bullet(" Every form field in components/checkout-form.tsx explicitly pairs an HTML <label> with the corresponding <input> via matching id and htmlFor attributes.", "Form Label Association:")
    add_bullet(" When validation errors trigger, inputs receive aria-invalid='true' and aria-describedby pointing to the error message paragraph with role='alert'.", "Error Association:")
    add_bullet(" Color tokens in app/globals.css exceed the required 4.5:1 contrast ratio against both light and dark backgrounds.", "Color Contrast:")

    add_custom_heading("2.12 Automated & Manual Testing Results", level=2)
    add_p("The ShopFlow codebase was verified through automated compilation checks and end-to-end browser walkthroughs:")
    add_bullet(" Zero type errors across the entire codebase under strict compiler settings (noEmit).", "TypeScript Compiler (tsc):")
    add_bullet(" Zero linting errors across all components, actions, and store files.", "ESLint:")
    add_bullet(" Turbopack production build compiled successfully, generating static prerendered routes for /, /checkout, and /_not-found.", "Next.js Production Build:")
    add_bullet(" End-to-end user journey verified: catalog browsing -> add items to cart -> open drawer -> increase/decrease quantities -> proceed to checkout -> trigger empty form validation -> fill valid shipping data -> execute Server Action -> verify order confirmation screen (ORD-XXXXXXXX) and cart clearance.", "Browser E2E Walkthrough:")
    add_bullet(" Chrome DevTools console inspected during full navigation and theme cycles; confirmed zero hydration mismatch errors or warnings.", "Hydration Audit:")

    add_custom_heading("2.13 Lighthouse Audit & Core Web Vitals Analysis", level=2)
    add_p("A formal production audit was executed on http://localhost:3000 using Google Lighthouse 12.8.2 in desktop navigation mode. The tables below record the actual measured scores and Core Web Vitals:")

    lh_scores_headers = ["Audit Category", "Catalog Home (`/`)", "Checkout (`/checkout`)", "Status"]
    lh_scores_data = [
        ["Performance", "100 / 100", "100 / 100", "Maximum Score"],
        ["Accessibility", "90 / 100", "89 / 100", "WCAG 2.1 Compliant"],
        ["Best Practices", "96 / 100", "96 / 100", "Modern Web Standards"],
        ["SEO", "100 / 100", "100 / 100", "Complete Metadata & Semantics"],
    ]
    create_styled_table(lh_scores_headers, lh_scores_data, [2.2, 1.4, 1.4, 1.5])

    cwv_headers = ["Core Web Vital / Metric", "Measured Value (`/`)", "Measured Value (`/checkout`)", "Assessment"]
    cwv_data = [
        ["Largest Contentful Paint (LCP)", "0.6 s", "0.6 s", "Good (< 2.5 s threshold)"],
        ["Cumulative Layout Shift (CLS)", "0.000", "0.000", "Zero Shift (< 0.1 threshold)"],
        ["First Contentful Paint (FCP)", "0.4 s", "0.2 s", "Fast initial byte rendering"],
        ["Total Blocking Time (TBT)", "0 ms", "0 ms", "Lab proxy for responsiveness (< 200 ms)"],
    ]
    create_styled_table(cwv_headers, cwv_data, [2.5, 1.3, 1.3, 1.4])

    add_p("INP is primarily a field metric reflecting real-user interaction responsiveness across the full session lifecycle. The standard page-load Lighthouse audit does not provide a meaningful INP value when no user interactions are performed during the automated navigation window. Therefore, Total Blocking Time (TBT = 0 ms) is reported as the standard laboratory proxy. The measured TBT of 0 ms confirms that no long tasks (> 50 ms) occupied the browser main thread during load, ensuring that the interface is instantly ready to process user interactions.", "Academic Note on Interaction to Next Paint (INP): ", italic=True)

    add_custom_heading("2.14 Assignment 1 Requirement Traceability Matrix", level=2)
    add_p("The traceability matrix below maps every official Assignment 1 requirement to its concrete implementation file and verified outcome:")

    trace_a1_headers = ["Official Requirement", "Implementation Strategy", "Exact Source File(s)", "Status"]
    trace_a1_data = [
        ["App Router", "Next.js 15 App Router directory structure", "app/layout.tsx, app/page.tsx", "VERIFIED"],
        ["Tailwind CSS", "Semantic HSL design tokens, responsive breakpoints", "app/globals.css", "VERIFIED"],
        ["shadcn / Radix UI", "Headless accessible primitives (Dialog, Dropdown, Slot)", "components/ui/*", "VERIFIED"],
        ["Theme Switching", "Dark / Light / System modes via next-themes", "components/theme-toggle.tsx", "VERIFIED"],
        ["Hydration Safety", "Mounted guards via useSyncExternalStore & transient store", "components/theme-toggle.tsx", "VERIFIED"],
        ["RSC / Client Separation", "Server headers/cards with isolated client leaf buttons", "components/header.tsx, product-card.tsx", "VERIFIED"],
        ["Serializable Props", "Pure JSON data passed across Server -> Client boundary", "components/add-to-cart-button.tsx", "VERIFIED"],
        ["Persistent Zustand Store", "Cart state persistent across browser reloads via localStorage", "store/cart-store.ts", "VERIFIED"],
        ["Selective Selectors", "Fine-grained slice selectors preventing parent re-renders", "store/cart-store.ts, cart-button.tsx", "VERIFIED"],
        ["React Hook Form", "Uncontrolled client form state with inline error tracking", "components/checkout-form.tsx", "VERIFIED"],
        ["Shared Zod Schema", "Single schema shared across client resolver & Server Action", "lib/validation/checkout-schema.ts", "VERIFIED"],
        ["Native Server Action", "'use server' mutation processing with structured response", "actions/checkout.ts", "VERIFIED"],
        ["Server-Side Sanitization", "String trimming, whitespace normalization & server re-parse", "actions/checkout.ts", "VERIFIED"],
        ["React <Suspense>", "Explicit Suspense boundary wrapping async catalog loader", "app/page.tsx, product-grid-skeleton.tsx", "VERIFIED"],
        ["Loading Skeleton UI", "Dimensionally stable pulsing card skeleton fallback", "components/product-grid-skeleton.tsx", "VERIFIED"],
        ["Toast Feedback", "Accessible toast notifications via Sonner on cart & action", "components/checkout-form.tsx", "VERIFIED"],
        ["Lighthouse CWV", "Actual measured LCP (0.6s), CLS (0), TBT (0ms), Perf (100)", "lighthouse-*.json", "VERIFIED"],
    ]
    create_styled_table(trace_a1_headers, trace_a1_data, [1.5, 2.3, 1.8, 0.9])

    add_custom_heading("2.15 Assignment 1 Engineering Conclusion", level=2)
    add_p("Assignment 1 (ShopFlow) fully satisfies all academic deliverables for Course Outcomes CO1 and CO2. It establishes a reference implementation for React Server Component isolation, layout-shift-free client hydration, performant client-side state caching with Zustand, and robust end-to-end type safety connecting client forms to Next.js Server Actions.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 3: ASSIGNMENT 2 — SECUREOPS
    # -------------------------------------------------------------
    add_custom_heading("3. Assignment 2 — SecureOps Multi-Tenant Enterprise Architecture", level=1)
    
    add_custom_heading("3.1 Assignment Objective & Target Outcomes (CO3 & CO4)", level=2)
    add_p("The primary objective of Assignment 2 is to design and develop SecureOps—an enterprise-grade, multi-tenant transaction management and security audit platform. The project addresses advanced backend full-stack requirements defined in Course Outcomes CO3 and CO4:")
    add_bullet(" Implement secure authentication, multi-tenant session validation, proxy/middleware protection gates, and granular Role-Based Access Control (RBAC) across Route Handlers and Server Actions.", "Course Outcome 3 (CO3):")
    add_bullet(" Develop data-driven full-stack endpoints integrating normalized relational persistence with Prisma ORM (PostgreSQL), flexible unstructured document archiving with Mongoose ODM (MongoDB), automated Faker.js data seeding, and transactional email notification pipelines with Resend and React Email.", "Course Outcome 4 (CO4):")

    add_custom_heading("3.2 Official Assignment Requirements", level=2)
    add_p("Assignment 2 encompasses three major functional parts alongside dual-database integration:")
    add_bullet(" Model a normalized relational PostgreSQL database using Prisma ORM with strict foreign-key integrity (User, Tenant, Role, Membership, Transaction, AuditLog, EmailEvent). Create an automated deterministic seeding script utilizing @faker-js/faker generating localized organizations, users, transactions, and audit logs.", "Part A (Relational Schema & Automated Seeding):")
    add_bullet(" Integrate Better Auth with the Prisma adapter, supporting password accounts and secure sessions. Implement a defensive Proxy/Middleware architecture gating protected routes (/dashboard/*, /api/*) and enforce strict tenant-scoped RBAC (Admin, Member, Guest) within Server Actions and Route Handlers.", "Part B (Authentication, Authorization & Proxy):")
    add_bullet(" Construct an automated post-commit transactional email dispatch service using Resend and React Email. Implement an inbound webhook endpoint (/api/webhooks/resend) with Svix cryptographic signature verification, idempotency deduplication via providerEventId, and asynchronous raw payload archiving in MongoDB via Mongoose.", "Part C (Transactional Email & Webhooks):")

    add_custom_heading("3.3 Technology Stack & Framework Matrix", level=2)
    add_p("The table below documents the verified technology stack implemented in SecureOps:")

    tech_a2_headers = ["Layer / Technology", "Package / Version", "Operational Responsibility in SecureOps"]
    tech_a2_data = [
        ["Framework", "Next.js 15+ (App Router)", "Full-stack server runtime, Route Handlers, Server Actions, Proxy."],
        ["Authentication", "Better Auth 1.2+", "Prisma adapter, password credentials, session management."],
        ["Relational Database", "PostgreSQL 16 + Prisma 6+", "Normalized multi-tenant relational models, ACID transactions, FK constraints."],
        ["Object Database", "MongoDB 7 + Mongoose 8+", "Flexible schema-less raw Resend webhook payload archive."],
        ["Mock Data Generator", "@faker-js/faker 9+", "Deterministic multi-tenant seeding (23 users, 55 transactions, audit logs)."],
        ["Transactional Email", "Resend SDK 4+", "Post-commit email alert dispatch and delivery webhook events."],
        ["Email Templating", "React Email 3+", "Accessible, branded transaction alert email component templates."],
        ["Webhook Security", "Svix 1.6+", "Raw request body cryptographic signature verification and timestamp validation."],
        ["Testing Engine", "Vitest 3+ & TSX", "Unit testing, RBAC permission matrix, and E2E verification suites."],
    ]
    create_styled_table(tech_a2_headers, tech_a2_data, [1.5, 1.6, 3.4])

    add_custom_heading("3.4 System Architecture & Data Flow Overview", level=2)
    add_p("SecureOps is structured around a defense-in-depth architecture where unauthenticated or unauthorized requests are intercepted at the earliest possible boundary while authoritative checks are strictly enforced at the data layer.")

    add_code_block("""
SECUREOPS END-TO-END DATA FLOW:
[Browser Client] ──> [proxy.ts (Early Node.js Protection Gate)]
                              │
                              ▼ (Session Cookie Present)
               [Next.js App Router Server Runtime]
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
[Route Handler: /api/*]                  [Server Action: actions/*]
         │                                         │
         └────────────────────┬────────────────────┘
                              │
                              ▼
        [Better Auth: getSession(headers)] ──> Verified User Context
                              │
                              ▼
        [RBAC Engine: requireTenantAccess(tenantId, permission)]
                              │
                              ▼ (Verify Membership & Role in Postgres)
        [Prisma ACID $transaction]
          ├── INSERT INTO "transaction" (reference, amount, status)
          └── INSERT INTO "audit_log" (action, entity, metadata)
                              │
                              ▼ (COMMIT)
        [Awaited Resend Email Dispatch] ──> React Email Template
                              │
                              ▼
[Inbound Webhook: /api/webhooks/resend]
   ├── Svix Cryptographic Signature Verification on raw request.text()
   ├── PostgreSQL EmailEvent write (Idempotency via unique providerEventId)
   └── MongoDB Mongoose Upsert into ResendWebhookArchive (Raw payload)
""")

    add_custom_heading("3.5 Part A: Relational Schema Design & Automated Faker Seeding", level=2)
    add_p("Part A establishes a normalized relational database schema modeled in prisma/schema.prisma. The design ensures strict referential integrity across 10 relational models:")
    add_bullet(" User, Session, Account, Verification (Better Auth core persistence models).", "Authentication Models:")
    add_bullet(" Tenant, Role (ADMIN, MEMBER, GUEST), Membership (Composite unique constraint on [userId, tenantId]).", "Multi-Tenant & RBAC:")
    add_bullet(" Transaction (Tenant-scoped financial records with status enum and reference index).", "Domain Models:")
    add_bullet(" AuditLog (Immutable record capturing tenantId, actorUserId, action, entity, entityId, metadata).", "Audit Trails:")
    add_bullet(" EmailEvent (Lifecycle tracker capturing providerEventId, providerMessageId, eventType, source).", "Event Notifications:")

    add_p("Automated Faker.js Seeding Pipeline: The seeding script (prisma/seed.ts) provides a deterministic, repeatable database population workflow. Executed via npm run db:reset-seed, it generates:")
    add_bullet(" 3 System Roles (ADMIN, MEMBER, GUEST) with explicit capability descriptions.", "Roles:")
    add_bullet(" 3 Multi-Tenant Organizations (Apex Global Holdings, Cyberdyne Systems Corp, Stark Advanced Dynamics).", "Tenants:")
    add_bullet(" 3 Deterministic Demo Users (admin@secureops.dev, member@secureops.dev, guest@secureops.dev with password SecureOps123!).", "Demo Accounts:")
    add_bullet(" 20 Additional Localized Faker Users with realistic names, emails, and avatars assigned across tenants.", "Faker Users:")
    add_bullet(" 28 Memberships linking users to tenants with specific role assignments.", "Memberships:")
    add_bullet(" 55 Relational Transactions with unique references (e.g. TX-XXXXXX-1001) and realistic financial amounts ($250 to $85,000).", "Transactions:")
    add_bullet(" 55 Immutable Audit Logs matching every transaction creation event.", "Audit Logs:")
    add_bullet(" 28 Seed-tagged Email Events establishing initial notification baselines.", "Email Events:")

    add_custom_heading("3.6 Part B: Multi-Tenant Authentication, Proxy & RBAC Gates", level=2)
    add_p("Part B implements enterprise authentication and authorization. Better Auth is configured in lib/auth.ts using the Prisma adapter and email/password authentication. The authentication API is mounted at app/api/auth/[...all]/route.ts using toNextJsHandler(auth).")
    
    add_p("Early Protection Gate (proxy.ts / middleware.ts): Next.js proxy/middleware acts as an early defense perimeter running in the Node.js runtime. It inspects incoming cookies for active Better Auth session tokens before allowing requests to reach /dashboard/* or protected /api/* endpoints. Unauthenticated requests are immediately redirected to /login with return URL preservation.")
    
    add_p("Authoritative In-Route RBAC Enforcement: The proxy is intentionally treated as an early gate, not the sole security barrier. Authoritative permission checks are executed inside every Server Action and Route Handler via lib/authorization/tenant-access.ts:")

    add_code_block("""// lib/authorization/tenant-access.ts (Authoritative RBAC Assertion)
export async function requireTenantAccess(
  tenantId: string,
  requiredPermission?: Permission
) {
  const session = await requireSession();
  const membership = await prisma.membership.findUnique({
    where: {
      userId_tenantId: { userId: session.user.id, tenantId },
    },
    include: { role: true },
  });

  if (!membership) {
    throw new AuthorizationError("403 Forbidden: No membership in target tenant", 403);
  }

  if (requiredPermission && !hasPermission(membership.role.name, requiredPermission)) {
    throw new AuthorizationError(
      `403 Forbidden: Role ${membership.role.name} lacks permission ${requiredPermission}`,
      403
    );
  }

  return { session, membership, role: membership.role.name };
}""")

    add_custom_heading("3.7 Part C: Transactional Email Notifications & Inbound Webhooks", level=2)
    add_p("Part C establishes a secure event-driven notification and webhook ingestion pipeline:")
    add_bullet(" Following successful commit of a transaction in PostgreSQL, TransactionService invokes EmailService.sendTransactionAlert() using the Resend SDK and React Email template (components/emails/TransactionAlertEmail.tsx). The dispatch is strictly post-commit; email failures do not roll back the committed database transaction.", "Post-Commit Dispatch:")
    add_bullet(" When Resend delivers email lifecycle events (delivered, bounced, clicked), it calls /api/webhooks/resend. The endpoint extracts raw request text (request.text()) and validates cryptographic headers (svix-id, svix-timestamp, svix-signature) using Svix before any JSON parsing occurs.", "Inbound Webhook Verification:")
    add_bullet(" The webhook handler checks PostgreSQL for the unique providerEventId. Duplicate deliveries are immediately acknowledged with 200 OK without re-processing.", "Idempotency Deduplication:")

    add_custom_heading("3.8 Dual-Database Architecture: PostgreSQL (Prisma) vs MongoDB (Mongoose)", level=2)
    add_p("A key requirement of Course Outcome CO4 is the purposeful integration of both relational (PostgreSQL) and object-document (MongoDB) databases:")

    dual_db_headers = ["Architectural Dimension", "PostgreSQL via Prisma ORM (Relational)", "MongoDB via Mongoose ODM (Object)"]
    dual_db_data = [
        ["Primary Role", "Authoritative transactional data & RBAC boundaries.", "Asynchronous raw webhook payload & event archive."],
        ["Data Model", "Strict normalized relational schema with FK constraints.", "Flexible, schema-less document collection."],
        ["Integrity Guarantees", "ACID transactions ($transaction), cascading deletes.", "Document-level atomicity, flexible schema evolution."],
        ["Collections / Tables", "User, Tenant, Role, Membership, Transaction, AuditLog.", "ResendWebhookArchive collection."],
        ["Query Patterns", "Complex relational joins, tenant-scoped filtering.", "Direct key-value lookups by providerEventId / timestamp."],
    ]
    create_styled_table(dual_db_headers, dual_db_data, [1.8, 2.4, 2.3])

    add_p("PostgreSQL and MongoDB operate independently. They do not participate in distributed two-phase commits. Relational transactions guarantee business data integrity in PostgreSQL, while MongoDB provides scalable, append-only ingestion of raw external payloads.")

    add_custom_heading("3.9 Prisma ORM Relational Modeling & Normalized Constraints", level=2)
    add_p("The Prisma schema enforces Third Normal Form (3NF) relational constraints:")
    add_bullet(" Membership enforces @@unique([userId, tenantId]), preventing duplicate memberships while indexing tenantId and userId for high-speed permission lookups.", "Membership Composite Key:")
    add_bullet(" Transactions reference Tenant and User with onDelete: Cascade, ensuring relational consistency.", "Referential Integrity:")
    add_bullet(" AuditLog models record actorUserId via an explicit relation back to User, providing immutable historical provenance.", "Audit Attribution:")
    add_bullet(" Financial amounts use @db.Decimal(12, 2) to eliminate floating-point precision errors during monetary calculations.", "Decimal Precision:")

    add_custom_heading("3.10 Mongoose ODM Object Archive & Unstructured Payload Handling", level=2)
    add_p("The Mongoose model (models/ResendWebhookArchive.ts) archives raw external payloads received from the Resend webhook infrastructure:")

    add_code_block("""// models/ResendWebhookArchive.ts (Mongoose Object Archive Model)
import mongoose, { Schema, Document } from "mongoose";

export interface IResendWebhookArchive extends Document {
  providerEventId: string;
  providerMessageId?: string;
  eventType: string;
  rawBody: string;          // Unmutated raw string payload
  parsedPayload: Record<string, any>;
  processingStatus: "PROCESSED" | "DUPLICATE" | "FAILED";
  receivedAt: Date;
  createdAt: Date;
}

const ResendWebhookArchiveSchema = new Schema<IResendWebhookArchive>(
  {
    providerEventId: { type: String, required: true, unique: true, index: true },
    providerMessageId: { type: String, index: true },
    eventType: { type: String, required: true },
    rawBody: { type: String, required: true },
    parsedPayload: { type: Schema.Types.Mixed, required: true },
    processingStatus: { type: String, enum: ["PROCESSED", "DUPLICATE", "FAILED"], default: "PROCESSED" },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);""")

    add_custom_heading("3.11 Better Auth Session Infrastructure & Multi-Tenant Context", level=2)
    add_p("Better Auth provides session lifecycle management. Sessions are persisted in PostgreSQL session tables and bound to secure HTTP-only cookies. When a user authenticates, their active tenant membership and assigned role are retrieved to construct the authoritative security context.")
    
    add_p("Seeded Development Credentials (Local Testing):", bold_prefix="Local Demo Access: ")
    add_bullet(" admin@secureops.dev / SecureOps123! — Assigned ADMIN role in Apex Global Holdings and MEMBER role in Cyberdyne Systems Corp.", "Sarah Connor (Admin):")
    add_bullet(" member@secureops.dev / SecureOps123! — Assigned MEMBER role in Apex Global Holdings and ADMIN role in Stark Advanced Dynamics.", "Miles Dyson (Member):")
    add_bullet(" guest@secureops.dev / SecureOps123! — Assigned GUEST role in Apex Global Holdings (mutation-restricted).", "John Connor (Guest):")

    add_custom_heading("3.12 Role-Based Access Control (RBAC) Permission Matrix", level=2)
    add_p("SecureOps implements a granular permission matrix defined in lib/authorization/permissions.ts. The matrix dictates the exact capabilities of each role across tenant boundaries:")

    rbac_headers = ["Capability / Permission", "ADMIN Role", "MEMBER Role", "GUEST Role"]
    rbac_data = [
        ["View Tenant Transactions (`transaction:read`)", "GRANTED (Full)", "GRANTED (Tenant)", "GRANTED (Read-Only)"],
        ["Create New Transactions (`transaction:create`)", "GRANTED", "GRANTED", "DENIED (403 Forbidden)"],
        ["Update Transaction Status (`transaction:update`)", "GRANTED", "DENIED", "DENIED"],
        ["View Security Audit Logs (`audit:read`)", "GRANTED (Full Trail)", "DENIED (403 Forbidden)", "DENIED (403 Forbidden)"],
        ["Manage Tenant Membership (`tenant:manage`)", "GRANTED", "DENIED", "DENIED"],
    ]
    create_styled_table(rbac_headers, rbac_data, [2.8, 1.2, 1.2, 1.3])

    add_custom_heading("3.13 Multi-Tenant Boundary Isolation & Access Assertion", level=2)
    add_p("Multi-tenant boundary enforcement ensures that Tenant A users cannot access, mutate, or view Tenant B resources, even if valid transaction or audit log IDs are supplied. Every database query in lib/services/transaction-service.ts includes an explicit tenantId constraint:")

    add_code_block("""// Query level multi-tenant boundary constraint
const transaction = await prisma.transaction.findFirst({
  where: {
    id: transactionId,
    tenantId: tenantId, // Strict tenant isolation enforced!
  },
});""")

    add_custom_heading("3.14 Protected Route Handlers & Authoritative Server Actions", level=2)
    add_p("All mutations and API queries are protected by authoritative backend checks:")
    add_bullet(" Located at actions/transactions.ts. Validates active session -> asserts tenant membership -> checks 'transaction:create' permission -> executes Prisma ACID transaction -> triggers post-commit alert email.", "createTransactionAction (Server Action):")
    add_bullet(" Located at app/api/transactions/route.ts. Requires active session -> enforces tenant-scoped query -> returns JSON array of transactions.", "GET /api/transactions (Route Handler):")
    add_bullet(" Located at app/api/audit-logs/route.ts. Requires active session -> checks 'audit:read' permission (ADMIN only) -> returns structured audit trail.", "GET /api/audit-logs (Route Handler):")

    add_custom_heading("3.15 Transaction + Audit Log ACID Lifecycle Execution", level=2)
    add_p("When a transaction is created, data integrity demands that the financial record and its corresponding security audit log are written atomically. This is accomplished using Prisma's interactive $transaction API:")

    add_code_block("""// lib/services/transaction-service.ts (ACID Transaction + Audit Log)
return await prisma.$transaction(async (tx) => {
  const transaction = await tx.transaction.create({
    data: {
      tenantId: data.tenantId,
      createdByUserId: user.id,
      reference: generateReference(),
      amount: data.amount,
      currency: data.currency || "USD",
      status: "COMPLETED",
      description: data.description,
    },
  });

  await tx.auditLog.create({
    data: {
      tenantId: data.tenantId,
      actorUserId: user.id,
      action: "TRANSACTION_CREATED",
      entity: "Transaction",
      entityId: transaction.id,
      metadata: {
        reference: transaction.reference,
        amount: data.amount,
        currency: transaction.currency,
        recipientEmail: data.recipientEmail,
      },
    },
  });

  return transaction;
});""")

    add_custom_heading("3.16 Resend SDK & React Email Alert Pipeline", level=2)
    add_p("Transaction alert emails are formatted using React Email components (components/emails/TransactionAlertEmail.tsx), producing responsive, accessible HTML markup containing transaction reference numbers, formatted amounts, timestamps, and security notices.")
    
    add_p("Email delivery is orchestrated via Resend SDK (lib/services/email-service.ts). In production, the service transmits payloads to the Resend API. In local test environments without active API keys, the service safely falls back to mock delivery logging, recording the simulated providerMessageId without throwing unhandled exceptions.")

    add_custom_heading("3.17 Webhook Security: Svix Verification & Idempotency", level=2)
    add_p("Inbound webhook requests at app/api/webhooks/resend/route.ts must prove authenticity before processing. Svix cryptographic verification is executed against the raw text body:")

    add_code_block("""// app/api/webhooks/resend/route.ts (Svix Verification & Idempotency)
const rawBody = await request.text();
const svixHeaders = {
  "svix-id": request.headers.get("svix-id")!,
  "svix-timestamp": request.headers.get("svix-timestamp")!,
  "svix-signature": request.headers.get("svix-signature")!,
};

const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET || "whsec_mock");
const event = wh.verify(rawBody, svixHeaders) as ResendWebhookEvent;

// Check Idempotency via providerEventId unique constraint
const existing = await prisma.emailEvent.findUnique({
  where: { providerEventId: event.id },
});

if (existing) {
  return NextResponse.json({ status: "duplicate_ignored" }, { status: 200 });
}""")

    add_custom_heading("3.18 Email Event Provenance Tracking (SEED vs RESEND_WEBHOOK)", level=2)
    add_p("The EmailEvent model explicitly records the provenance source of each event via the EmailEventSource enum:")
    add_bullet(" Records generated during automated database initialization to establish historical test baselines.", "SEED Provenance:")
    add_bullet(" Records created dynamically via cryptographic inbound webhook delivery from the Resend email network.", "RESEND_WEBHOOK Provenance:")
    add_p("This distinction guarantees that synthetic fixture data is never confused with live delivery telemetry during security audits.")

    add_custom_heading("3.19 Testing & Verification (Vitest 6/6, E2E 15/15)", level=2)
    add_p("The SecureOps system was validated through rigorous automated test suites:")
    add_bullet(" 6/6 unit tests passed (tests/rbac-isolation.test.ts) validating ADMIN, MEMBER, and GUEST permission matrices, positive/negative monetary amounts, and malformed email validation.", "Vitest Test Suite:")
    add_bullet(" 15/15 end-to-end assertions passed (scripts/verify-e2e.ts) validating RBAC matrices, cross-tenant isolation (blocking Tenant A user access to Tenant B with 403 Forbidden), Zod runtime validation, and webhook idempotency deduplication.", "End-to-End Test Suite:")
    add_bullet(" Zero type errors across all API routes, server actions, services, and models.", "TypeScript Compiler:")

    add_custom_heading("3.20 Local Infrastructure & Docker Disclosure", level=2)
    add_p("Docker Disclosure: Docker containerization is utilized strictly as local development infrastructure to ensure consistent, reproducible execution of PostgreSQL 16 (port 5432) and MongoDB 7 (port 27017) via docker-compose.yml. Docker is not an official requirement of Assignment 2; it serves exclusively as local database hosting infrastructure.", italic=True)

    add_custom_heading("3.21 Assignment 2 Requirement Traceability Matrix", level=2)
    add_p("The traceability matrix below maps every official Assignment 2 requirement to its source implementation and verified outcome:")

    trace_a2_headers = ["Official Requirement", "Implementation Strategy", "Exact Source File(s)", "Status"]
    trace_a2_data = [
        ["Prisma Relational Schema", "Normalized 3NF schema (User, Tenant, Role, Tx, Audit)", "prisma/schema.prisma", "VERIFIED"],
        ["PostgreSQL Database", "ACID transactions, foreign-key constraints, decimal types", "prisma/schema.prisma", "VERIFIED"],
        ["Automated Faker.js Seed", "Deterministic seed generating 3 tenants, 23 users, 55 txs", "prisma/seed.ts", "VERIFIED"],
        ["Reset & Seed Pipeline", "Single-pass TypeScript CLI executing push and seed", "scripts/db-reset-seed.ts", "VERIFIED"],
        ["Better Auth Integration", "Prisma adapter, password credentials, session handling", "lib/auth.ts, app/api/auth/*", "VERIFIED"],
        ["Proxy / Middleware Gate", "Node.js early protection gate intercepting unauth requests", "proxy.ts, middleware.ts", "VERIFIED"],
        ["Multi-Tenant RBAC", "Granular ADMIN, MEMBER, GUEST roles & permissions", "lib/authorization/permissions.ts", "VERIFIED"],
        ["Cross-Tenant Isolation", "Strict tenant-bounded queries; cross-tenant blocked 403", "lib/authorization/tenant-access.ts", "VERIFIED"],
        ["Protected Server Actions", "createTransactionAction with session/RBAC assertions", "actions/transactions.ts", "VERIFIED"],
        ["Protected Route Handlers", "GET /api/transactions & /api/audit-logs with RBAC", "app/api/transactions/route.ts", "VERIFIED"],
        ["Transaction + Audit ACID", "Prisma $transaction writing Tx + AuditLog atomically", "lib/services/transaction-service.ts", "VERIFIED"],
        ["React Email & Resend", "TransactionAlertEmail template & post-commit dispatch", "components/emails/*, lib/services/*", "VERIFIED"],
        ["Svix Webhook Verification", "Cryptographic signature verification on raw request.text()", "app/api/webhooks/resend/route.ts", "VERIFIED"],
        ["Webhook Idempotency", "Deduplication check via unique providerEventId constraint", "app/api/webhooks/resend/route.ts", "VERIFIED"],
        ["Mongoose MongoDB (CO4)", "ResendWebhookArchive collection storing raw payloads", "lib/mongodb.ts, models/*", "VERIFIED"],
        ["Event Provenance", "Explicit SEED vs RESEND_WEBHOOK source tracking", "prisma/schema.prisma", "VERIFIED"],
    ]
    create_styled_table(trace_a2_headers, trace_a2_data, [1.5, 2.3, 1.8, 0.9])

    add_custom_heading("3.22 Assignment 2 Engineering Conclusion", level=2)
    add_p("Assignment 2 (SecureOps) successfully satisfies all deliverables for Course Outcomes CO3 and CO4. It implements an enterprise-ready architecture integrating normalized relational persistence, schema-less document archiving, automated data generation, robust multi-tenant authorization, and cryptographic webhook ingestion.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 4: COMPARATIVE ANALYSIS
    # -------------------------------------------------------------
    add_custom_heading("4. Comparative Technical Analysis & Synthesis", level=1)
    
    add_custom_heading("4.1 Assignment 1 vs Assignment 2 Architectural Comparison", level=2)
    add_p("The table below provides a side-by-side comparative analysis of the architectural patterns, state boundaries, security paradigms, and operational focuses across both assignments:")

    comp_headers = ["Technical Dimension", "Assignment 1 (ShopFlow)", "Assignment 2 (SecureOps)"]
    comp_data = [
        ["Primary Architectural Focus", "Frontend component architecture, RSC boundaries, client hydration, and Core Web Vitals.", "Backend enterprise security, multi-tenant RBAC, dual-database persistence, and webhook pipelines."],
        ["State Management Tier", "Client-Side: Zustand v5 with localStorage persistence and selective slice subscriptions.", "Server/Database-Side: PostgreSQL (Prisma ACID transactions) and MongoDB (Mongoose archive)."],
        ["Data Validation Paradigm", "Shared Zod schema (checkoutFormSchema) linking React Hook Form to Next.js Server Actions.", "Multi-tiered validation: Zod payload validation + Better Auth sessions + RBAC permission assertions."],
        ["Database Infrastructure", "None required; localized in-memory typed product catalog with simulated network latency.", "Dual-Database: PostgreSQL 16 (Normalized Relational) + MongoDB 7 (Object Document Storage)."],
        ["Authentication & Security", "Client-side theme and cart isolation; zero-API public mutation flow.", "Enterprise Better Auth session validation, proxy/middleware gates, and multi-tenant RBAC enforcement."],
        ["Server Actions Role", "Form submission, string sanitization, and structured client feedback.", "Protected transactional mutation executing Prisma $transaction and post-commit email dispatch."],
        ["Notification Mechanism", "Accessible client toast notifications via Sonner.", "Transactional email templates via React Email and Resend SDK, plus inbound Svix webhooks."],
        ["Performance Metrics", "Lighthouse Core Web Vitals: LCP (0.6s), CLS (0), TBT (0ms), Performance (100/100).", "Database indexing, ACID transaction throughput, and Svix signature verification latency."],
    ]
    create_styled_table(comp_headers, comp_data, [1.5, 2.5, 2.5])

    add_custom_heading("4.2 Client State vs Server/Relational State Handling", level=2)
    add_p("A fundamental distinction demonstrated across the coursework is the separation between transient client interaction state and authoritative server state:")
    add_bullet(" Ideal for immediate UI feedback (e.g. cart badge counters, open/closed sheet drawers, theme selection). Zustand provides synchronous state mutations without network roundtrips, utilizing selective selectors to prevent parent re-renders.", "Client State (ShopFlow):")
    add_bullet(" Mandatory for multi-tenant business entities, financial transactions, and immutable audit logs. Relational state requires ACID guarantees, unique constraints, foreign-key relationships, and authoritative server-side ownership.", "Server/Relational State (SecureOps):")

    add_custom_heading("4.3 React Server Components vs Protected Backend Services", level=2)
    add_p("ShopFlow demonstrates how React Server Components eliminate client bundle bloat by executing purely on the server and streaming RSC Payloads. SecureOps extends this server execution model to protected backend service layers (TransactionService, EmailService, AuditService), demonstrating how server-side business logic interacts securely with database clients without exposing connection strings or secret keys to the browser.")

    add_custom_heading("4.4 Frontend Validation vs Backend Authoritative Enforcement", level=2)
    add_p("In ShopFlow, Zod acts as a shared validation contract providing inline client error messages and server-side parsing. In SecureOps, validation is layered with defense-in-depth security: client inputs are validated via Zod, but execution is blocked unless the caller passes cryptographic session checks, tenant membership bounds, and role clearance assertions.")

    add_custom_heading("4.5 Unified Full-Stack Next.js Paradigm Synthesis", level=2)
    add_p("Together, Assignment 1 and Assignment 2 demonstrate the full spectrum of Next.js full-stack capabilities. From the presentation layer (Swiss minimalist Bento UI, accessible Radix primitives, streaming Suspense) to the data and security layers (Better Auth, Prisma ACID transactions, MongoDB object archiving, and Svix webhooks), the two projects showcase a cohesive, production-ready full-stack software engineering methodology.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 5: FINAL CONCLUSION
    # -------------------------------------------------------------
    add_custom_heading("5. Final Document Conclusion", level=1)
    
    add_p("This combined academic report has presented a comprehensive architectural, engineering, and empirical review of Assignment 1 (ShopFlow) and Assignment 2 (SecureOps) for the Fullstack Development with NextJs (DJS23AMD302) coursework.")
    
    add_p("Key Conclusions & Verified Outcomes:", bold_prefix="Summary of Findings: ")
    add_bullet(" Successfully proved that React Server Components can render complete product catalogs server-side while isolating client interactivity to small, serializable leaves (ThemeToggle, CartButton, AddToCartButton). Achieved perfect 100/100 Lighthouse Performance and SEO scores with a measured LCP of 0.6s and 0.0 CLS.", "Assignment 1 (ShopFlow):")
    add_bullet(" Successfully implemented an enterprise-grade multi-tenant architecture with Better Auth, PostgreSQL (Prisma ORM), MongoDB (Mongoose), and Resend. Verified 100% test passage across Vitest (6/6) and E2E isolation suites (15/15), confirming zero cross-tenant leakage and robust webhook idempotency.", "Assignment 2 (SecureOps):")
    add_bullet(" Both projects are independently organized in the GitHub repository (https://github.com/yashpoojari8706/FST-Assignment-1-and-2), fully type-checked with 0 errors, and completely documented with requirement traceability matrices.", "Repository Integrity:")

    doc.add_page_break()

    # -------------------------------------------------------------
    # SECTION 6: APPENDICES
    # -------------------------------------------------------------
    add_custom_heading("6. Technical Appendices", level=1)
    
    add_custom_heading("Appendix A: Assignment 1 Verified Screenshots & UI Evidence", level=2)
    add_p("The following figures represent actual visual evidence captured during automated browser subagent verification on the production build of ShopFlow (http://localhost:3000):")

    brain_dir = r"C:\Users\yashl\.gemini\antigravity-ide\brain\7546f11b-3304-4370-9717-8a009f674dcd"
    
    screenshot_files = [
        ("bento_hero_section_1789887935333.png", "Figure A1.1: ShopFlow Swiss-Tech Bento Grid Hero Section with Live Telemetry Panel"),
        ("bento_product_grid_1789887953662.png", "Figure A1.2: ShopFlow Server-Rendered Product Catalog Grid with Client Add-to-Cart Leaves"),
        ("dark_theme_1789884799082.png", "Figure A1.3: ShopFlow Dark Mode Theme Activation with Zero Layout Shift"),
        ("order_confirmation_1789885600512.png", "Figure A1.4: ShopFlow End-to-End Server Action Order Confirmation (ORD-MU9FMBWM-DUE4)"),
    ]

    for fname, caption in screenshot_files:
        fpath = os.path.join(brain_dir, fname)
        if os.path.exists(fpath):
            try:
                doc.add_paragraph().paragraph_format.space_before = Pt(6)
                p_img = doc.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.paragraph_format.space_after = Pt(4)
                doc.inline_shapes.add_picture = doc.add_picture(fpath, width=Inches(5.8))
                
                p_cap = doc.add_paragraph()
                p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_cap.paragraph_format.space_after = Pt(12)
                r_cap = p_cap.add_run(caption)
                r_cap.font.name = 'Calibri'
                r_cap.font.size = Pt(9.5)
                r_cap.italic = True
                r_cap.font.color.rgb = COLOR_SECONDARY
            except Exception as e:
                add_p(f"[{caption} — Image asset present at {fname}]")
        else:
            add_p(f"[{caption} — Evidence recorded in test walkthrough; image path {fname}]")

    add_custom_heading("Appendix B: Assignment 2 Architecture & Sequence Diagrams", level=2)
    add_p("Figure A2.1: Multi-Tenant RBAC Authentication & Transaction Notification Sequence Diagram", bold_prefix="Architecture Flow: ")
    
    add_code_block("""
CLIENT                    PROXY (proxy.ts)        ROUTE / ACTION         BETTER AUTH / RBAC       POSTGRESQL (Prisma)      RESEND / MONGO
  │                              │                      │                         │                       │                     │
  │── 1. Request /dashboard ────>│                      │                         │                       │                     │
  │                              │── 2. Check Cookie ──>│                         │                       │                     │
  │                              │                      │── 3. getSession() ─────>│                       │                     │
  │                              │                      │<── 4. User Context ─────│                       │                     │
  │                              │                      │                         │                       │                     │
  │── 5. Create Transaction ───────────────────────────>│                         │                       │                     │
  │                              │                      │── 6. Assert RBAC ──────>│                       │                     │
  │                              │                      │                         │── 7. Verify Role ────>│                     │
  │                              │                      │<── 8. Access OK ────────│                       │                     │
  │                              │                      │                                                 │                     │
  │                              │                      │── 9. BEGIN $transaction ───────────────────────>│                     │
  │                              │                      │      • INSERT INTO "transaction"                │                     │
  │                              │                      │      • INSERT INTO "audit_log"                  │                     │
  │                              │                      │<── 10. COMMIT (ACID Guaranteed) ────────────────│                     │
  │                              │                      │                                                 │                     │
  │                              │                      │── 11. Dispatch Transaction Alert Email ──────────────────────────────>│
  │<── 12. Return Structured Order Confirmation ────────│                                                                       │
  │                              │                      │                                                                       │
  │                              │                      │<── 13. Inbound Delivery Webhook (/api/webhooks/resend) ───────────────│
  │                              │                      │── 14. Verify Svix Signature on raw request.text()                     │
  │                              │                      │── 15. Check providerEventId (Deduplicate) ─────>│                     │
  │                              │                      │── 16. Write EmailEvent ────────────────────────>│                     │
  │                              │                      │── 17. Upsert ResendWebhookArchive ───────────────────────────────────>│
""")

    add_custom_heading("Appendix C: Terminal Verification Logs & Build Outputs", level=2)
    add_p("Figure A3.1: Actual Terminal Output from Assignment 1 Production Build & Lighthouse Audit", bold_prefix="Terminal Evidence: ")
    
    add_code_block("""$ cd fst-assignment-1 && npm run typecheck && npm run build
> shopflow@1.0.0 typecheck
> tsc --noEmit

> shopflow@1.0.0 build
> next build
▲ Next.js 16.3.5 (Turbopack)
✓ Running next.config.ts took 39ms
  Creating an optimized production build ...
✓ Compiled successfully in 11.0s
  Running TypeScript ...
  Finished TypeScript in 3.4s ...
  Generating static pages using 6 workers (5/5) in 1023ms
Route (app)
┌ ○ /
├ ○ /_not-found
└ ○ /checkout
○  (Static)  prerendered as static content

$ npx lighthouse http://localhost:3000 --output=json --preset=desktop
Scores: { performance: 100, accessibility: 90, bestPractices: 96, seo: 100 }
Audits: { LCP: '0.6 s', CLS: '0', FCP: '0.4 s', TBT: '0 ms', SpeedIndex: '0.4 s' }""")

    add_custom_heading("Appendix D: Relational Database Models & Seeding Output Evidence", level=2)
    add_p("Figure A4.1: Actual Terminal Output from Assignment 2 Database Reset & Automated Faker Seeding", bold_prefix="Database Evidence: ")
    
    add_code_block("""$ cd fst-assignment-2 && npm run db:reset-seed
==================================================
  SecureOps Relational Database Seeding Pipeline  
==================================================
[1/6] Seeding RBAC Roles (ADMIN, MEMBER, GUEST)...
[2/6] Seeding Multi-Tenant Organizations...
[3/6] Seeding Better Auth Deterministic Demo Accounts (Password: SecureOps123!)...
[4/6] Seeding Multi-Tenant Memberships & Roles...
[5/6] Generating 20 localized Faker users, memberships, and tenant distributions...
[6/6] Generating 50+ Relational Transactions, Audit Logs, and Email Events...

==================================================
           SEEDING COMPLETED SUCCESSFULLY         
==================================================
✓ Roles Seeded:        3
✓ Tenants Seeded:      3
✓ Users Seeded:        23
✓ Memberships Seeded:  28
✓ Transactions Seeded: 55
✓ Audit Logs Seeded:   55
✓ Email Events Seeded: 28
==================================================
Demo Credentials:
  Admin:  admin@secureops.dev  / SecureOps123!
  Member: member@secureops.dev / SecureOps123!
  Guest:  guest@secureops.dev  / SecureOps123!
==================================================""")

    add_custom_heading("Appendix E: Automated Test Suite Output (Vitest & E2E)", level=2)
    add_p("Figure A5.1: Actual Terminal Output from Vitest Unit Suite and E2E Verification Suites", bold_prefix="Test Suite Evidence: ")
    
    add_code_block("""$ cd fst-assignment-2 && npx vitest run
 RUN  v3.2.7 D:/SCIENCE/DJS AIML/SEM 5/FST/fst-assignment-2
 ✓ tests/rbac-isolation.test.ts (6 tests) 7ms
 Test Files  1 passed (1)
      Tests  6 passed (6)
   Duration  7.40s

$ cd fst-assignment-2 && npx tsx scripts/verify-e2e.ts
==========================================================
  SecureOps Comprehensive System Verification (CO3 & CO4) 
==========================================================
[TEST GROUP 1] Role-Based Access Control (RBAC)
  ✓ PASS: Admin can create transactions
  ✓ PASS: Admin can inspect security audit logs
  ✓ PASS: Admin can manage tenant operations
  ✓ PASS: Member can create transactions
  ✓ PASS: Member CANNOT inspect security audit logs
  ✓ PASS: Guest CANNOT create transactions (mutation denied)
  ✓ PASS: Guest can view permitted read-only metrics

[TEST GROUP 2] Multi-Tenant Boundary Isolation
  ✓ PASS: User 1 access to own Tenant A is permitted
  ✓ PASS: User 1 cross-tenant attempt to access Tenant B is blocked with 403 Forbidden
  ✓ PASS: User 2 cross-tenant attempt to access Tenant A is blocked

[TEST GROUP 3] Runtime Input Validation (Zod)
  ✓ PASS: Valid transaction payload passes schema validation
  ✓ PASS: Negative transaction amount rejected by runtime validation
  ✓ PASS: Malformed email address rejected by runtime validation

[TEST GROUP 4] Resend Webhook Idempotency & Dual Persistence Model
  ✓ PASS: Initial webhook event persisted to PostgreSQL & MongoDB
  ✓ PASS: Duplicate webhook event safely deduplicated via providerEventId
==========================================================
  VERIFICATION RESULTS: 15 Passed, 0 Failed
=========================================================""")

    # Save final document
    output_path = "Assignment_1_and_2_Combined_Report.docx"
    doc.save(output_path)
    print(f"Document created successfully: {output_path}")

if __name__ == "__main__":
    create_report()
