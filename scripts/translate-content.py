"""Translate the pinned public book, caching every field for resumable builds.

Uses Google's public translation endpoint; no API key is stored. Machine output
requires editorial review. URLs are protected and checked before saving.
"""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / 'docs' / 'translation-cache'
CACHE.mkdir(exist_ok=True)
SOURCE = json.loads((ROOT / 'public/content/zh-CN.json').read_text())
URL = re.compile(r'https?://[^\s<>\)]+')
FIELDS = ['title', 'cost', 'summary', 'benefit', 'sources', 'notes', 'gradeNote']

def translate(text, language):
    if not text or not re.search(r'[\u3400-\u9fff]', text):
        return text
    digest = hashlib.sha256((language + '\0' + text).encode()).hexdigest()
    path = CACHE / (digest + '.json')
    if path.exists():
        return json.loads(path.read_text())
    urls = []
    def protect(match):
        urls.append(match.group())
        return f'ZXQLINK{len(urls)-1:04d}QXZ'
    protected = URL.sub(protect, text)
    # Bound encoded request size and split on sentence boundaries where possible.
    chunks = []
    while len(protected) > 1400:
        end = max(protected.rfind('。', 0, 1400), protected.rfind('\n', 0, 1400), protected.rfind('；', 0, 1400)) + 1
        if end < 400:
            end = 1400
            token = re.search(r'ZXQLINK\d{4}QXZ', protected[end-20:end+20])
            if token:
                end = end - 20 + token.start()
        chunks.append(protected[:end])
        protected = protected[end:]
    chunks.append(protected)
    translated = []
    for chunk in chunks:
        query = urllib.parse.urlencode({'client':'gtx','sl':'zh-CN','tl':language,'dt':'t','q':chunk})
        for attempt in range(6):
            try:
                request = urllib.request.Request('https://translate.googleapis.com/translate_a/single?' + query, headers={'User-Agent':'Mozilla/5.0'})
                with urllib.request.urlopen(request, timeout=45) as response:
                    result = json.load(response)
                output = ''.join(part[0] or '' for part in result[0])
                if not output.strip():
                    raise ValueError('Empty translation')
                translated.append(output)
                break
            except Exception as error:
                if getattr(error, 'code', None) == 429:
                    raise RuntimeError('Provider rate limit (HTTP 429). Stop and use a provisioned translation service.') from error
                if attempt == 0: print(f'Retry: {type(error).__name__}: {error}', flush=True)
                if attempt == 5:
                    raise
                time.sleep(2 ** attempt)
    output = '\n'.join(translated)
    for index, url in enumerate(urls):
        pattern = re.compile(r'ZXQ\s*LINK\s*' + f'{index:04d}' + r'\s*QXZ', re.I)
        if len(pattern.findall(output)) != 1:
            raise ValueError(f'URL marker damaged: {digest}, marker {index}')
        output = pattern.sub(lambda _: url, output)
    if URL.findall(text) != URL.findall(output):
        raise ValueError('URL integrity check failed')
    path.write_text(json.dumps(output, ensure_ascii=False) + '\n')
    return output

def run(language):
    data = json.loads(json.dumps(SOURCE))
    data['language'] = language
    data['translation'] = {'method': 'Google machine translation', 'reviewed': False, 'sourceHash': SOURCE['sourceHash']}
    tasks = []
    for chapter in data['chapters']:
        for key in ['title', 'intro', 'appendix']:
            if key in chapter:
                tasks.append((chapter, key, chapter[key]))
        for entry in chapter['entries']:
            for key in FIELDS:
                tasks.append((entry, key, entry[key]))
    failed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        pending = {pool.submit(translate, text, language): (obj,key) for obj,key,text in tasks}
        for number, future in enumerate(concurrent.futures.as_completed(pending), 1):
            obj, key = pending[future]
            try:
                obj[key] = future.result()
            except Exception as error:
                failed.append((obj.get('id'), key, str(error)))
                if 'HTTP 429' in str(error):
                    for task in pending: task.cancel()
                    raise RuntimeError('Translation stopped: provider rate limit; no partial locale published') from error
            if number % 100 == 0:
                print(f'{language}: {number}/{len(tasks)} fields, failures={len(failed)}', flush=True)
    if failed:
        (ROOT / f'docs/translation-errors-{language}.json').write_text(json.dumps(failed, ensure_ascii=False, indent=2))
        raise RuntimeError(f'{language}: {len(failed)} translation failures; cached successful fields, no partial locale published')
    (ROOT / f'public/content/{language}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f'{language}: complete', flush=True)

if __name__ == '__main__':
    import sys
    if '--probe' in sys.argv:
        print(translate('系安全带，前排后排都系。', 'vi'), flush=True)
        sys.exit(0)
    for language in sys.argv[1:] or ['en', 'vi']:
        if language not in ['en', 'vi']:
            raise ValueError('Only en and vi are supported')
        run(language)
