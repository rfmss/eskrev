const POS_CORE_URL = "src/assets/lingua/pt_pos_core.json";
const POS_CHUNKS = [
    "src/assets/lingua/pt_pos_chunk_1.json",
    "src/assets/lingua/pt_pos_chunk_2.json",
    "src/assets/lingua/pt_pos_chunk_3.json"
];

const CHUNK_RANGES = [
    /[a-f]/i,
    /[g-o]/i,
    /[p-z]/i
];

const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao carregar ${url}`);
    return res.json();
};

export const ptPosLexicon = {
    entries: new Map(),
    coreLoaded: false,
    chunksLoaded: new Set(),

    normalizeLookupKey(raw) {
        if (!raw) return "";
        const trimmed = String(raw).trim();
        const cleaned = trimmed.replace(/^[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+|[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+$/g, "");
        try {
            return cleaned.toLowerCase().normalize("NFC");
        } catch (_) {
            return cleaned.toLowerCase();
        }
    },

    normalize(word) {
        try {
            return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        } catch (_) {
            return word.toLowerCase();
        }
    },

    addEntries(data) {
        Object.entries(data || {}).forEach(([word, entry]) => {
            if (!entry) return;
            const clean = this.normalize(word);
            this.entries.set(clean, { word, ...entry });
        });
    },

    async loadCore() {
        if (this.coreLoaded) return;
        const data = await fetchJson(POS_CORE_URL);
        this.addEntries(data);
        this.coreLoaded = true;
    },

    async loadChunkFor(word) {
        const first = (word || "").charAt(0);
        const idx = CHUNK_RANGES.findIndex((re) => re.test(first));
        if (idx < 0) return;
        if (this.chunksLoaded.has(idx)) return;
        const url = POS_CHUNKS[idx];
        if (!url) return;
        const data = await fetchJson(url);
        this.addEntries(data);
        this.chunksLoaded.add(idx);
    },

    async lookup(raw) {
        if (!raw) return null;
        await this.loadCore();
        const key = this.normalizeLookupKey(raw);
        const clean = this.normalize(key);
        let entry = this.entries.get(clean) || null;
        if (!entry) {
            await this.loadChunkFor(clean);
            entry = this.entries.get(clean) || null;
        }
        return entry;
    },

    guess(raw) {
        if (!raw) return null;
        const key = this.normalizeLookupKey(raw);
        if (!key) return null;
        const lower = key.toLowerCase();

        // NUM: dígitos e ordinais escritos
        if (/^\d+([.,]\d+)?(%|º|ª)?$/.test(lower)) return { pos: ["NUM"], probable: true };
        if (/(esimo|esima|esimos|esimas)$/.test(lower)) return { pos: ["NUM"], probable: true };

        // ADV: -mente (único sufixo produtivo e não ambíguo)
        if (/mente$/.test(lower) && lower.length > 6) return { pos: ["ADV"], probable: true };

        // ── Regra geral: sufixos DERIVACIONAIS de SUBST têm prioridade sobre ──
        // ── terminações FLEXIONAIS de VERB. Derivação cria nova palavra       ──
        // ── (viajar→viagem); flexão conjuga a mesma (correr→correm).          ──

        // SUBST derivacional — sufixos que NUNCA formam verbos:
        // -agem/-agem/-igem/-ugem: viagem, bagagem, imagem, coragem, origem, ferrugem
        if (/(agem|agens|igem|ugem)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -ção/-ções/-são/-sões: ação, mansão, divisão
        if (/(cao|coes|sao|soes)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -dade/-tude: saudade, cidade, atitude, multidão
        if (/(dade|dades|tude|tudes)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -ismo/-ista: romantismo, pianista
        if (/(ismo|ismos|ista|istas)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -mento/-mento: sentimento, pensamento (≠ gerúndio -ando/-endo)
        if (/(mento|mentos)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -ncia/-ncia: esperança, presença, ciência
        if (/(ncia|ncias)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -ura: leitura, tortura, abertura
        if (/(ura|uras)$/.test(lower) && lower.length > 5) return { pos: ["SUBST"], probable: true };
        // -eiro/-eira: livreiro, padeiro, bandeira
        if (/(eiro|eira|eiros|eiras)$/.test(lower)) return { pos: ["SUBST"], probable: true };
        // -ia com sufixo derivacional de SUBST — nunca formam verbos:
        //   -cia/-gia/-fia/-mia/-pia/-sia/-xia: farmácia, magia, filosofia, economia, utopia
        //   -oria: história, glória, vitória, memória (≠ -eria/-aria/-iria que são condicional VERB)
        //   -nia: harmonia, ironia, cerimônia (nenhum verbo PT termina em -nia no imperfeito)
        // Excluídos deliberadamente: -ria (corr-eria=VERB), -bia (beb-ia=VERB), -lia (val-ia=VERB)
        if (/(cia|cias|gia|gias|fia|fias|mia|mias|pia|pias|sia|sias|xia|xias|oria|orias|nia|nias)$/.test(lower)) return { pos: ["SUBST"], probable: true };

        // VERB: formas não-finitas (gerúndio, particípio)
        if (/(ando|endo|indo)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };
        if (/(ado|ido)$/.test(lower) && lower.length > 4) return { pos: ["VERB"], probable: true };

        // VERB: infinitivo
        if (/[aei]r$/.test(lower) && lower.length > 3) return { pos: ["VERB"], probable: true };

        // VERB: pretérito perfeito 1ª sg (-ei) e 3ª sg (-ou/-eu/-iu)
        if (/ei$/.test(lower) && lower.length > 4) return { pos: ["VERB"], probable: true };
        if (/ou$/.test(lower) && lower.length > 4) return { pos: ["VERB"], probable: true };
        if (/eu$/.test(lower) && lower.length > 3) return { pos: ["VERB"], probable: true };  // bebeu, comeu, correu
        if (/iu$/.test(lower) && lower.length > 3) return { pos: ["VERB"], probable: true };  // partiu, abriu, saiu

        // VERB: pretérito imperfeito (-ava/-avam, -ia/-iam)
        if (/(ava|avas|avam)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };
        if (/(ia|ias|iam)$/.test(lower) && lower.length > 4) return { pos: ["VERB"], probable: true };

        // VERB: pretérito perfeito 3ª pl (-aram/-eram/-iram)
        if (/(aram|eram|iram)$/.test(lower) && lower.length > 6) return { pos: ["VERB"], probable: true };

        // VERB: pretérito perfeito 2ª sg (-aste/-este/-iste)
        if (/(aste|este|iste)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };

        // VERB: subjuntivo imperfeito (-asse/-esse/-isse)
        if (/(asse|asses|esse|esses|isse|isses)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };

        // VERB: futuro do subjuntivo (-armos/-ermos/-irmos/-arem/-erem/-irem)
        if (/(armos|ermos|irmos|arem|erem|irem)$/.test(lower) && lower.length > 6) return { pos: ["VERB"], probable: true };

        // VERB: futuro do indicativo e condicional
        if (/(arei|erei|irei|ara|era|ira|arao|erao|irao)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };
        if (/(aria|arias|ariam|eria|erias|eriam|iria|irias|iriam)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };

        // VERB: 1ª/2ª pl presente e futuro (-amos/-emos/-imos, -ais/-eis)
        if (/(amos|emos|imos)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };
        if (/(ais|eis)$/.test(lower) && lower.length > 4) return { pos: ["VERB"], probable: true };

        // VERB: 3ª pl presente — padrão específico antes do genérico
        if (/(alam|elam|ilam|ecam|icam|ocam|ucam|ulam)$/.test(lower)) return { pos: ["VERB"], probable: true };
        // genérico [^aeiou](am|em): correm, partem — -gem já foi protegido acima
        if (/[^aeiou](am|em)$/.test(lower) && lower.length > 5) return { pos: ["VERB"], probable: true };

        // ADJ: sufixos derivacionais não ambíguos
        if (/(avel|ivel|oso|osa|osos|osas|ivo|iva|ivos|ivas|ico|ica|icos|icas|ante|antes|ente|entes|udo|uda|udos|udas|undo|unda|undos|undas)$/.test(lower)) {
            return { pos: ["ADJ"], probable: true };
        }
        if (/(al|ais|ual|uais|vel|veis|il|is)$/.test(lower) && lower.length > 4) {
            return { pos: ["ADJ"], probable: true };
        }
        // ADJ: superlativo absoluto sintético
        if (/(issimo|issima|issimos|issimas)$/.test(lower)) return { pos: ["ADJ"], probable: true };

        // PRON: lista fechada de pronomes não cobertos pelo léxico
        if (/^(meu|minha|meus|minhas|teu|tua|teus|tuas|seu|sua|seus|suas|nosso|nossa|nossos|nossas|vosso|vossa|vossos|vossas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|aqueles|aquelas|isto|isso|aquilo|alguem|ninguem|todos|todas|cada|qualquer|quaisquer|outro|outra|outros|outras|algum|alguma|alguns|algumas|nenhum|nenhuma|nenhuns|nenhumas|cujo|cuja|cujos|cujas|ambos|ambas|outrem|quem|onde|como)$/.test(lower)) {
            return { pos: ["PRON"], probable: true };
        }

        // SUBST: fallback — tudo que não se identificou como outra classe
        // fallback:true → nenhum padrão explícito bateu; sinaliza candidato a typo
        return { pos: ["SUBST"], probable: true, fallback: true };
    },

    async disambiguate(raw, contextTokens = []) {
        if (!raw) return null;
        const token = this.normalizeLookupKey(raw);
        const lower = token.toLowerCase();
        const tokens = contextTokens.map((t) => this.normalizeLookupKey(t));
        const idx = tokens.findIndex((t) => t === lower);
        const prev = idx > 0 ? tokens[idx - 1] : "";
        const next = idx >= 0 && idx < tokens.length - 1 ? tokens[idx + 1] : "";
        const prevEntry = prev ? await this.lookup(prev) : null;
        const nextEntry = next ? await this.lookup(next) : null;
        const prevPos = prevEntry?.pos || [];
        const nextPos = nextEntry?.pos || [];

        if (lower === "muito") {
            if (nextPos.includes("ADJ")) return { pos: ["ADV"], contextual: true };
            if (nextPos.includes("SUBST")) return { pos: ["ADJ"], contextual: true };
        }
        if (lower === "meio") {
            if (nextPos.includes("ADJ")) return { pos: ["ADV"], contextual: true };
            if (nextPos.includes("SUBST")) return { pos: ["ADJ"], contextual: true };
        }
        if (lower === "só") {
            if (nextPos.includes("VERB")) return { pos: ["ADV"], contextual: true };
            return { pos: ["ADJ"], contextual: true };
        }
        if (lower === "que") {
            if (["o", "a", "os", "as", "um", "uma", "uns", "umas"].includes(prev)) {
                return { pos: ["PRON"], contextual: true };
            }
            return { pos: ["CONJ"], contextual: true };
        }
        if (lower === "como") {
            if (["tão", "assim", "tal", "mais", "menos", "tanto"].includes(prev)) {
                return { pos: ["ADV"], contextual: true };
            }
            return { pos: ["CONJ"], contextual: true };
        }
        if (lower === "se") {
            if (nextPos.includes("VERB")) return { pos: ["PRON"], contextual: true };
            return { pos: ["CONJ"], contextual: true };
        }
        if (lower === "logo") {
            if (!prev) return { pos: ["CONJ"], contextual: true };
            return { pos: ["ADV"], contextual: true };
        }
        if (lower === "mais" || lower === "menos") {
            if (nextPos.includes("ADJ")) return { pos: ["ADV"], contextual: true };
            if (nextPos.includes("SUBST")) return { pos: ["ADJ"], contextual: true };
        }
        return null;
    }
};
