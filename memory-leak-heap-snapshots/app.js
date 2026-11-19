// Laboratório didático: os dois cenários são independentes.
const leakMount = document.querySelector("#leakMount");
const fixedMount = document.querySelector("#fixedMount");
const leakStatus = document.querySelector("#leakStatus");
const fixedStatus = document.querySelector("#fixedStatus");

const leakedClosures = [];
const leakedTimers = [];
const leakedHandlers = [];

let fixedResources = [];

function createLargePayload(seed) {
  // Array de strings para tornar o crescimento visível no Heap Snapshot.
  return Array.from({ length: 50000 }, (_, i) => `payload-${seed}-${i}`);
}

// ---------------- CENÁRIO VULNERÁVEL ----------------
function startLeak() {
  for (let cycle = 0; cycle < 10; cycle++) {
    const payload = createLargePayload(cycle);
    const node = document.createElement("button");
    node.className = "leak-item";
    node.textContent = `Leak ${cycle}`;

    // A closure retém o array inteiro.
    const handler = () => {
      node.title = payload[0];
    };

    node.addEventListener("click", handler);
    leakMount.appendChild(node);

    // Referências globais impedem que closure/array/elemento sejam coletados.
    leakedClosures.push(handler);
    leakedHandlers.push({ node, handler, payload });

    // Timer recorrente mantém a closure viva e nunca é cancelado.
    const timerId = setInterval(() => {
      node.dataset.first = payload[0];
    }, 60000);
    leakedTimers.push(timerId);
  }

  leakStatus.textContent =
    `Vazamento executado. Closures: ${leakedClosures.length}; timers: ${leakedTimers.length}.`;
  console.warn("[LEAK] ciclos acumulados:", leakedHandlers.length);
}

function showLeak() {
  // Não remove nada: demonstra que as referências continuam ativas.
  console.log("[LEAK] handlers/timers retidos:", leakedHandlers.length, leakedTimers.length);
}

// ---------------- CENÁRIO CORRIGIDO ----------------
function runFixed() {
  cleanupFixed();

  for (let cycle = 0; cycle < 10; cycle++) {
    const payload = createLargePayload(`fixed-${cycle}`);
    const node = document.createElement("button");
    node.className = "fixed-item";
    node.textContent = `Fixed ${cycle}`;

    const resource = {
      node,
      timerId: null,
      handler: null,
      payload
    };

    resource.handler = () => {
      node.title = resource.payload?.[0] ?? "liberado";
    };

    node.addEventListener("click", resource.handler);
    fixedMount.appendChild(node);

    resource.timerId = setInterval(() => {
      node.dataset.first = resource.payload?.[0] ?? "";
    }, 60000);

    fixedResources.push(resource);
  }

  fixedStatus.textContent =
    `Cenário corrigido executado. Recursos ativos: ${fixedResources.length}.`;
  console.info("[FIXED] recursos ativos:", fixedResources.length);
}

function cleanupFixed() {
  for (const resource of fixedResources) {
    clearInterval(resource.timerId);
    resource.node.removeEventListener("click", resource.handler);
    resource.node.remove();
    resource.payload = null;
    resource.handler = null;
    resource.node = null;
  }

  fixedResources = [];
  fixedStatus.textContent = "Cleanup concluído: timers cancelados, listeners removidos e referências liberadas.";
  console.info("[FIXED] cleanup concluído; recursos ativos:", fixedResources.length);
}

document.querySelector("#startLeak").addEventListener("click", startLeak);
document.querySelector("#showLeak").addEventListener("click", showLeak);
document.querySelector("#runFixed").addEventListener("click", runFixed);
document.querySelector("#cleanupFixed").addEventListener("click", cleanupFixed);

// Útil para conferir apenas números, sem imprimir objetos retidos no Console.
window.memoryLab = {
  leakCounts: () => ({
    closures: leakedClosures.length,
    timers: leakedTimers.length,
    handlers: leakedHandlers.length
  }),
  fixedCount: () => fixedResources.length
};
