#!/usr/bin/env python3
"""Fail CI/release review if landing icons are missing or quotes have no icons."""
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
HTML=ROOT/"brand/landing/index.html"
class Icons(HTMLParser):
    def __init__(self):
        super().__init__()
        self.imgs=[]
        self.quote_open=0
        self.quoted_images=0
        self.quoted_items=0
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=="p" and "lp-fit-quote" in attrs.get("class","").split():
            self.quote_open+=1
            self.quoted_items+=1
        if tag=="img":
            self.imgs.append(attrs.get("src",""))
            if self.quote_open: self.quoted_images+=1
    def handle_endtag(self,tag):
        if tag=="p" and self.quote_open: self.quote_open-=1

parser=Icons();parser.feed(HTML.read_text(encoding="utf-8"))
missing=[src for src in parser.imgs if not (HTML.parent/src).resolve().is_file()]
assert not missing,f"Broken icon/image paths: {missing}"
assert parser.quoted_items==5,f"Expected 5 quote cards, got {parser.quoted_items}"
assert parser.quoted_images==5,f"Expected 1 icon per quote card, got {parser.quoted_images}"
for title,src in [("Sueño","../assets/img/stickers/rest.svg"),("Energía","../assets/img/stickers/energy.svg"),("Hábitos","../assets/img/stickers/movement.svg")]:
    assert f'src="{src}" alt="" width="33" height="33"><span>{title}</span>' in HTML.read_text(encoding="utf-8"),title
print(f"OK: {len(parser.imgs)} image references resolve; 5 quote cards have 5 icons; hero signals match labels.")
