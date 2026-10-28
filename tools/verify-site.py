from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter

root = Path(__file__).resolve().parent.parent
pages = ['index.html', 'services.html', 'projects.html', 'about.html', 'service-areas.html', 'estimate.html']
recipient = 'alaskahandymanservices907@gmail.com'
fields = {'first_name', 'last_name', 'phone', 'email', 'service', 'location', 'message', 'timeline'}

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

for name in pages:
    text = (root / name).read_text(encoding='utf-8')
    page = Page(text)
    ids = Counter(a['id'] for t, a in page.tags if 'id' in a)
    assert all(v == 1 for v in ids.values()), (name, 'duplicate IDs')
    assert sum(t == 'h1' for t, a in page.tags) == 1, (name, 'h1')
    assert sum(t == 'main' for t, a in page.tags) == 1, (name, 'main landmark')
    forms = [a for t, a in page.tags if t == 'form']
    assert len(forms) == 1 and forms[0]['method'] == 'POST', (name, 'form count/method')
    assert forms[0]['action'] == 'https://formsubmit.co/' + recipient, (name, 'recipient')
    assert fields <= {a.get('name') for t, a in page.tags}, (name, 'missing fields')
    assert not any(a.get('type') == 'file' for t, a in page.tags), (name, 'file input')
    assert not any(a.get('name') in {'_cc', '_webhook', '_autoresponse'} for t, a in page.tags), (name, 'secondary delivery')
    assert text.count('src="lead-form.js"') == 1 and text.count('src="main.js"') == 1, (name, 'duplicate scripts')
    assert 'wa.me' not in text and 'fetch(' not in text, (name, 'old route')
    for tag, attrs in page.tags:
        if tag == 'label' and 'for' in attrs:
            assert attrs['for'] in ids, (name, 'unbound label', attrs['for'])
        if tag in {'a','link','script','img','source'}:
            ref = attrs.get('href', attrs.get('src', ''))
            url = urlsplit(ref)
            if url.scheme or url.netloc or not ref:
                continue
            target = root / unquote(url.path) if url.path else root / name
            assert target.is_file(), (name, 'missing local target', ref)
            if url.fragment and target.suffix == '.html':
                target_page = page if target.name == name else Page(target.read_text(encoding='utf-8'))
                assert any(a.get('id') == url.fragment for t, a in target_page.tags), (name, 'missing fragment', ref)
    print(name + ': form, destination, labels, landmarks, scripts and local links verified')
print('All 6 pages passed.')
