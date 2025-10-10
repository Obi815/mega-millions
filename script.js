let vantaEffect;

document.addEventListener("DOMContentLoaded", function () {
    vantaEffect = VANTA.WAVES({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xb5791,
        shininess: 50.00,
        waveHeight: 20.00,
        waveSpeed: 0.7,
        zoom: 0.9
    });
});

window.addEventListener('resize', () => {
    if (vantaEffect) vantaEffect.resize(); // 🔁 keeps waves stretched on window change
});

// Optional: re-trigger resize when user adds content
document.querySelector('#btn').addEventListener('click', () => {
    setTimeout(() => {
        if (vantaEffect) vantaEffect.resize(); // ⏱️ give the DOM time to expand, then resize waves
    }, 300);
});



// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const playerOdds = document.querySelector('#playerOdds');
    const generateBtn = document.querySelector('#btn');

    // initially hidden
    playerOdds.classList.add('hidden');

    // click "Generate Odds" to show team inputs
    generateBtn.addEventListener('click', () => {
        inputPlayers();             // generate team input boxes
        playerOdds.classList.remove('hidden'); // show the card
    });

    // click "Calculate Odds" to generate the odds table
    document.getElementById('calcOdds').addEventListener('click', () => {
        computeAndRenderOdds();
    });
});


