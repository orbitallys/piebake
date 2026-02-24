const screens = {
    menu: document.getElementById('menu-screen'),
    game: document.getElementById('game-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    finished: document.getElementById('finished-screen')
};

const selectSound = new Audio('assets/select.wav');
const placeSound = new Audio('assets/place.wav');
const finishSound = new Audio('assets/finish.wav');
const bonkSound = new Audio('assets/bonk.wav');

const MAX_INGREDIENTS = 55;
let totalIngredients = 0;
let currentPlayerName = "Guest";
let counts = {
    marshmallowsnack: 0, travis: 0, sapple: 0, pleeds: 0, gummyguy: 0, candy: 0, smore: 0
};

const goldenStandard = {
    travis: 9, smore: 10, marshmallowsnack: 3, gummyguy: 5, sapple: 8, pleeds: 4, candy: 0
};

const counterEl = document.getElementById('counter');
const pieDishEl = document.getElementById('pie-dish');
const btnBake = document.getElementById('btn-bake');

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

document.getElementById('btn-begin').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name').value.trim();
    if (nameInput) currentPlayerName = nameInput;
    resetGame();
    showScreen('game');
});

document.getElementById('btn-leaderboard').addEventListener('click', () => {
    renderLeaderboard();
    showScreen('leaderboard');
});

document.querySelectorAll('#btn-back-menu, #btn-menu-from-finish').forEach(btn => {
    btn.addEventListener('click', () => showScreen('menu'));
});

let draggedItem = null;

document.querySelectorAll('.ingredient').forEach(ing => {
    ing.addEventListener('pointerdown', (e) => {
        e.preventDefault(); 

        selectSound.currentTime = 0;
        selectSound.play();
        
        draggedItem = ing.cloneNode(true);
        
        draggedItem.style.position = 'fixed';
        draggedItem.style.pointerEvents = 'none';
        draggedItem.style.zIndex = '9999';
        draggedItem.style.margin = '0';
        
        document.body.appendChild(draggedItem);
        
        moveAt(e.clientX, e.clientY);
    });
});

document.addEventListener('pointermove', (e) => {
    if (!draggedItem) return;
    moveAt(e.clientX, e.clientY);
});

document.addEventListener('pointerup', (e) => {
    if (!draggedItem) return;
    
    let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
    
    if (elemBelow && elemBelow.closest('#right-table')) {
        if (totalIngredients < MAX_INGREDIENTS) {
            const type = draggedItem.getAttribute('data-type');
            if (type && counts[type] !== undefined) {
                counts[type]++;
                totalIngredients++;
                placeSound.currentTime = 0;
                placeSound.play();
                updateGameView();
            }
        } else {
            bonkSound.currentTime = 0;
            bonkSound.play();
        }
    }
    
    draggedItem.remove();
    draggedItem = null;
});

function moveAt(clientX, clientY) {
    draggedItem.style.left = (clientX - 30) + 'px'; 
    draggedItem.style.top = (clientY - 30) + 'px';
}

function getAlias(ingType) {
    return ingType === 'sapple' ? 'apple' : ingType;
}

function getMajorityAndSecond() {
    let sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { majority: sorted[0], second: sorted[1] };
}

function updateGameView() {
    counterEl.innerText = `${totalIngredients}/${MAX_INGREDIENTS}`;
    
    if (totalIngredients > 0) {
        btnBake.style.display = 'block';
        const { majority } = getMajorityAndSecond();
        const alias = getAlias(majority);
        
        let stage = 1;
        if (totalIngredients > 18) stage = 2;
        if (totalIngredients > 37) stage = 3;
        
        pieDishEl.src = `assets/piedish${stage}_${alias}.png`;
    }
}

btnBake.addEventListener('click', finishGame);

function finishGame() {
    finishSound.currentTime = 0;
    finishSound.play();
    let diff = 0;
    for (let key in counts) {
        diff += Math.abs(counts[key] - goldenStandard[key]);
    }
    const accuracy = Math.max(0, 100 - (diff * 2));
    
    const { majority, second } = getMajorityAndSecond();
    const majorityAlias = getAlias(majority);
    
    document.getElementById('accuracy-text').innerText = `Accuracy: ${accuracy}%`;
    document.getElementById('finished-pie').src = `assets/piefinished${majorityAlias}.png`;
    
    const topping = document.getElementById('topping-ingredient');
    if (counts[second] > 0) {
        topping.src = `assets/${second}.png`;
        topping.style.display = 'block';
    } else {
        topping.style.display = 'none';
    }
    
    saveToLeaderboard(currentPlayerName, accuracy);
    showScreen('finished');
}

function resetGame() {
    for (let key in counts) counts[key] = 0;
    totalIngredients = 0;
    counterEl.innerText = `0/${MAX_INGREDIENTS}`;
    pieDishEl.src = 'assets/piedish.png';
    btnBake.style.display = 'none';
}

function saveToLeaderboard(name, accuracy) {
    let board = JSON.parse(localStorage.getItem('pieLeaderboard')) || [];
    board.push({ name, accuracy });
    board.sort((a, b) => b.accuracy - a.accuracy);
    board = board.slice(0, 10);
    localStorage.setItem('pieLeaderboard', JSON.stringify(board));
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    let board = JSON.parse(localStorage.getItem('pieLeaderboard')) || [];
    
    if (board.length === 0) {
        list.innerHTML = '<li>No pies baked yet!</li>';
    } else {
        board.forEach((entry, index) => {
            let li = document.createElement('li');
            li.innerText = `${index + 1}. ${entry.name} - ${entry.accuracy}%`;
            list.appendChild(li);
        });
    }
}

(function() {
    const leftAds = ['assets/ad-left.png', 'assets/ad-left2.png', 'assets/ad-left3.png'];
    const rightAds = ['assets/ad-right.png', 'assets/ad-right2.png', 'assets/ad-right3.png'];

    function updateAds() {
        const leftAdEl = document.getElementById('ad-left');
        const rightAdEl = document.getElementById('ad-right');
        
        if (leftAdEl) {
            leftAdEl.src = leftAds[Math.floor(Math.random() * leftAds.length)];
        }
        if (rightAdEl) {
            rightAdEl.src = rightAds[Math.floor(Math.random() * rightAds.length)];
        }
        
        const nextSwapTime = Math.floor(Math.random() * (40000 - 20000 + 1) + 20000);
        setTimeout(updateAds, nextSwapTime);
    }

    updateAds();

})();
