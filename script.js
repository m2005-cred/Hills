
/* =================================
   1. SELECT THE HTML ELEMENTS
================================= */

const playerCountInput = document.querySelector(
    ".player-count-input"
);

const continueButton = document.querySelector(
    ".continue-btn"
);

const gameScreens = document.querySelectorAll(
    ".game-screen"
);


/* =================================
   2. STORE THE NUMBER OF PLAYERS
================================= */

let numberOfPlayers = 0;


/* =================================
   3. CREATE A SCREEN NAVIGATION FUNCTION
================================= */

function showScreen(screenClass) {

    gameScreens.forEach(function(screen) {

        const isActive = screen.classList.contains(
            screenClass
        );

        screen.hidden = !isActive;

        screen.classList.toggle(
            "active",
            isActive
        );

    });

}


/* =================================
   4. HANDLE THE CONTINUE BUTTON
================================= */

continueButton.addEventListener("click", function() {

    const playerCount = Number(playerCountInput.value);

    if (
        playerCountInput.value.trim() === "" ||
        !Number.isInteger(playerCount) ||
        playerCount < 2
    ) {
        alert("Please enter a whole number of at least 2 players.");
        return;
    }

    numberOfPlayers = playerCount;

    showScreen("difficulty-section");

    console.log("Number of players:", numberOfPlayers);

});


/* =================================
   STEP 2: DIFFICULTY SELECTION
================================= */

// Select all three difficulty buttons
const difficultyButtons = document.querySelectorAll(
    ".difficulty-btn"
);

// Select the difficulty Continue button
const difficultyContinueButton = document.querySelector(
    ".difficulty-continue-btn"
);

// Store the selected difficulty
let selectedDifficulty = "vanilla";


// Listen for clicks on each difficulty button
difficultyButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove the selection from every button
        difficultyButtons.forEach(function(otherButton) {

            otherButton.classList.remove("selected");

            otherButton.setAttribute(
                "aria-pressed",
                "false"
            );

        });

        // Select the button that was clicked
        button.classList.add("selected");

        button.setAttribute("aria-pressed", "true");

        // Save its data-level value
        selectedDifficulty = button.dataset.level;

        console.log("Selected difficulty:", selectedDifficulty);

    });

});


// Continue to the player registration screen
difficultyContinueButton.addEventListener("click", function() {

    console.log("Final difficulty:", selectedDifficulty);

    showScreen("players-screen");

});


/* =================================
   STEP 3: PLAYER REGISTRATION
================================= */

// Select the HTML elements
const playerNameInput = document.querySelector(
    ".player-name-input"
);

const addPlayerButton = document.querySelector(
    ".add-player-btn"
);

const playerList = document.querySelector(
    ".player-list"
);

const startGameButton = document.querySelector(
    ".start-game-btn"
);


// Store registered player names
const players = [];


// Disable Start Game until everyone is registered
startGameButton.disabled = true;


// Update the Start Game button
function updateStartButton() {

    startGameButton.disabled =
        players.length !== numberOfPlayers;

}


// Add a player when Add Player is clicked
addPlayerButton.addEventListener("click", function() {

    // Get the name and remove extra spaces
    const playerName = playerNameInput.value.trim();


    // Check that a name was entered
    if (playerName === "") {
        alert("Please enter a player name.");
        return;
    }


    // Check whether all player slots are filled
    if (players.length >= numberOfPlayers) {
        alert("All players have already been added.");
        return;
    }


    // Prevent duplicate names (ignoring letter case)
    const nameAlreadyExists = players.some(function(player) {
        return player.toLowerCase() === playerName.toLowerCase();
    });

    if (nameAlreadyExists) {
        alert("That player name has already been used.");
        return;
    }


    // Store the player's name
    players.push(playerName);


    // Create a list item for the player
    const listItem = document.createElement("li");

    listItem.textContent =
        players.length + ". " + playerName;


    // Add the list item to the HTML list
    playerList.appendChild(listItem);


    // Clear the input for the next player
    playerNameInput.value = "";


    // Update the Start Game button
    updateStartButton();


    // Display progress in the console
    console.log("Registered players:", players);

    console.log(
        "Players remaining:",
        numberOfPlayers - players.length
    );

});