function inputPlayers() {
    // 1. Get the number of teams from the input field
    const number = parseInt(document.querySelector('#numTeams').value);

    // 2. Get the container where team inputs will go and clear previous content
    const container = document.querySelector('#teamInputs');
    container.innerHTML = ''; // clear old inputs, header, span, etc.

    // 3. Create a wrapper div for the header and direction span
    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = '100%';       // make it full width
    headerWrapper.style.textAlign = 'center'; // center everything inside

    // 4. Create the main header
    const header = document.createElement('h2');
    header.textContent = "Who's All Playing"; // header text

    // 5. Create the direction span under the header
    const directionSpan = document.createElement('span');
    directionSpan.textContent = "Enter Worst to Best Teams";
    directionSpan.style.display = 'block';
    directionSpan.style.marginTop = '10px';
    directionSpan.style.textAlign = 'center'; // ✅ ensures it's centered

    // 6. Append the header and span to the wrapper
    headerWrapper.appendChild(header);
    headerWrapper.appendChild(directionSpan);

    // 7. Add the wrapper to the container
    container.appendChild(headerWrapper);

    // 8. Loop to create inputs for each team
    for (let i = 0; i < number; i++) {
        const wrapper = document.createElement('div');  // wrapper for each input
        wrapper.className = 'teamWrapper';

        // Create the input field
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Team ${i + 1} Name`;
        input.id = `team-${i}`;  // unique ID for each team

        // Add the input to its wrapper
        wrapper.appendChild(input);

        // Add the wrapper to the main container
        container.appendChild(wrapper);
    }
}

// Call this after you've created the team inputs and filled them
function computeAndRenderOdds() {
    // read configuration inputs
    const N = parseInt(document.getElementById('numTeams').value, 10);
    const B = parseInt(document.getElementById('bottomTeams').value, 10);
    const P_top = parseFloat(document.getElementById('top_P').value);

    if (!Number.isInteger(N) || N <= 1) {
        alert('Enter a valid number of teams (>=2).');
        return;
    }
    if (!Number.isInteger(B) || B < 0 || B > N) {
        alert('Enter valid bottom teams (0 <= bottom <= total teams).');
        return;
    }
    if (isNaN(P_top) || P_top < 0) {
        alert('Enter a valid first pick % (>=0).');
        return;
    }

    // collect team names (assumes team-0 .. team-(N-1) exist)
    const teams = [];
    for (let i = 0; i < N; i++) {
        const el = document.getElementById(`team-${i}`);
        const name = el && el.value.trim() ? el.value.trim() : `Team ${i + 1}`;
        teams.push(name);
    }

    // SPECIAL CASE: if B == N, every team is in bottom block -> equalize
    if (B === N) {
        const equalPct = +(100 / N).toFixed(4);
        const odds = teams.map(t => ({ team: t, pct: equalPct }));
        renderOddsTable(odds);
        return;
    }

    // step A: allocate bottom block
    const bottomBlockTotal = B * P_top;
    let remainingPct = 100 - bottomBlockTotal;

    // If remainingPct <= 0, we can't give the rest negative percentage.
    // Fallback: normalize all weights equally (safe default).
    if (remainingPct <= 0) {
        // If P_top is too large, just distribute 100% proportionally:
        // bottom teams get P_top but we'll normalize so total = 100.
        // easiest: assign raw weights and normalize
        const raw = new Array(N).fill(1);
        // but we want bottom B to be heavier, so give them a factor of P_top weight:
        // We'll just use equal distribution for simplicity:
        const totalRaw = raw.reduce((s, v) => s + v, 0);
        const odds = teams.map(t => ({ team: t, pct: +(100 / N).toFixed(4) }));
        renderOddsTable(odds);
        return;
    }

    // step B: compute linear weights for remaining M teams
    const M = N - B;
    const S = (M * (M + 1)) / 2; // sum of 1..M
    const step = remainingPct / S; // percent per weight unit

    // build odds array in order worst -> best
    const odds = [];

    // bottom teams first (indices 0 .. B-1 are worst teams if your inputs follow Worst->Best)
    for (let i = 0; i < B; i++) {
        odds.push({ team: teams[i], pct: +P_top.toFixed(4) });
    }

    // remaining teams: i from 0..M-1 correspond to teams B .. N-1
    // assign weights: M, M-1, ..., 1
    for (let i = 0; i < M; i++) {
        const weight = M - i;               // largest weight goes to teams[B + 0]
        const pct = +(weight * step).toFixed(4);
        odds.push({ team: teams[B + i], pct });
    }

    // rounding may introduce a tiny error. Fix by adjusting last entry so total = 100
    let total = odds.reduce((s, o) => s + o.pct, 0);
    total = +(total.toFixed(6));
    const diff = +(100 - total).toFixed(6);
    if (Math.abs(diff) > 0.0001) {
        // add diff to the best team (last in odds array)
        odds[odds.length - 1].pct = +((odds[odds.length - 1].pct + diff).toFixed(4));
    }

    renderOddsTable(odds);
}

// Helper: renders a simple table in #oddsTable
function renderOddsTable(oddsArr) {
    const container = document.getElementById('oddsTable');
    container.innerHTML = ''; // clear previous

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '1.25rem';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>
        <th style="text-align:left; padding:8px; border-bottom:2px solid #444;">Team</th>
        <th style="text-align:right; padding:8px; border-bottom:2px solid #444;">% for #1 pick</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    oddsArr.forEach((o, idx) => {
        const tr = document.createElement('tr');

        const tdTeam = document.createElement('td');
        tdTeam.textContent = o.team;
        tdTeam.style.padding = '8px';

        const tdPct = document.createElement('td');
        tdPct.textContent = `${+(o.pct).toFixed(2)}%`;
        tdPct.style.padding = '8px';
        tdPct.style.textAlign = 'right';

        //  Add border only if NOT the last row
        if (idx !== oddsArr.length - 1) {
            tdTeam.style.borderBottom = '1px solid #ddd';
            tdPct.style.borderBottom = '1px solid #ddd';
        }

        tr.appendChild(tdTeam);
        tr.appendChild(tdPct);
        tbody.appendChild(tr);
    });


    table.appendChild(tbody);
    container.appendChild(table);

    // 🎲 Run a weighted lottery draw based on the odds table
    document.getElementById('runLottery').addEventListener('click', () => {
        runLottery();

        lotteryResults.classList.remove('hidden'); // show results
    });

    function runLottery() {

        const table = document.querySelector('#oddsTable table');
        if (!table) {
            alert('Please calculate odds first.');
            return;
        }

        // 1️ Read team names and percentages from the odds table
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const teams = rows.map(row => {
            const tds = row.querySelectorAll('td');
            return {
                team: tds[0].textContent.trim(),
                pct: parseFloat(tds[1].textContent.replace('%', '').trim())
            };
        });

        // 2️ Create a weighted pool
        const pool = [];
        teams.forEach(t => {
            const weight = Math.round(t.pct * 100); // higher pct = more entries
            for (let i = 0; i < weight; i++) pool.push(t.team);
        });

        // 3️ Shuffle and draw without replacement
        const results = [];
        const tempPool = [...pool];

        while (teams.length > 0) {
            const rand = Math.floor(Math.random() * tempPool.length);
            const winner = tempPool[rand];

            // find the first team in teams list that matches winner and remove it
            const idx = teams.findIndex(t => t.team === winner);
            if (idx !== -1) {
                results.push(teams[idx].team);
                teams.splice(idx, 1);
                // remove all occurrences of that team from pool
                for (let i = tempPool.length - 1; i >= 0; i--) {
                    if (tempPool[i] === winner) tempPool.splice(i, 1);
                }
            }
        }

        // 4️ Show results
        const resultsDiv = document.getElementById('lotteryResults');
        resultsDiv.innerHTML = '<h2>🏆 Draft Order</h2>';

        const list = document.createElement('ol');
        results.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            list.appendChild(li);
        });

        resultsDiv.appendChild(list);
    }

}



