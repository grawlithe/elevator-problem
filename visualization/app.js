import Elevator from '../elevator.js';
import Person from '../person.js';

const elevator = new Elevator();
const BUILDING_MAX_FLOOR = 10;
const FLOOR_HEIGHT = 50; // Should match CSS roughly or be calculated
// In CSS I used flex space-between, so dynamic height might be tricky.
// Let's force strict positioning for smoother animation.

// Modify Elevator to emit events or we just poll it?
// Polling/Game Loop is easier given the 'dispatch' loop is currently blocking/synchronous in the class.
// PROBLEM: The current `dispatch()` running `while` loop is synchronous. 
// It will freeze the browser until done. 
// We need to monkey-patch or subclass Elevator to be async or tick-based for animation.

// Solution: We will NOT call `dispatch()` directly from the UI.
// Instead, we will run a `gameLoop` in the UI that calls a single-step `tick()` method 
// or I will modify `elevator.js` to support a `step()` method.
// Looking at `elevator.js`, `move()` is the single unit of work.
// I can implement a `tick()` here that calls `updateDirection` then `move` if there is work.

// Initialize UI
const floorsContainer = document.getElementById('floors-container');
const elevatorCar = document.getElementById('elevator-car');
const logOutput = document.getElementById('log-output');

// Render Floors
for (let i = 0; i <= BUILDING_MAX_FLOOR; i++) {
    const floorDiv = document.createElement('div');
    floorDiv.className = 'floor';
    floorDiv.id = `floor-${i}`;
    floorDiv.style.height = `${FLOOR_HEIGHT}px`; // Force height for math
    floorDiv.innerHTML = `
    <span class="floor-label">${i}</span>
    <div class="waiting-people" id="waiting-${i}"></div>
  `;
    // Prepend because flex-direction is column-reverse? 
    // actually column-reverse handles visual order, DOM order: 0 at end? 
    // Let's stick to appending and letting CSS handle 0 at bottom.
    floorsContainer.appendChild(floorDiv);
}

// Override CSS to ensure precise pixel mapping
document.querySelector('.building').style.height = `${(BUILDING_MAX_FLOOR + 1) * FLOOR_HEIGHT + 40}px`;
document.querySelector('.floors').style.justifyContent = 'flex-start'; // Stack from bottom if reversed?
// Actually simpler: Position Absolute for elevator, relative floors.
// Let's trust the math: floor 0 is at bottom: 0.
// bottom style = currentFloor * FLOOR_HEIGHT.

// State Logging
function log(msg) {
    const p = document.createElement('p');
    p.textContent = `> ${msg}`;
    logOutput.prepend(p);
}

// Update UI
function updateUI() {
    // Elevator Position
    elevatorCar.style.bottom = `${elevator.currentFloor * FLOOR_HEIGHT}px`;

    // Elevator Content
    document.querySelector('.riders-count').textContent = elevator.riders.length;

    // Stats
    document.getElementById('stat-floor').textContent = elevator.currentFloor;
    document.getElementById('stat-direction').textContent = elevator.direction;
    document.getElementById('stat-riders').textContent = elevator.riders.length;
    document.getElementById('stat-traversed').textContent = elevator.floorsTraversed;
    document.getElementById('stat-stops').textContent = elevator.stops;

    // Waiting People
    // Clear all waiting
    for (let i = 0; i <= BUILDING_MAX_FLOOR; i++) {
        const waitingDiv = document.getElementById(`waiting-${i}`);
        waitingDiv.innerHTML = '';
    }

    // Add Requests
    elevator.requests.forEach(req => {
        const waitingDiv = document.getElementById(`waiting-${req.currentFloor}`);
        const span = document.createElement('span');
        span.textContent = `👤${req.name}→${req.dropOffFloor} `;
        span.style.color = 'red';
        waitingDiv.appendChild(span);
    });
}

// Logic ticker
let isSimulationRunning = false;
const toggleBtn = document.getElementById('toggle-sim-btn');

setInterval(() => {
    if (isSimulationRunning && (elevator.requests.length > 0 || elevator.riders.length > 0)) {
        // Perform one step
        // We need to access `updateDirection` and `move` from elevator.
        // They are methods on the instance.

        // Check if we need to log stops
        const stations = elevator.stops;

        elevator.updateDirection();
        elevator.move();

        if (elevator.stops > stations) {
            log(`Stopped at Floor ${elevator.currentFloor}.`);
        }

        updateUI();
    }
}, 500); // 500ms per floor move

// Controls
document.getElementById('add-request-btn').addEventListener('click', () => {
    const name = document.getElementById('person-name').value;
    const current = parseInt(document.getElementById('current-floor').value);
    const dropoff = parseInt(document.getElementById('dropoff-floor').value);

    if (isNaN(current) || isNaN(dropoff)) return;

    const person = new Person(name, current, dropoff);
    elevator.requests.push(person);

    log(`Queued: ${name} at ${current} going to ${dropoff}`);
    updateUI();
});

toggleBtn.addEventListener('click', () => {
    isSimulationRunning = !isSimulationRunning;
    if (isSimulationRunning) {
        toggleBtn.textContent = 'Pause Simulation';
        toggleBtn.style.backgroundColor = '#e67e22'; // Orange for pause
        log('Simulation Started.');
    } else {
        toggleBtn.textContent = 'Resume Simulation';
        toggleBtn.style.backgroundColor = '#27ae60'; // Green for start
        log('Simulation Paused.');
    }
});

log('Ready. Queue requests then click Start.');
updateUI();
