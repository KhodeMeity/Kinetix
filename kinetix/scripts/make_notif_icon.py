# ساخت آیکون کوچک اعلان (سفید روی شفاف، ۹۶×۹۶): python3 scripts/make_notif_icon.py  — نیازمند playwright
import asyncio, os
from playwright.async_api import async_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = '<path d="M8 6h32M16 6l6 11M32 6l-6 11M24 20v14M24 34l-3.5 10M24 34l3.5 10"/><circle cx="24" cy="15" r="3.2"/>'
SVG = f'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48"><g transform="translate(6 6) scale(0.75)" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">{G}</g></svg>'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 96, 'height': 96})
        await pg.set_content(f'<body style="margin:0;background:transparent">{SVG}</body>')
        await pg.screenshot(path=f'{R}/assets/android/ic_stat_kinetix.png', omit_background=True); await b.close()
asyncio.run(main())
