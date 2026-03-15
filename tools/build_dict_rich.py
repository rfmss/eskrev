#!/usr/bin/env python3
"""
build_dict_rich.py — Constrói dicionário enriquecido para o eskrev.

Fontes:
  1. pt_dict_chunk_1/2/3.json  — definições existentes (360k entradas, pos + def)
  2. OpenWordNet-PT (own-pt.tar.gz, ~3MB) — sinônimos e antônimos por synset

Saída:
  src/assets/lingua/pt_dict_rich_chunk_{letra}.json   (um por letra a–z + misc)

Formato de entrada:
  { "pos": ["SUBST"], "def": "..." }

Formato de saída (enriquecido):
  { "pos": ["SUBST"], "def": "...", "sin": ["lar","moradia"], "ant": ["rua"] }

Uso:
  cd /home/rafamass/projetos/eskrev
  python3 tools/build_dict_rich.py
"""

import gzip, io, json, re, sys, tarfile, unicodedata, urllib.request
from collections import defaultdict
from pathlib import Path

# ── Configuração ────────────────────────────────────────────────────────────
ROOT       = Path(__file__).parent.parent
LINGUA     = ROOT / "src/assets/lingua"
CACHE_DIR  = ROOT / "tools/.cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

OWN_PT_URL   = "https://github.com/own-pt/openWordnet-PT/releases/download/v1.0.0/own-pt.tar.gz"
OWN_PT_CACHE = CACHE_DIR / "own-pt.tar.gz"

EXISTING_CHUNKS = [
    LINGUA / "pt_dict_chunk_1.json",
    LINGUA / "pt_dict_chunk_2.json",
    LINGUA / "pt_dict_chunk_3.json",
]

OUTPUT_PREFIX = "pt_dict_rich_chunk_"
MAX_SIN = 6
MAX_ANT = 4

# ── Helpers ─────────────────────────────────────────────────────────────────
def deaccent(s: str) -> str:
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()

def normalize_key(word: str) -> str:
    return word.strip().lower()

def first_letter(word: str) -> str:
    a = deaccent(word.lower())
    c = a[0] if a else "_"
    return c if c.isalpha() else "_"

