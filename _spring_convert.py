#!/usr/bin/env python3
"""Comprehensive spring theme conversion — CSS, JS, and all HTML files."""
import os

DIR = os.path.dirname(os.path.abspath(__file__))

def replace_in(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"  SKIP: {os.path.basename(filepath)} not found")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  DONE: {os.path.basename(filepath)} ({count} replacements)")

# ============================================================
# 1. drivers.css
# ============================================================
print("=== drivers.css ===")
replace_in(os.path.join(DIR, "drivers.css"), [
    # Root vars
    ("--bg: #0B1220;", "--bg: #FBF7EF;"),
    ("--surface: rgba(255, 255, 255, 0.06);", "--surface: rgba(255, 255, 255, 0.88);"),
    ("--text: rgba(232, 238, 246, 0.92);", "--text: rgba(7, 43, 51, 0.92);"),
    ("--muted: rgba(169, 183, 198, 0.72);", "--muted: rgba(7, 43, 51, 0.55);"),
    ("--accent: #2DD4BF;", "--accent: #1AA7A1;"),
    ("--cream: #F5F7FB;", "--cream: #FBF7EF;"),
    ("--border: rgba(255, 255, 255, 0.12);", "--border: rgba(7, 43, 51, 0.14);"),
    ("--navy: #0B1220;", "--navy: #072B33;"),
    ("--navy-2: #0B1F3B;", "--navy-2: #072B33;"),
    ("--primary: #2E6EF7;", "--primary: #1AA7A1;"),
    ("--shadow-soft: 0 10px 28px rgba(0,0,0,0.28);", "--shadow-soft: 0 10px 28px rgba(7,43,51,0.08);"),
    ("--shadow-card: 0 18px 40px rgba(0,0,0,0.35);", "--shadow-card: 0 18px 40px rgba(7,43,51,0.10);"),
    ("--focus: rgba(45,212,191,0.35);", "--focus: rgba(26,167,161,0.35);"),
    # Select dark scheme
    ("  color-scheme: dark;", "  color-scheme: light;"),
    ("  background: #1e293b;", "  background: #fff;"),
    ("  color: #fff;", "  color: #072B33;"),
    # hr
    ("border-top: 1px solid rgba(255,255,255,0.10);", "border-top: 1px solid rgba(7,43,51,0.10);"),
    # Header
    ("background: rgba(11, 31, 59, 0.92) !important;", "background: rgba(251, 247, 239, 0.92) !important;"),
    ("border-bottom: 1px solid rgba(255,255,255,0.12);", "border-bottom: 1px solid rgba(7,43,51,0.08);"),
    # Chip
    ("background: rgba(255,255,255,0.05);", "background: rgba(7, 43, 51, 0.04);"),
    ("border: 1px solid rgba(255,255,255,0.12);", "border: 1px solid rgba(7, 43, 51, 0.12);"),
    ("color: rgba(255,255,255,0.80);", "color: rgba(7, 43, 51, 0.75);"),
    ("background: rgba(255,255,255,0.07);", "background: rgba(7, 43, 51, 0.06);"),
    ("border-color: rgba(255,255,255,0.20);", "border-color: rgba(7, 43, 51, 0.18);"),
    # QR box
    ("border: 1px solid rgba(255,255,255,0.12);", "border: 1px solid rgba(7, 43, 51, 0.12);"),
    ("background: rgba(255,255,255,0.04);", "background: rgba(255, 255, 255, 0.60);"),
    ("box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06);",
     "box-shadow: 0 8px 24px rgba(7,43,51,0.08), 0 0 0 1px rgba(7,43,51,0.06);"),
])

