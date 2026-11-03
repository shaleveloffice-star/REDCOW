from html.parser import HTMLParser
from pathlib import Path
import json, sys

class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.descriptions = []
        self.canonicals = []
        self.robots = []
        self.eligible = []
        self.excluded = []
        self.main_excluded = None
        self.footer_excluded = None
        self.voids = set('area base br col embed hr img input link meta param source track wbr'.split())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        excluded = any(frame[1] for frame in self.stack) or ('data-nosnippet' in attrs and tag in ('div','section','span'))
        if tag == 'meta' and attrs.get('name') == 'description': self.descriptions.append(attrs.get('content'))
        if tag == 'meta' and attrs.get('name') in ('robots','googlebot'): self.robots.append(attrs.get('content'))
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonicals.append(attrs.get('href'))
        if tag == 'main': self.main_excluded = excluded
        if tag == 'footer': self.footer_excluded = excluded
        if tag not in self.voids: self.stack.append((tag, excluded, tag in ('script','style','head','template') or 'hidden' in attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        text = text.strip()
        if not text or not any(f[0]=='body' for f in self.stack) or any(f[2] for f in self.stack): return
        (self.excluded if any(f[1] for f in self.stack) else self.eligible).append(text)

for arg in sys.argv[1:]:
    audit = Audit()
    audit.feed(Path(arg).read_text(encoding='utf-8'))
    result = dict(file=arg, descriptions=audit.descriptions, canonicals=audit.canonicals, robots=audit.robots,
                  mainExcluded=audit.main_excluded, footerExcluded=audit.footer_excluded,
                  eligibleTextCount=len(audit.eligible), eligibleSample=audit.eligible[:8], excludedTextCount=len(audit.excluded))
    print(json.dumps(result, ensure_ascii=True))
    assert len(audit.descriptions) == 1 and audit.descriptions[0]
    assert len(audit.canonicals) == 1
    assert not any('noindex' in value or 'nosnippet' in value for value in audit.robots)
    if 'after' in arg and 'home' in arg: assert audit.main_excluded and audit.footer_excluded and not audit.eligible
    if 'menu' in arg: assert not audit.main_excluded and audit.eligible