def download_with_progress(url: str, dest: Path):
    print(f"  Baixando {url.split('/')[-1]} …", end="", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "eskrev-build/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    dest.write_bytes(data)
    print(f" {len(data)//1024}KB ok")

# ── Passo 1: Carrega definições existentes ───────────────────────────────────
def load_existing_defs() -> dict:
    master = {}
    for path in EXISTING_CHUNKS:
        if not path.exists():
            print(f"  AVISO: {path.name} não encontrado — pulando")
            continue
        chunk = json.loads(path.read_text(encoding="utf-8"))
        for word, entry in chunk.items():
            key = normalize_key(word)
            if key not in master:
                master[key] = {
                    "pos": entry.get("pos", []),
                    "def": entry.get("def", ""),
                }
    print(f"  Definições carregadas: {len(master):,}")
    return master

# ── Passo 2: Parseia OpenWordNet-PT (formato LMF XML) ──────────────────────
# Estrutura do LMF:
#   <LexicalEntry id="..."> <Lemma writtenForm="palavra" partOfSpeech="n"/> <Sense synset="own-pt-synset-XXXX-n"/> </LexicalEntry>
#   <Synset id="own-pt-synset-XXXX-n" members="wordsense1 wordsense2">
#     <Definition>Definição em PT</Definition>
#     <SynsetRelation relType="antonym" target="own-pt-synset-YYYY-n"/>
#   </Synset>

_LMF_POS = {"n": "SUBST", "v": "VERB", "a": "ADJ", "s": "ADJ", "r": "ADV"}

def parse_ownpt(tar_path: Path) -> tuple[dict, dict, dict]:
    """
    Retorna:
      synsets: { synset_id → {words_pt, gloss, pos} }
      word_to_synsets: { palavra_pt → [synset_id, ...] }
      word_antonyms: { palavra_pt → [ant_palavra, ...] }  — de SenseRelation antonym
    """
    import xml.etree.ElementTree as ET

    # Passo A: mapeia wordsense_id → written_form + captura SenseRelation antonym
    # Passo B: constrói synsets com Definition + membros

    with tarfile.open(tar_path, "r:gz") as tar:
        xml_file = tar.extractfile("own-pt/own-pt-lmf.xml")
        raw_xml = xml_file.read()

    # --- Fase A: LexicalEntry → wordsense_id → word_form + antônimos por sentido ---
    sense_to_word = {}   # "own-pt-wordsense-XXXX-n-1" → "palavra"
    sense_ant     = defaultdict(list)  # sense_id → [ant_sense_id, ...]

    context_a = ET.iterparse(io.BytesIO(raw_xml), events=("start", "end"))
    cur_entry_lemma = None
    cur_sense_id    = None
    for event, elem in context_a:
        if event == "start" and elem.tag == "LexicalEntry":
            cur_entry_lemma = None
            cur_sense_id    = None
        elif event == "start" and elem.tag == "Lemma":
            cur_entry_lemma = elem.get("writtenForm", "").strip()
        elif event == "start" and elem.tag == "Sense":
            sid = elem.get("id", "")
            if sid and cur_entry_lemma:
                sense_to_word[sid] = cur_entry_lemma
                cur_sense_id = sid
        elif event == "start" and elem.tag == "SenseRelation":
            if elem.get("relType") == "antonym" and cur_sense_id:
                tgt = elem.get("target", "")
                if tgt:
                    sense_ant[cur_sense_id].append(tgt)
        elif event == "end" and elem.tag == "LexicalEntry":
            cur_entry_lemma = None
            cur_sense_id    = None
            elem.clear()

    print(f"  LexicalEntries (formas): {len(sense_to_word):,}")

    # Resolve sense_ant → word_antonyms
    word_antonyms: dict[str, list] = defaultdict(list)
    for sid, ant_sids in sense_ant.items():
        word = sense_to_word.get(sid, "")
        if not word:
            continue
        word_key = normalize_key(word)
        for asid in ant_sids:
            ant_word = sense_to_word.get(asid, "")
            if ant_word:
                ant_key = normalize_key(ant_word)
                if ant_key not in word_antonyms[word_key]:
                    word_antonyms[word_key].append(ant_key)
    print(f"  Palavras com antônimos (SenseRelation): {len(word_antonyms):,}")

    # --- Fase B: Synset → Definition + membros ---
    synsets = {}
    word_to_synsets: dict[str, list] = defaultdict(list)

    context_b = ET.iterparse(io.BytesIO(raw_xml), events=("start", "end"))
    cur_syn_id  = None
    cur_pos     = None
    cur_def     = None
    cur_members = []

    for event, elem in context_b:
        if event == "start" and elem.tag == "Synset":
            cur_syn_id  = elem.get("id", "")
            pos_char    = cur_syn_id.rsplit("-", 1)[-1] if cur_syn_id else ""
            cur_pos     = [_LMF_POS.get(pos_char, "SUBST")]
            members_raw = elem.get("members", "")
            cur_members = [s.strip() for s in members_raw.split() if s.strip()]
            cur_def     = None

        elif event == "end" and elem.tag == "Definition":
            if cur_syn_id and elem.text:
                cur_def = elem.text.strip()

        elif event == "end" and elem.tag == "Synset":
            if not cur_syn_id:
                elem.clear()
                continue

            words_pt = []
            for wsid in cur_members:
                w = sense_to_word.get(wsid, "")
                if w:
                    words_pt.append(normalize_key(w))
            words_pt = list(dict.fromkeys(words_pt))

            if words_pt:
                synsets[cur_syn_id] = {
                    "words_pt": words_pt,
                    "gloss":    cur_def or "",
                    "pos":      cur_pos,
                }
                for w in words_pt:
                    word_to_synsets[w].append(cur_syn_id)

            cur_syn_id = None
            elem.clear()

    print(f"  Synsets com PT: {len(synsets):,}")
    print(f"  Palavras PT únicas no OWN-PT: {len(word_to_synsets):,}")
    return synsets, dict(word_to_synsets), dict(word_antonyms)

# ── Passo 3: Constrói índice de sinônimos e antônimos ───────────────────────
def build_enrichment(synsets: dict, word_to_synsets: dict, word_antonyms: dict) -> dict:
    """
    Retorna: { palavra → {sin: [...], ant: [...], gloss_pt: str | None, pos: [...]} }
    """
    enrichment = {}

    for sid, syn in synsets.items():
        words = syn["words_pt"]
        if not words:
            continue

        # Sinônimos: todas as outras palavras no mesmo synset
        synonyms = [w for w in words if len(w) > 1]

        for word in words:
            sins = [w for w in synonyms if w != word][:MAX_SIN]

            if word not in enrichment:
                enrichment[word] = {"sin": [], "ant": [], "gloss_pt": None, "pos": syn["pos"]}

            existing = enrichment[word]
            for s in sins:
                if s not in existing["sin"] and len(existing["sin"]) < MAX_SIN:
                    existing["sin"].append(s)
            if syn["gloss"] and not existing["gloss_pt"]:
                existing["gloss_pt"] = syn["gloss"]
            if syn["pos"] and not existing["pos"]:
                existing["pos"] = syn["pos"]

    # Merge antônimos de SenseRelation
    for word, ants in word_antonyms.items():
        if word not in enrichment:
            enrichment[word] = {"sin": [], "ant": [], "gloss_pt": None, "pos": []}
        existing = enrichment[word]
        for a in ants[:MAX_ANT]:
            if a not in existing["ant"] and len(existing["ant"]) < MAX_ANT:
                existing["ant"].append(a)

    print(f"  Palavras com enriquecimento: {len(enrichment):,}")
    sin_count = sum(1 for e in enrichment.values() if e["sin"])
    ant_count = sum(1 for e in enrichment.values() if e["ant"])
    print(f"  Com sinônimos: {sin_count:,}")
    print(f"  Com antônimos: {ant_count:,}")
    return enrichment

# ── Passo 4: Merge e saída por letra ────────────────────────────────────────
def merge_and_output(master: dict, enrichment: dict):
    # Determina todas as palavras a incluir
    all_words = set(master.keys()) | set(enrichment.keys())
    print(f"  Total de palavras únicas: {len(all_words):,}")

    # Agrupa por letra inicial
    by_letter = defaultdict(dict)
    stats = {"only_def": 0, "enriched": 0, "only_ownpt": 0}

    for word in all_words:
        base  = master.get(word, {})
        enr   = enrichment.get(word, {})

        entry = {}

        # pos: prefere OWN-PT se tiver, senão usa o dos chunks
        pos = enr.get("pos") or base.get("pos") or []
        if pos:
            entry["pos"] = pos

        # def: prefere gloss_pt do OWN-PT (redigido em PT), senão usa chunk
        gloss_pt = enr.get("gloss_pt")
        def_base = base.get("def", "")
        if gloss_pt:
            entry["def"] = _clean_def(gloss_pt)
        elif def_base:
            entry["def"] = def_base

        # sin e ant: só se houver
        sins = enr.get("sin", [])
        ants = enr.get("ant", [])
        if sins:
            entry["sin"] = sins
        if ants:
            entry["ant"] = ants

        # Só inclui se tiver pelo menos def ou sin
        if not entry.get("def") and not sins:
            continue

        if sins or ants:
            if def_base or gloss_pt:
                stats["enriched"] += 1
            else:
                stats["only_ownpt"] += 1
        else:
            stats["only_def"] += 1

        letter = first_letter(word)
        by_letter[letter][word] = entry

    # Grava um JSON por letra
    written = 0
    for letter, entries in sorted(by_letter.items()):
        fname = LINGUA / f"{OUTPUT_PREFIX}{letter}.json"
        fname.write_text(
            json.dumps(entries, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8"
        )
        written += len(entries)

    print(f"\n  Chunks gerados: {len(by_letter)}")
    print(f"  Entradas totais gravadas: {written:,}")
    print(f"  Só definição: {stats['only_def']:,}")
    print(f"  Definição + sinônimos/antônimos: {stats['enriched']:,}")
    print(f"  Só OWN-PT (sem def prévia): {stats['only_ownpt']:,}")

    # Grava índice de metadados
    index = {
        "version": "2.0.0",
        "source": "OpenWordNet-PT v1.0.0 + pt_dict_chunks",
        "total_entries": written,
        "chunks": sorted(by_letter.keys()),
        "fields": ["pos", "def", "sin", "ant"],
    }
    (LINGUA / f"{OUTPUT_PREFIX}index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  Índice gravado: {OUTPUT_PREFIX}index.json")

def _clean_def(text: str) -> str:
    """Remove marcações de wikitext e exemplos entre aspas."""
    # Remove exemplos entre aspas: "Frase de exemplo"
    text = re.sub(r'["""].*?["""]', "", text)
    # Remove marcadores wikitext como {{algo}}
    text = re.sub(r"\{\{[^}]*\}\}", "", text)
    # Remove links [[palavra]]
    text = re.sub(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", r"\1", text)
    # Remove ponto-e-vírgula final de listas de exemplos
    text = re.sub(r";\s*$", "", text.strip())
    return text.strip()

# ── main ─────────────────────────────────────────────────────────────────────
def main():
    print("╔══════════════════════════════════════════════════╗")
    print("║  eskrev — build_dict_rich.py                     ║")
    print("╚══════════════════════════════════════════════════╝\n")

    # 1. Definições existentes
    print("① Carregando definições existentes …")
    master = load_existing_defs()

    # 2. Baixa OWN-PT (com cache)
    print("\n② OpenWordNet-PT …")
    if not OWN_PT_CACHE.exists():
        download_with_progress(OWN_PT_URL, OWN_PT_CACHE)
    else:
        print(f"  Cache encontrado: {OWN_PT_CACHE.name} ({OWN_PT_CACHE.stat().st_size//1024}KB)")

    # 3. Parseia OWN-PT
    print("\n③ Parseando OpenWordNet-PT …")
    synsets, word_to_synsets, word_antonyms = parse_ownpt(OWN_PT_CACHE)

    # 4. Constrói enriquecimento
    print("\n④ Construindo sinônimos e antônimos …")
    enrichment = build_enrichment(synsets, word_to_synsets, word_antonyms)

    # 5. Merge e saída
    print("\n⑤ Mesclando e gravando chunks …")
    merge_and_output(master, enrichment)

    # 6. Tamanho total
    print("\n⑥ Tamanho dos chunks gerados:")
    total = 0
    for f in sorted(LINGUA.glob(f"{OUTPUT_PREFIX}*.json")):
        if "index" not in f.name:
            sz = f.stat().st_size
            total += sz
            entries = len(json.loads(f.read_text()))
            print(f"  {f.name}: {sz//1024}KB ({entries:,} entradas)")
    print(f"\n  Total: {total//1024}KB ({total//1024//1024}MB)")
    print("\n✓ Concluído.")

if __name__ == "__main__":
    main()