# ============================================================
# 2. effects.css
# ============================================================
print("=== effects.css ===")
replace_in(os.path.join(DIR, "assets", "effects.css"), [
    # Root fx vars
    ("--fx-ring: rgba(45, 212, 191, 0.35);", "--fx-ring: rgba(26, 167, 161, 0.35);"),
    ("--fx-toast-bg: rgba(11, 31, 59, 0.94);", "--fx-toast-bg: rgba(7, 43, 51, 0.92);"),
    ("--fx-toast-border: rgba(45, 212, 191, 0.3);", "--fx-toast-border: rgba(26, 167, 161, 0.3);"),
    ("--fx-progress-fill: #2DD4BF;", "--fx-progress-fill: #1AA7A1;"),
    ("--fx-skeleton-from: rgba(255, 255, 255, 0.04);", "--fx-skeleton-from: rgba(7, 43, 51, 0.04);"),
    ("--fx-skeleton-to: rgba(255, 255, 255, 0.10);", "--fx-skeleton-to: rgba(7, 43, 51, 0.08);"),
    ("--fx-scroll-hint-color: rgba(255, 255, 255, 0.40);", "--fx-scroll-hint-color: rgba(7, 43, 51, 0.35);"),
    ("--fx-progress-bg: rgba(255, 255, 255, 0.08);", "--fx-progress-bg: rgba(7, 43, 51, 0.06);"),
    # Body glow blobs -> spring sakura+teal
    ("radial-gradient(circle at 30% 30%, rgba(45,212,191,0.20), transparent 60%),",
     "radial-gradient(circle at 30% 30%, rgba(246,184,208,0.18), transparent 60%),"),
    ("radial-gradient(circle at 70% 70%, rgba(11,18,32,0.92), transparent 65%);",
     "radial-gradient(circle at 70% 70%, rgba(26,167,161,0.08), transparent 65%);"),
    ("radial-gradient(circle at 20% 80%, rgba(245,158,11,0.14), transparent 60%),",
     "radial-gradient(circle at 20% 80%, rgba(246,184,208,0.12), transparent 60%),"),
    ("radial-gradient(circle at 80% 20%, rgba(11,31,59,0.92), transparent 70%);",
     "radial-gradient(circle at 80% 20%, rgba(26,167,161,0.06), transparent 70%);"),
    # Toast text color
    ("color: #86efac;", "color: #16a34a;"),
    # Fixed CTA
    ("background: rgba(11, 31, 59, 0.92);", "background: rgba(7, 43, 51, 0.92);"),
    ("border: 1px solid rgba(255,255,255,0.12);", "border: 1px solid rgba(26, 167, 161, 0.25);"),
    ("color: rgba(255,255,255,0.88);", "color: rgba(255, 255, 255, 0.92);"),
    ("box-shadow: 0 8px 24px rgba(0,0,0,0.35);", "box-shadow: 0 8px 24px rgba(7,43,51,0.15);"),
    # CTA close button
    ("color: rgba(255,255,255,0.5);", "color: rgba(255,255,255,0.5);"),  # keep
    # Error text
    ("color: #fca5a5;", "color: #dc2626;"),
    # Header shadow
    ("box-shadow: 0 2px 12px rgba(0,0,0,0.25);", "box-shadow: 0 2px 12px rgba(7,43,51,0.08);"),
    # Spinner border
    ("border: 2px solid rgba(0,0,0,0.15);", "border: 2px solid rgba(7,43,51,0.12);"),
    # Toast shadow
    ("box-shadow: 0 8px 32px rgba(0,0,0,0.4);", "box-shadow: 0 8px 32px rgba(7,43,51,0.15);"),
])

# ============================================================
# 3. transition.js
# ============================================================
print("=== transition.js ===")
replace_in(os.path.join(DIR, "assets", "transition.js"), [
    # fallback bg color
    ('getCssVar("--bg", "#0B1220")', 'getCssVar("--bg", "#FBF7EF")'),
    # submit overlay — dark glass to light frost
    ("background:rgba(0,0,0,0.58);backdrop-filter:blur(8px);",
     "background:rgba(251,247,239,0.72);backdrop-filter:blur(12px);"),
    ("border:1px solid rgba(255,255,255,0.12);background:rgba(11,31,59,0.92);box-shadow:0 18px 40px rgba(0,0,0,0.45);",
     "border:1px solid rgba(7,43,51,0.10);background:rgba(255,255,255,0.95);box-shadow:0 18px 40px rgba(7,43,51,0.10);"),
    ("border:2px solid rgba(255,255,255,0.25);border-top-color:#2DD4BF;",
     "border:2px solid rgba(7,43,51,0.15);border-top-color:#1AA7A1;"),
    ("color:rgba(255,255,255,0.94);", "color:rgba(7,43,51,0.92);"),
    ("color:rgba(255,255,255,0.78);", "color:rgba(7,43,51,0.65);"),
    ("color:rgba(255,255,255,0.70);", "color:rgba(7,43,51,0.55);"),
])

