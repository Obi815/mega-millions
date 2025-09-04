document.querySelector('#btn').addEventListener('click', inputPlayers)

function inputPlayers() {
    // get number of teams
    let number = parseInt(document.querySelector('#numTeams').value);

    // clear old inputs
    const container = document.querySelector('#teamInputs');
    container.innerHTML = '';

    // create one input for each team
    for (let i = 0; i < number; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Team ${i + 1} Name`;
        input.id = `teamNames`;
        container.appendChild(input);
    }
}