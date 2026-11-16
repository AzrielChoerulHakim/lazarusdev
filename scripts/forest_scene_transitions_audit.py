#!/usr/bin/env python3
"""Stage 12 static semantic contract. Never uses browser screenshots."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROUTES = (Path('index.html'), Path('storybook/index.html'))
ids = ('entrance', 'winding-path', 'work-clearing', 'river-stories', 'house-on-the-hill')
class Inspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []
        self.seams = []
        self.links = []
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'section' and 'data-chapter' in attributes:
            self.sections.append(attributes.get('id'))
        if tag == 'nav' and 'data-chapter-seam' in attributes:
            self.seams.append(attributes)
        if tag == 'a' and 'forest-seam-link' in attributes.get('class','').split():
            self.links.append(attributes.get('href'))
        if tag == 'h1':
            self.h1 += 1

for file in ROUTES:
    text = file.read_text()
    parser = Inspector()
    parser.feed(text)
    assert tuple(parser.sections) == ids, (file,parser.sections)
    assert parser.h1 == 1, (file,'incorrect heading count')
    assert len(parser.seams) == 4, (file,'four boundaries required')
    expected = list('#'+x for x in ids[1:])
    assert parser.links == expected, (file,parser.links)
    for i,seam in enumerate(parser.seams):
        assert seam.get('data-seam-from') == ids[i], (file,'from order',i)
        assert seam.get('data-seam-to') == ids[i+1], (file,'to order',i)
    assert 'forest-seams.css' in text and 'forest-seams.js' in text, file
    assert text.count('class="seam-trail"') == 4, file
    print('PASS',file,'5 chapters, 4 semantic seams, honest native links, 1 H1')
css = Path('src/storybook/styles/forest-seams.css').read_text()
js = Path('src/storybook/forest-seams.js').read_text()
assert 'prefers-reduced-motion:reduce' in css
assert 'IntersectionObserver' in js and 'unobserve' in js
for forbidden in ('.scrollTo(','.scrollIntoView(','.preventDefault(','.screenshot(','.setInterval('):
    assert forbidden not in js, (forbidden,'forbidden in seam interaction')
print('Stage 12 semantic and motion policy passed.')