// Start the game after all players are registered
startGameButton.addEventListener("click", function() {

    if (players.length !== numberOfPlayers) {
        alert("Please add all players before starting.");
        return;
    }

    console.log("Starting Truth or Dare!");

    console.log("Players:", players);

    console.log("Difficulty:", selectedDifficulty);

    showScreen("gameplay-section");
    startGameplay();

});



/* =================================
   STEP 4: GAMEPLAY ELEMENTS
================================= */

// Select the gameplay HTML elements
const currentPlayerName = document.querySelector(
    ".current-player-name"
);

const challengeTypeText = document.querySelector(
    ".challenge-type"
);

const challengeText = document.querySelector(
    ".challenge-text"
);

const truthButton = document.querySelector(
    ".truth-btn"
);

const dareButton = document.querySelector(
    ".dare-btn"
);

const nextPlayerButton = document.querySelector(
    ".next-player-btn"
);


// Track whose turn it is
let currentPlayerIndex = 0;

// Store challenges already shown during this game
const usedChallenges = {
    truth: [],
    dare: []
};

// Display the current player's name
function updateCurrentPlayer() {
    currentPlayerName.textContent =
        players[currentPlayerIndex] + "'s Turn";
}


// Initialise gameplay after all players are registered
function startGameplay() {
    currentPlayerIndex = 0;

    updateCurrentPlayer();

    challengeTypeText.textContent = "YOUR CHALLENGE";

    challengeText.textContent =
        "Choose Truth or Dare to begin!";
}


// Connect the Truth and Dare buttons to the API
truthButton.addEventListener("click", function() {
    generateChallenge("truth");
});

dareButton.addEventListener("click", function() {
    generateChallenge("dare");
});


// Move to the next player
nextPlayerButton.addEventListener("click", function() {
    currentPlayerIndex =
        (currentPlayerIndex + 1) % players.length;

    updateCurrentPlayer();

    challengeTypeText.textContent = "YOUR CHALLENGE";

    challengeText.textContent =
        "Choose Truth or Dare to begin!";
});





async function generateChallenge(type) {
    challengeTypeText.textContent =
        type === "truth" ? "TRUTH" : "DARE";

    challengeText.textContent = "Finding your challenge...";

    truthButton.disabled = true;
    dareButton.disabled = true;

    try {
        const rating = selectedDifficulty === "vanilla"
            ? "pg"
            : selectedDifficulty === "spicy"
                ? "pg13"
                : "r";

        let challenge = "";
        let attempts = 0;
        const maxAttempts = 5;

        // Keep requesting challenges until we find a new one
        while (attempts < maxAttempts) {
            const response = await fetch(
                `https://api.truthordarebot.xyz/v1/${type}?rating=${rating}`
            );

            if (!response.ok) {
                throw new Error("Could not get a challenge.");
            }

            const data = await response.json();

            if (!data.question) {
                throw new Error("No challenge was returned.");
            }

            challenge = data.question.trim();
            attempts++;

            // Stop if this challenge has not appeared before
            const alreadyUsed = usedChallenges[type].some(
                function(previousChallenge) {
                    return previousChallenge.toLowerCase() ===
                        challenge.toLowerCase();
                }
            );

            if (!alreadyUsed) {
                break;
            }

            challenge = "";
        }

        if (challenge === "") {
            challengeText.textContent =
                "No new challenge found after several attempts. Please try again!";
            return;
        }

        // Remember this challenge
        usedChallenges[type].push(challenge);

        // Display it
        challengeText.textContent = challenge;

        console.log("Used challenges:", usedChallenges);

    } catch (error) {
        console.error("Challenge error:", error);

        challengeText.textContent =
            "We couldn't load a challenge. Please try again.";

    } finally {
        truthButton.disabled = false;
        dareButton.disabled = false;
    }
}
