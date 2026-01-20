const entries = [
    {
        key: "hello",
        forms: ["hello", "hi", "hey"],
        defs: {
            pt: "Saudacao usada para cumprimentar.",
            "en-uk": "A greeting used when meeting someone.",
            es: "Saludo usado para decir ola.",
            fr: "Salutation pour dire bonjour."
        },
        trans: { pt: "ola", "en-uk": "hello", es: "hola", fr: "bonjour" }
    },
    {
        key: "thanks",
        forms: ["thanks", "thank", "thankyou"],
        defs: {
            pt: "Expressa gratidao.",
            "en-uk": "Used to express gratitude.",
            es: "Expresa gratitud.",
            fr: "Exprime la gratitude."
        },
        trans: { pt: "obrigado", "en-uk": "thanks", es: "gracias", fr: "merci" }
    },
    {
        key: "please",
        forms: ["please"],
        defs: {
            pt: "Forma educada de pedir algo.",
            "en-uk": "Polite word when asking for something.",
            es: "Palabra cortes para pedir algo.",
            fr: "Mot poli pour demander."
        },
        trans: { pt: "por favor", "en-uk": "please", es: "por favor", fr: "s'il vous plait" }
    },
    {
        key: "good",
        forms: ["good"],
        defs: {
            pt: "Algo de qualidade positiva.",
            "en-uk": "Something of positive quality.",
            es: "Algo de calidad positiva.",
            fr: "Quelque chose de bonne qualite."
        },
        trans: { pt: "bom", "en-uk": "good", es: "bueno", fr: "bon" }
    },
    {
        key: "bad",
        forms: ["bad"],
        defs: {
            pt: "Algo de qualidade negativa.",
            "en-uk": "Something of negative quality.",
            es: "Algo de calidad negativa.",
            fr: "Quelque chose de mauvaise qualite."
        },
        trans: { pt: "ruim", "en-uk": "bad", es: "malo", fr: "mauvais" }
    },
    {
        key: "yes",
        forms: ["yes"],
        defs: {
            pt: "Resposta afirmativa.",
            "en-uk": "An affirmative response.",
            es: "Respuesta afirmativa.",
            fr: "Reponse affirmative."
        },
        trans: { pt: "sim", "en-uk": "yes", es: "si", fr: "oui" }
    },
    {
        key: "no",
        forms: ["no"],
        defs: {
            pt: "Resposta negativa.",
            "en-uk": "A negative response.",
            es: "Respuesta negativa.",
            fr: "Reponse negative."
        },
        trans: { pt: "nao", "en-uk": "no", es: "no", fr: "non" }
    },
    {
        key: "today",
        forms: ["today"],
        defs: {
            pt: "Dia atual.",
            "en-uk": "The current day.",
            es: "El dia actual.",
            fr: "Le jour actuel."
        },
        trans: { pt: "hoje", "en-uk": "today", es: "hoy", fr: "aujourd'hui" }
    },
    {
        key: "tomorrow",
        forms: ["tomorrow"],
        defs: {
            pt: "O dia seguinte.",
            "en-uk": "The next day.",
            es: "El dia siguiente.",
            fr: "Le jour suivant."
        },
        trans: { pt: "amanha", "en-uk": "tomorrow", es: "manana", fr: "demain" }
    },
    {
        key: "yesterday",
        forms: ["yesterday"],
        defs: {
            pt: "O dia anterior.",
            "en-uk": "The previous day.",
            es: "El dia anterior.",
            fr: "Le jour precedent."
        },
        trans: { pt: "ontem", "en-uk": "yesterday", es: "ayer", fr: "hier" }
    },
    {
        key: "time",
        forms: ["time"],
        defs: {
            pt: "Medida de duracao.",
            "en-uk": "A measure of duration.",
            es: "Medida de duracion.",
            fr: "Mesure de duree."
        },
        trans: { pt: "tempo", "en-uk": "time", es: "tiempo", fr: "temps" }
    },
    {
        key: "water",
        forms: ["water"],
        defs: {
            pt: "Substancia liquida essencial.",
            "en-uk": "Essential liquid substance.",
            es: "Sustancia liquida esencial.",
            fr: "Substance liquide essentielle."
        },
        trans: { pt: "agua", "en-uk": "water", es: "agua", fr: "eau" }
    },
    {
        key: "food",
        forms: ["food"],
        defs: {
            pt: "Aquilo que alimenta.",
            "en-uk": "Something to eat.",
            es: "Algo para comer.",
            fr: "Quelque chose a manger."
        },
        trans: { pt: "comida", "en-uk": "food", es: "comida", fr: "nourriture" }
    },
    {
        key: "book",
        forms: ["book", "books"],
        defs: {
            pt: "Obra escrita encadernada.",
            "en-uk": "A written work bound together.",
            es: "Obra escrita encuadernada.",
            fr: "Oeuvre ecrite reliee."
        },
        trans: { pt: "livro", "en-uk": "book", es: "libro", fr: "livre" }
    },
    {
        key: "work",
        forms: ["work", "works"],
        defs: {
            pt: "Atividade realizada.",
            "en-uk": "An activity or job.",
            es: "Actividad o trabajo.",
            fr: "Activite ou travail."
        },
        trans: { pt: "trabalho", "en-uk": "work", es: "trabajo", fr: "travail" }
    },
    {
        key: "write",
        forms: ["write", "writes", "writing", "wrote"],
        defs: {
            pt: "Registrar palavras por escrito.",
            "en-uk": "To put words on a surface.",
            es: "Poner palabras por escrito.",
            fr: "Mettre des mots par ecrit."
        },
        trans: { pt: "escrever", "en-uk": "write", es: "escribir", fr: "ecrire" }
    },
    {
        key: "read",
        forms: ["read", "reads", "reading"],
        defs: {
            pt: "Ler e compreender texto.",
            "en-uk": "To read and understand text.",
            es: "Leer y entender texto.",
            fr: "Lire et comprendre un texte."
        },
        trans: { pt: "ler", "en-uk": "read", es: "leer", fr: "lire" }
    },
    {
        key: "friend",
        forms: ["friend", "friends"],
        defs: {
            pt: "Pessoa com quem ha amizade.",
            "en-uk": "A person you have friendship with.",
            es: "Persona con quien hay amistad.",
            fr: "Personne avec qui on a de l'amitie."
        },
        trans: { pt: "amigo", "en-uk": "friend", es: "amigo", fr: "ami" }
    },
    {
        key: "family",
        forms: ["family", "families"],
        defs: {
            pt: "Grupo de pessoas com laços.",
            "en-uk": "Group of people related to each other.",
            es: "Grupo de personas con lazos.",
            fr: "Groupe de personnes liees."
        },
        trans: { pt: "familia", "en-uk": "family", es: "familia", fr: "famille" }
    },
    {
        key: "house",
        forms: ["house", "home"],
        defs: {
            pt: "Lugar onde se vive.",
            "en-uk": "Place where one lives.",
            es: "Lugar donde se vive.",
            fr: "Lieu ou l'on vit."
        },
        trans: { pt: "casa", "en-uk": "house", es: "casa", fr: "maison" }
    }
];

const index = new Map();

const normalize = (word) => {
    return String(word || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "");
};

entries.forEach((entry) => {
    const transList = entry.trans ? Object.values(entry.trans) : [];
    const list = [entry.key, ...(entry.forms || []), ...transList];
    list.forEach((form) => {
        const key = normalize(form);
        if (key) index.set(key, entry);
    });
});

const labels = {
    pt: "PTBR",
    "en-uk": "ENG BRI",
    es: "ESP",
    fr: "FRAN"
};

const formatTranslations = (entry, current) => {
    const pairs = [];
    const order = ["pt", "en-uk", "es", "fr"];
    order.forEach((code) => {
        if (code === current) return;
        const value = entry.trans[code];
        if (value) pairs.push(`${labels[code] || code.toUpperCase()}: ${value}`);
    });
    return pairs.join(" | ");
};

const formatDefinition = (entry, current) => {
    return entry.defs[current] || entry.defs["en-uk"] || "";
};

export const lexicon = {
    lookup(word) {
        return index.get(normalize(word));
    },
    definition(entry, current) {
        return formatDefinition(entry, current);
    },
    translations(entry, current) {
        return formatTranslations(entry, current);
    }
};
