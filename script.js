let vantaEffect;

document.addEventListener("DOMContentLoaded", () => {
    // --- VANTA BACKGROUND ---
    vantaEffect = VANTA.WAVES({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0xb5791,
        shininess: 50,
        waveHeight: 20,
        waveSpeed: 0.7,
        zoom: 0.9
    });

    window.addEventListener('resize', () => {
        if (vantaEffect) vantaEffect.resize();
    });

    // --- HELP POPUP ---
    const helpLink = document.getElementById('helpLink');
    const helpCard = document.getElementById('helpCard');
    const closeHelp = document.getElementById('closeHelp');
    const closeHelpX = document.getElementById('closeHelpX');

    // Open popup
    helpLink.addEventListener('click', () => helpCard.classList.remove('hidden'));

    // Close popup
    closeHelp.addEventListener('click', () => helpCard.classList.add('hidden'));
    closeHelpX.addEventListener('click', () => helpCard.classList.add('hidden'));

    // Close popup if clicked outside content
    helpCard.addEventListener('click', (e) => {
        if (e.target === helpCard) helpCard.classList.add('hidden');
    });

    // --- TEAM INPUTS & ODDS ---
    const playerOdds = document.querySelector('#playerOdds');
    const generateBtn = document.querySelector('#btn');
    playerOdds.classList.add('hidden');

    generateBtn.addEventListener('click', () => {
        inputPlayers();
        playerOdds.classList.remove('hidden');

        // Resize Vanta after DOM update
        if (vantaEffect) setTimeout(() => vantaEffect.resize(), 300);
    });

    document.getElementById('calcOdds').addEventListener('click', computeAndRenderOdds);
    document.getElementById('runLottery').addEventListener('click', () => {
        runLottery();
        document.getElementById('lotteryResults').classList.remove('hidden');
    });
});

// --- CREATE TEAM INPUTS ---
function inputPlayers() {
    const number = parseInt(document.getElementById('numTeams').value);
    const container = document.getElementById('teamInputs');
    container.innerHTML = '';

    // Header + instruction span
    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = '100%';
    headerWrapper.style.textAlign = 'center';

    const header = document.createElement('h2');
    header.textContent = "Who's All Playing";

    const directionSpan = document.createElement('span');
    directionSpan.textContent = "Enter Worst to Best Teams";
    directionSpan.style.display = 'block';
    directionSpan.style.marginTop = '10px';

    headerWrapper.appendChild(header);
    headerWrapper.appendChild(directionSpan);
    container.appendChild(headerWrapper);

    // Team inputs
    for (let i = 0; i < number; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'teamWrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Team ${i + 1} Name`;
        input.id = `team-${i}`;

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}

// --- CALCULATE ODDS ---
function computeAndRenderOdds() {
    const N = parseInt(document.getElementById('numTeams').value);
    const B = parseInt(document.getElementById('bottomTeams').value);
    const P_top = parseFloat(document.getElementById('top_P').value);

    if (!Number.isInteger(N) || N <= 1) { alert('Enter a valid number of teams (>=2).'); return; }
    if (!Number.isInteger(B) || B < 0 || B > N) { alert('Enter valid bottom teams'); return; }
    if (isNaN(P_top) || P_top < 0) { alert('Enter a valid first pick %'); return; }

    const teams = [];
    for (let i = 0; i < N; i++) {
        const el = document.getElementById(`team-${i}`);
        const name = el && el.value.trim() ? el.value.trim() : `Team ${i + 1}`;
        teams.push(name);
    }

    let odds = [];

    if (B === N) {
        const equalPct = +(100 / N).toFixed(4);
        odds = teams.map(t => ({ team: t, pct: equalPct }));
    } else {
        const bottomBlockTotal = B * P_top;
        let remainingPct = 100 - bottomBlockTotal;
        if (remainingPct <= 0) {
            odds = teams.map(t => ({ team: t, pct: +(100 / N).toFixed(4) }));
        } else {
            const M = N - B;
            const S = (M * (M + 1)) / 2;
            const step = remainingPct / S;

            // Bottom teams
            for (let i = 0; i < B; i++) odds.push({ team: teams[i], pct: +P_top.toFixed(4) });

            // Remaining teams
            for (let i = 0; i < M; i++) {
                const weight = M - i;
                const pct = +(weight * step).toFixed(4);
                odds.push({ team: teams[B + i], pct });
            }
        }
    }

    // Fix rounding
    const total = odds.reduce((s, o) => s + o.pct, 0);
    const diff = +(100 - total).toFixed(6);
    if (Math.abs(diff) > 0.0001) odds[odds.length - 1].pct += diff;

    renderOddsTable(odds);
}

// --- RENDER ODDS TABLE ---
function renderOddsTable(oddsArr) {
    const container = document.getElementById('oddsTable');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
      <th style="text-align:left; padding:8px; border-bottom:2px solid #444;">Team</th>
      <th style="text-align:right; padding:8px; border-bottom:2px solid #444;">% for #1 pick</th>
    </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    oddsArr.forEach((o, idx) => {
        const tr = document.createElement('tr');
        const tdTeam = document.createElement('td'); tdTeam.textContent = o.team; tdTeam.style.padding = '8px';
        const tdPct = document.createElement('td'); tdPct.textContent = `${+(o.pct).toFixed(2)}%`; tdPct.style.padding = '8px'; tdPct.style.textAlign = 'right';
        if (idx !== oddsArr.length - 1) { tdTeam.style.borderBottom = '1px solid #ddd'; tdPct.style.borderBottom = '1px solid #ddd'; }
        tr.appendChild(tdTeam); tr.appendChild(tdPct);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// --- RUN LOTTERY ---
function runLottery() {
    const table = document.querySelector('#oddsTable table');
    if (!table) { alert('Please calculate odds first.'); return; }

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const teams = rows.map(row => {
        const tds = row.querySelectorAll('td');
        return { team: tds[0].textContent.trim(), pct: parseFloat(tds[1].textContent.replace('%', '').trim()) };
    });

    const pool = [];
    teams.forEach(t => { for (let i = 0; i < Math.round(t.pct * 100); i++) pool.push(t.team); });

    const results = [];
    let remainingTeams = [...teams];
    const tempPool = [...pool];

    while (remainingTeams.length > 0) {
        const rand = Math.floor(Math.random() * tempPool.length);
        const winner = tempPool[rand];
        const idx = remainingTeams.findIndex(t => t.team === winner);
        if (idx !== -1) {
            results.push(remainingTeams[idx].team);
            remainingTeams.splice(idx, 1);
            for (let i = tempPool.length - 1; i >= 0; i--) if (tempPool[i] === winner) tempPool.splice(i, 1);
        }
    }

    const resultsDiv = document.getElementById('lotteryResults');
    resultsDiv.innerHTML = '<h2>🏆 Draft Order</h2>';
    const list = document.createElement('ol');
    results.forEach(t => { const li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
    resultsDiv.appendChild(list);
}





