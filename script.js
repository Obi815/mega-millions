// Add event listener to the "Generate Odds" button
document.querySelector('#btn').addEventListener('click', inputPlayers);

function inputPlayers() {
    // 1. Get the number of teams from the input field
    const number = parseInt(document.querySelector('#numTeams').value);

    // 2. Get the container where team inputs will go and clear previous content
    const container = document.querySelector('#teamInputs');
    container.innerHTML = ''; // clear old inputs, header, span, etc.

    // 3. Create a wrapper div for the header and direction span
    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = '100%';       // make it full-width so text can be centered
    headerWrapper.style.textAlign = 'center'; // center everything inside

    // 4. Create the main header
    const header = document.createElement('h2');
    header.textContent = "Who's All Playing"; // header text

    // 5. Create the direction span under the header
    const directionSpan = document.createElement('span');
    directionSpan.textContent = " Enter Worst to Best Teams";
    directionSpan.style.display = 'block';    // make span block-level so it goes under header
    directionSpan.style.marginTop = '10px';   // spacing between header and span

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



