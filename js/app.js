const state = { inventory: {} };

function getFishIdName(name) {
    return name.replace(/\s+/g, '');
}

function getFishNameFromId(id) {
    return Object.keys(fishData)
        .find(name => getFishIdName(name) === id);
}

function recalculateAll() {
    let total = 0;
    let cardTotals = {};

    Object.keys(state.inventory).forEach(id => {
        const [fishId, size] = id.split('-');
        const fishName = getFishNameFromId(fishId);
        const price = fishData[fishName][size];

        const value = state.inventory[id] * price;
        total += value;

        if (!cardTotals[fishId]) cardTotals[fishId] = 0;
        cardTotals[fishId] += value;
    });

    document.getElementById('totalGems').innerText = total.toLocaleString();

    Object.keys(fishData).forEach(name => {
        const id = getFishIdName(name);
        document.getElementById(`subtotal-${id}`).innerText = "0";
    });

    Object.keys(cardTotals).forEach(fishId => {
        document.getElementById(`subtotal-${fishId}`).innerText =
            cardTotals[fishId].toLocaleString();
    });
}

function updateCount(id, change, price, fishCardId, event) {
    event.stopPropagation();

    if ((state.inventory[id] || 0) + change < 0) return;

    state.inventory[id] = (state.inventory[id] || 0) + change;

    document.getElementById(`display-${id}`).value =
        state.inventory[id];

    recalculateAll();
}

function toggleDropdown(fishId) {
    const content = document.getElementById(`content-${fishId}`);
    const arrow = document.getElementById(`arrow-${fishId}`);

    content.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
}

function resetAll() {
    if (!confirm("Reset semua hitungan?")) return;

    state.inventory = {};

    document.getElementById('totalGems').innerText = "0";

    document.querySelectorAll('[id^="display-"]').forEach(el => el.innerText = "0");
    document.querySelectorAll('[id^="subtotal-"]').forEach(el => el.innerText = "0");
}

function handleInput(id) {
    let value = document.getElementById(`display-${id}`).value;

    if (value === "" || value < 0) value = 0;

    state.inventory[id] = parseInt(value) || 0;

    recalculateAll();
}

function handleBlur(id) {
    let el = document.getElementById(`display-${id}`);
    if (el.value === "" || el.value < 0) {
        el.value = 0;
        state.inventory[id] = 0;
        recalculateAll();
    }
}

function init() {
    const container = document.getElementById('fishContainer');

    for (const [name, info] of Object.entries(fishData)) {
        const fishIdName = getFishIdName(name);

        let controlsHtml = sizeKeys.map(size => {
            const price = info[size];
            const id = `${fishIdName}-${size}`;
            state.inventory[id] = 0;

            return `
                <div class="flex flex-col items-center">
                    <span class="text-[8px] text-zinc-500 font-black mb-1 uppercase">${size}</span>
                    <button onclick="updateCount('${id}', 1, ${price}, '${fishIdName}', event)" class="w-8 h-8 bg-zinc-800 rounded-full">+</button>
                    <input
                        id="display-${id}"
                        type="number"
                        value="0"
                        min="0"
                        onclick="this.select()"
                        oninput="handleInput('${id}')"
                        onblur="handleBlur('${id}')"
                        class="w-11 text-center text-cyan-400 bg-zinc-900 border border-zinc-700 rounded mt-1"
                    >
                    <button onclick="updateCount('${id}', -1, ${price}, '${fishIdName}', event)" class="w-8 h-8 bg-zinc-800 rounded-full">-</button>
                    <span class="text-[9px] text-yellow-600">${price}</span>
                </div>
            `;
        }).join('');

        const wrapper = document.createElement('div');
        wrapper.className = "bg-zinc-800/30 border border-zinc-800 rounded-xl overflow-hidden";

        wrapper.innerHTML = `
            <div onclick="toggleDropdown('${fishIdName}')" class="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-zinc-950 border border-zinc-700 rounded flex items-center justify-center p-1">
                        <img src="${info.file}" 
                            onerror="this.src='https://static.wikia.nocookie.net/portalworldsgame/images/4/4a/Site-favicon.ico/revision/latest?cb=20210602005518'"
                            class="pixel-image max-w-full max-h-full" alt="${name}">
                    </div>
                    <h2 class="text-[11px] font-black uppercase tracking-widest text-cyan-500">${name}</h2>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right leading-none">
                        <span id="subtotal-${fishIdName}" class="font-bold text-lg text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">0</span>
                        <span class="block text-[8px] text-zinc-600 uppercase font-black tracking-tighter">Gems Earned</span>
                    </div>
                    <svg id="arrow-${fishIdName}" class="w-4 h-4 text-zinc-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            <div id="content-${fishIdName}" class="hidden p-3 pt-0 border-t border-zinc-800/50 bg-zinc-950/20">
                <div class="flex justify-between py-2 gap-1">${controlsHtml}</div>
            </div>
        `;

        container.appendChild(wrapper);
    }
}

init();