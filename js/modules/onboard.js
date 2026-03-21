const ONBOARD_KEY = "skrv_onboard_v1";

const STEPS = [
  {
    n: 1,
    title: "Digite e abra atalhos",
    body: "Escreva normalmente. Quando precisar de algo, digite <code class=\"obCode\">..</code> seguido de uma letra — o painel abre dentro do próprio documento, sem sair do fluxo.",
    demo: "typing",
  },
  {
    n: 2,
    title: "Cortes vivem no documento",
    body: "Cada atalho abre um <em>corte</em> — um painel que respira junto com o texto. Clique no cabeçalho para minimizar. Arraste a tag lateral para reposicionar. Clique nas bordas para fechar.",
    demo: "slice",
  },
  {
    n: 3,
    title: "Tudo ao lado, sempre acessível",
    body: "Cada atalho abre uma aba lateral. Clique na aba para reabrir o painel quando precisar.",
    demo: "tabs",
    tabs: [
      { n: "01", label: "NOTAS" },
      { n: "02", label: "ARQUIVO" },
    ],
  },
];

function renderDemo(step) {
  if (step.demo === "typing") {
    return `
      <div class="obDemo obDemo--typing">
        <div class="obFakePage">
          <div class="obFakeLine">
            <span class="obLineText">escreva o que quiser</span><span class="obTyped"><span class="obT1">.</span><span class="obT2">.</span><span class="obT3">h</span></span><span class="obCaret"></span>
          </div>
          <div class="obFakeSlice">
            <div class="obFakeSliceHead">MENU · atalhos e comandos</div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">ajuda e atalhos</span><code class="obFakeCmd">..h</code></div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">modos de escrita</span><code class="obFakeCmd">..m</code></div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">notas laterais</span><code class="obFakeCmd">..n</code></div>
          </div>
        </div>
      </div>`;
  }
  if (step.demo === "slice") {
    return `
      <div class="obDemo obDemo--slice">
        <div class="obFakePage obFakePage--anim">
          <div class="obFakeSliceOpen">
            <div class="obFakeSliceHead obFakeSliceHead--open obFakeHead--anim">
              <span>MENU · atalhos e comandos</span>
              <span class="obFakeSliceHint">← clique para minimizar</span>
            </div>
            <div class="obFakeSliceBody">
              <div class="obFakeSliceRow"><span class="obFakeDesc">ajuda e atalhos</span><code class="obFakeCmd">..h</code></div>
              <div class="obFakeSliceRow obFakeSliceRow--alt"><span class="obFakeDesc">notas laterais</span><code class="obFakeCmd">..n</code></div>
              <div class="obFakeSliceRow"><span class="obFakeDesc">projetos e arquivos</span><code class="obFakeCmd">..a</code></div>
            </div>
          </div>
          <div class="obFakeTag obFakeTag--anim">
            <div class="obFakeTagLabel">01 MENU</div>
            <div class="obFakeTagHint">arrastar ↕</div>
          </div>
          <div class="obCursor" aria-hidden="true">
            <img src="assets/cursors/bibata-ice/pointer.svg" width="28" height="28" alt="">
          </div>
        </div>
      </div>`;
  }
  if (step.demo === "tabs") {
    return `
      <div class="obDemo obDemo--tabs">
        <div class="obTabsScene">
          <div class="obTabsPage">
            <div class="obTabsLine"></div>
            <div class="obTabsLine obTabsLine--mid"></div>
            <div class="obTabsLine obTabsLine--short"></div>
            <div class="obTabsLine obTabsLine--mid"></div>
          </div>
          <div class="obTabsDock">
            ${step.tabs.map((t, i) => `
              <div class="obTabPill" style="animation-delay:${i * 140}ms">
                <span class="obTabN">${t.n}</span>
                <span class="obTabLabel">${t.label}</span>
              </div>`).join("")}
          </div>
        </div>
      </div>`;
  }
  return "";
}

function buildOverlay() {
  const el = document.createElement("div");
  el.className = "obOverlay";
  el.id = "obOverlay";
  el.innerHTML = `
    <div class="obCard" role="dialog" aria-modal="true" aria-label="Bem-vindo ao eskrev">
      <div class="obStepWrap" id="obStepWrap"></div>
      <div class="obNav">
        <div class="obDots" id="obDots"></div>
        <div class="obBtns">
          <button class="obSkip" id="obSkip" type="button">Pular</button>
          <button class="obNext" id="obNext" type="button">Próximo</button>
        </div>
      </div>
    </div>
  `;
  return el;
}

function renderStep(overlay, idx) {
  const step = STEPS[idx];
  const wrap = overlay.querySelector("#obStepWrap");
  const dots = overlay.querySelector("#obDots");
  const next = overlay.querySelector("#obNext");
  const skip = overlay.querySelector("#obSkip");
  const isLast = idx === STEPS.length - 1;

  // dots
  dots.innerHTML = STEPS.map((_, i) =>
    `<button class="obDot${i === idx ? " is-active" : ""}" type="button" aria-label="Etapa ${i + 1}"></button>`
  ).join("");

  dots.querySelectorAll(".obDot").forEach((dot, i) => {
    dot.addEventListener("click", () => renderStep(overlay, i));
  });

  // step content
  wrap.innerHTML = `
    <div class="obStep obStep--enter">
      <div class="obStepNum">0${step.n} / 0${STEPS.length}</div>
      <h2 class="obTitle">${step.title}</h2>
      <p class="obBody">${step.body}</p>
      ${renderDemo(step)}
    </div>
  `;

  next.textContent = isLast ? "Começar →" : "Próximo →";
  skip.style.display = isLast ? "none" : "";

  // button handlers (re-bind each render)
  next.onclick = () => {
    if (isLast) {
      close(overlay);
    } else {
      renderStep(overlay, idx + 1);
    }
  };
  skip.onclick = () => close(overlay);
}

function close(overlay) {
  overlay.classList.add("obOverlay--out");
  setTimeout(() => overlay.remove(), 350);
  try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (_) {}
}

export function initOnboard() {
  try {
    if (localStorage.getItem(ONBOARD_KEY)) return;
  } catch (_) {}

  const overlay = buildOverlay();
  document.body.appendChild(overlay);

  // small delay so page renders first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add("obOverlay--in");
      renderStep(overlay, 0);
    });
  });
}