# ============================================================
# 4. ALL HTML files
# ============================================================
HTML_FILES = [
    "index.html", "consult.html", "startup.html", "vehicle.html",
    "register.html", "main-register.html", "full-register.html",
    "privacy.html", "terms.html", "thankyou.html",
    "start.html", "request.html", "drivers.html", "theme-preview.html",
]

HTML_REPLACEMENTS = [
    # 1. Critical CSS
    ("background:#0f1915!important;color:rgba(255,255,255,0.88)!important",
     "background:#FBF7EF!important;color:rgba(7,43,51,0.92)!important"),
    ("background:#0B1220!important;color:rgba(232,238,246,0.92)!important",
     "background:#FBF7EF!important;color:rgba(7,43,51,0.92)!important"),

    # 2. Tailwind config colors — old green theme variant
    ("deep: '#0f1915'", "deep: '#072B33'"),
    ("muted: 'rgba(255,255,255,0.60)'", "muted: 'rgba(7,43,51,0.55)'"),
    ("cream: '#f3eadf'", "cream: '#FBF7EF'"),
    ("accent: '#7aa07a'", "accent: '#1AA7A1', sakura: '#F6B8D0'"),
    ("surface: 'rgba(255,255,255,0.06)'", "surface: 'rgba(255,255,255,0.88)'"),
    ("borderc: 'rgba(255,255,255,0.10)'", "borderc: 'rgba(7,43,51,0.14)'"),

    # 2b. Tailwind config colors — navy theme variant
    ("deep: '#0B1220'", "deep: '#072B33'"),
    ("muted: 'rgba(169,183,198,0.72)'", "muted: 'rgba(7,43,51,0.55)'"),
    ("cream: '#F5F7FB'", "cream: '#FBF7EF'"),
    ("accent: '#2DD4BF'", "accent: '#1AA7A1', sakura: '#F6B8D0'"),

    # 3. Body class
    ("bg-deep text-white min-h-screen", "bg-cream text-deep min-h-screen"),
    ("bg-deep text-[#F3EBDD] min-h-screen", "bg-cream text-deep min-h-screen"),

    # 4. Header bg
    ("bg-deep/80 backdrop-blur-xl border-b border-white/5",
     "bg-cream/90 backdrop-blur-xl border-b border-deep/8"),

    # 5. Region badge
    ('bg-white/5 border border-white/10 rounded-full" aria-label=',
     'bg-deep/5 border border-deep/10 rounded-full" aria-label='),
    ('text-white/80" id="regionEn"', 'text-deep/80" id="regionEn"'),
    ('text-white/50" id="regionJa"', 'text-deep/50" id="regionJa"'),

    # 6. Logo icon gradient — old green
    ("from-[#2b3a2f] to-accent flex items-center justify-center shadow-lg shadow-emerald-900/30",
     "from-accent/30 to-accent flex items-center justify-center shadow-lg shadow-accent/15"),
    # 6b. Logo icon gradient — navy
    ("from-[#0B1F3B] to-accent flex items-center justify-center shadow-lg shadow-teal-900/30",
     "from-accent/30 to-accent flex items-center justify-center shadow-lg shadow-accent/15"),

    # 7. Company name size
    ('class="text-sm font-black tracking-wide leading-none" id="companyName"',
     'class="text-base font-black tracking-wide leading-none" id="companyName"'),
    # 7b. thankyou variant
    ('class="text-sm font-black tracking-wide">',
     'class="text-base font-black tracking-wide">'),

    # 8. Contact hover
    ('hover:text-white transition-colors" target="_blank"',
     'hover:text-deep transition-colors" target="_blank"'),
    ('<span class="text-white/20">', '<span class="text-deep/20">'),
    ('hover:text-white transition-colors">takeshimonoseki',
     'hover:text-deep transition-colors">takeshimonoseki'),

    # 9. Nav links
    ("text-muted hover:text-white hover:bg-white/5 transition-colors",
     "text-muted hover:text-deep hover:bg-deep/5 transition-colors"),

    # 10. Active nav pill
    ("bg-cream text-[#151a16] shadow-lg shadow-white/10",
     "bg-deep text-cream shadow-lg shadow-deep/10"),
    # 10b. navy nav pill
    ("bg-cream text-deep shadow-lg shadow-white/10",
     "bg-deep text-cream shadow-lg shadow-deep/10"),

    # 11. Menu toggle
    ("text-white bg-white/10 rounded-full hover:bg-white/20",
     "text-deep bg-deep/5 rounded-full hover:bg-deep/10"),

    # 12. Glass-card glow
    ("from-green-600/15", "from-sakura/15"),
    ("from-blue-600/10", "from-sakura/15"),
    ("from-teal-600/15", "from-sakura/15"),
    ("from-indigo-600/10", "from-sakura/15"),

    # 13. Form inputs
    ("bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30",
     "bg-white/80 border border-deep/12 rounded-xl p-3 text-deep focus:outline-none focus:border-accent/40"),
    ("bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30",
     "bg-white/80 border border-deep/12 rounded-xl p-4 text-deep focus:outline-none focus:border-accent/40"),

    # 14. Consult textarea
    ("bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20",
     "bg-white/80 border border-deep/12 rounded-xl p-4 text-sm text-deep placeholder-deep/25 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"),

    # 15. Bold text
    ('<b class="text-sm text-white">', '<b class="text-sm text-deep">'),
    ('<strong class="text-white">', '<strong class="text-deep">'),

    # 16. Glass cards
    ("border border-white/10 bg-white/[0.03]", "border border-deep/10 bg-white/60"),
    ("border border-white/10 bg-white/[0.02]", "border border-deep/10 bg-white/50"),
    ("bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] hover:border-white/20",
     "bg-white/60 cursor-pointer hover:bg-white/80 hover:border-deep/20"),
    ("border border-white/10 bg-white/5", "border border-deep/10 bg-white/50"),

    # 17. Step indicators
    ('bg-white/5 border border-white/10 flex items-center justify-center text-[11px]',
     'bg-deep/5 border border-deep/10 flex items-center justify-center text-[11px]'),

    # 18. Back link
    ("border border-white/10 rounded-full text-sm font-bold text-muted hover:text-white hover:bg-white/5",
     "border border-deep/10 rounded-full text-sm font-bold text-muted hover:text-deep hover:bg-deep/5"),

    # 19. Dashed border
    ("border-dashed border-white/10", "border-dashed border-deep/10"),

    # 20. Fieldset border
    ("border border-white/10 rounded-xl p-4", "border border-deep/10 rounded-xl p-4"),

    # 21. Placeholder
    ("placeholder-white/30", "placeholder-deep/25"),

    # 22. Receipt/mono text
    ('font-mono text-white">', 'font-mono text-deep">'),

    # 23. Icon boxes
    ("bg-white/10 border border-white/10 flex items-center justify-center",
     "bg-deep/5 border border-deep/10 flex items-center justify-center"),

    # 24. Footer borders
    ("border-t border-white/5", "border-t border-deep/8"),
    ("decoration-white/20 hover:decoration-white/50", "decoration-deep/20 hover:decoration-deep/50"),

    # 25. Button styles — white bg
    ("bg-white text-black font-bold", "bg-deep text-cream font-bold"),

    # 26. register.html specific — field-input inline styles
    ("background: rgba(255,255,255,0.03);", "background: rgba(255,255,255,0.80);"),
    ("border: 1px solid rgba(255,255,255,0.1);", "border: 1px solid rgba(7,43,51,0.14);"),
    ("color: white;", "color: #072B33;"),
    ("border-color: rgba(152,183,137,0.6);", "border-color: rgba(26,167,161,0.5);"),
    ("box-shadow: 0 0 0 3px rgba(152,183,137,0.12);", "box-shadow: 0 0 0 3px rgba(26,167,161,0.12);"),
    ("color: rgba(255,255,255,0.25);", "color: rgba(7,43,51,0.25);"),
    ("background: #1e293b; color: white;", "background: #fff; color: #072B33;"),
    ("hover { background: rgba(255,255,255,0.06);", "hover { background: rgba(255,255,255,0.90);"),
    ("border-color: rgba(152,183,137,0.6); background: rgba(152,183,137,0.07);",
     "border-color: rgba(26,167,161,0.5); background: rgba(26,167,161,0.06);"),
    ("accent-color: #98b789;", "accent-color: #1AA7A1;"),
    ("background: #1e293b;", "background: #fff;"),

    # 27. Error/success banner colors
    ("color: #fca5a5;", "color: #b91c1c;"),
    ("color: #f87171;", "color: #dc2626;"),
    ("color: #86efac;", "color: #166534;"),
    ("color: #4ade80;", "color: #16a34a;"),

    # 28. Terms box
    ("background: rgba(255,255,255,0.02);", "background: rgba(255,255,255,0.50);"),
    ("color: rgba(255,255,255,0.6);", "color: rgba(7,43,51,0.55);"),
    ("color: rgba(255,255,255,0.4);", "color: rgba(7,43,51,0.40);"),
    ("color: #98b789;", "color: #1AA7A1;"),

    # 29. Summary list
    ("border-bottom: 1px solid rgba(255,255,255,0.05);", "border-bottom: 1px solid rgba(7,43,51,0.08);"),
    ("color: rgba(255,255,255,0.7);", "color: rgba(7,43,51,0.65);"),

    # 30. Remaining text-white
    ("text-white/30", "text-deep/30"),
    ("text-white/40", "text-deep/40"),
    ("text-white/45", "text-deep/40"),
    ("text-white/50", "text-deep/40"),
    ("text-white/60", "text-deep/50"),
    ("text-white/70", "text-deep/60"),
    ("text-white/80", "text-deep/70"),

    # 31. bg-white
    ("bg-white/[0.01]", "bg-white/40"),
    ("bg-white/[0.02]", "bg-white/50"),
    ("bg-white/[0.03]", "bg-white/60"),
    ("bg-white/[0.06]", "bg-white/70"),

    # 32. hover text-white
    ("hover:text-white/60", "hover:text-deep/60"),
    ("hover:text-white", "hover:text-deep"),
    ("hover:bg-white/10", "hover:bg-deep/8"),

    # 33. shadow-white
    ("shadow-white/10", "shadow-deep/10"),
    ("shadow-white/20", "shadow-deep/20"),

    # 34. accent-color inline
    ('style="accent-color:#98b789"', 'style="accent-color:#1AA7A1"'),

    # 35. Gradient heading
    ("bg-gradient-to-b from-white to-white/60", "bg-gradient-to-b from-deep to-deep/60"),

    # 36. Reset button
    ("bg-white/5 text-white/80", "bg-deep/5 text-deep/70"),

    # 37. has-checked sky border
    ("has-[:checked]:border-sky-500/50 has-[:checked]:bg-sky-500/5",
     "has-[:checked]:border-accent/50 has-[:checked]:bg-accent/5"),
    ("accent-sky-400", "accent-[#1AA7A1]"),

    # 38. Focus ring sky
    ("focus:border-sky-500/50 focus:ring-sky-500/20", "focus:border-accent/50 focus:ring-accent/20"),

    # 39. Remaining border-white references
    ("border-white/10", "border-deep/10"),
    ("border-white/5", "border-deep/8"),
    ("border-white/20", "border-deep/15"),

    # 40. select option
    ('select.field-input option { background: #1e293b; color: white; }',
     'select.field-input option { background: #fff; color: #072B33; }'),
    ('select.field-input option { background: #1e293b; color: #072B33; }',
     'select.field-input option { background: #fff; color: #072B33; }'),
]

print()
print("=== HTML files ===")
for fname in HTML_FILES:
    fpath = os.path.join(DIR, fname)
    replace_in(fpath, HTML_REPLACEMENTS)

print()
print("ALL DONE!")
