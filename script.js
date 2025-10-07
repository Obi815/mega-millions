document.querySelector('#btn').addEventListener('click', inputPlayers);

function inputPlayers() {
    const number = parseInt(document.querySelector('#numTeams').value);
    const container = document.querySelector('#teamInputs');
    container.innerHTML = ''; // clear old content

    // Create header
    const header = document.createElement('h2');
    header.textContent = "Who's All Playing";
    header.style.textAlign = 'center';
    container.appendChild(header);

    // Create inputs
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

