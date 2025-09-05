document.querySelector('#btn').addEventListener('click', inputPlayers)

function inputPlayers() {
    let number = parseInt(document.querySelector('#numTeams').value);
    const container = document.querySelector('#teamInputs');
    container.innerHTML = '';

    for (let i = 0; i < number; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'teamWrapper';  // new container for flex styling

        players = document.querySelector('h2').innerHTML = "Who's All Playing"

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Team ${i + 1} Name`;
        input.id = `teamNames`;

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}