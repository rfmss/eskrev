import json
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

BOOKS_PATH = Path("src/library/books.json")


def norm(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()


def score(item, title, author, lang):
    t = norm(title)
    a = norm(author)
    ititle = norm(item.get("title", ""))
    iauth = " ".join(norm(p.get("name", "")) for p in item.get("authors", []))
    s = 0
    if lang in item.get("languages", []):
        s += 4
    if t and t in ititle:
        s += 5
    if ititle and ititle in t:
        s += 2
    if a and a in iauth:
        s += 4
    return s


def fetch_json(url: str):
    with urllib.request.urlopen(url, timeout=30) as fh:
        return json.loads(fh.read().decode("utf-8"))


def find_gutenberg(book):
    q = f"{book['title']} {book['author']}"
    url = f"https://gutendex.com/books?search={urllib.parse.quote(q)}"
    data = fetch_json(url)
    items = data.get("results", [])
    best = None
    best_score = -1
    for item in items:
        s = score(item, book["title"], book["author"], book["lang_code"])
        if s > best_score:
            best = item
            best_score = s
    # If low confidence, check next pages
    next_url = data.get("next")
    while next_url and best_score < 7:
        data = fetch_json(next_url)
        for item in data.get("results", []):
            s = score(item, book["title"], book["author"], book["lang_code"])
            if s > best_score:
                best = item
                best_score = s
        next_url = data.get("next")
    if not best or best_score < 6:
        return None
    return best


def pick_text_url(formats: dict):
    txt = None
    for k, v in formats.items():
        if k.startswith("text/plain") and "utf-8" in k:
            return v
    for k, v in formats.items():
        if k.startswith("text/plain"):
            txt = v
            break
    return txt


def download(url: str, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=60) as fh:
        data = fh.read()
    dest.write_bytes(data)


def main():
    if not BOOKS_PATH.exists():
        raise SystemExit("books.json not found")
    data = json.loads(BOOKS_PATH.read_text(encoding="utf-8"))
    books = data.get("books", [])
    for book in books:
        lang = book.get("language")
        book["lang_code"] = "pt" if lang == "ptbr" else lang

    for book in books:
        print(f"Searching: {book['id']}...")
        match = find_gutenberg(book)
        if not match:
            print(f"  !! Not found: {book['title']} ({book['author']})")
            continue
        formats = match.get("formats", {})
        url = pick_text_url(formats)
        if not url:
            print(f"  !! No text/plain for {book['id']}")
            continue
        dest = Path(book["file"])
        print(f"  -> Downloading {url}")
        download(url, dest)
        book["gutenberg_id"] = match.get("id")
        book["download_url"] = url
        book["fetched_at"] = datetime.utcnow().strftime("%Y-%m-%d")
        time.sleep(0.3)

    # cleanup helper field
    for book in books:
        book.pop("lang_code", None)

    BOOKS_PATH.write_text(json.dumps({"books": books}, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done. Updated books.json")


if __name__ == "__main__":
    main()
