# تولید دوبارهٔ آیکون و اسپلش (اختیاری): python3 scripts/make_assets.py  — نیازمند playwright
import asyncio, os
from playwright.async_api import async_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = '<path d="M8 6h32"/><circle cx="24" cy="15" r="3.2"/><path d="M16 6l6 11M32 6l-6 11M24 20v14M24 34l-3.5 10M24 34l3.5 10"/>'
def svg(size, scale, color, bg=None, sw=3):
    s = size * scale; o = (size - s) / 2
    back = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{back}<g transform="translate({o} {o}) scale({s/48})" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{G}</g></svg>'
def splash(bg, fg, txt):
    f = os.path.join(R, 'www/fonts/Waw-Black.ttf')
    return f'''<html><head><style>@font-face{{font-family:W;src:url('file://{f}')}}html,body{{margin:0}}body{{width:2732px;height:2732px;background:{bg};display:grid;place-items:center}}
    .c{{display:grid;justify-items:center;gap:60px}}b{{font:900 190px W;color:{txt};direction:rtl}}</style></head><body><div class="c">{svg(760,1,fg,None,2.6)}<b>کلیستنیکس</b></div></body></html>'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1024, 'height': 1024})
        for name, content, w in [
            ('icon-only', svg(1024, .62, '#0d1404', '#c9f53b', 3), 1024),
            ('icon-foreground', svg(1024, .5, '#0d1404', None, 3.2), 1024),
            ('icon-background', '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#c9f53b"/></svg>', 1024)]:
            await pg.set_viewport_size({'width': w, 'height': w}); await pg.set_content(f'<body style="margin:0;background:transparent">{content}</body>')
            await pg.screenshot(path=f'{R}/assets/{name}.png', omit_background=True)
        await pg.set_viewport_size({'width': 2732, 'height': 2732})
        for name, bg, fg, tx in [('splash', '#f2f3ec', '#2f6f06', '#141a0c'), ('splash-dark', '#090b0e', '#c9f53b', '#eef1f5')]:
            await pg.set_content(splash(bg, fg, tx)); await pg.wait_for_timeout(300); await pg.screenshot(path=f'{R}/assets/{name}.png')
        await b.close()
asyncio.run(main())
