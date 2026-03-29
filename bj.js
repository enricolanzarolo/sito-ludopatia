// FILE: bj.js
// =======================
// Blackjack Dinamico JS - CORRETTO
// =======================

let saldo = 100;
let bet = 10;
let mazzo = [];
let playerCards = [];
let dealerCards = [];
let gameActive = false;
let dealerTurn = false;

const balanceValue = document.getElementById("balance-value");
const betValue = document.getElementById("bet-value");
const betConfirm = document.getElementById("bet-confirm");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const resetBtn = document.getElementById("reset-btn");
const rulesBtn = document.getElementById("rules-btn");
const playerCardsBox = document.getElementById("bj-cards-player");
const dealerCardsBox = document.getElementById("bj-cards-dealer");
const playerScoreElem = document.getElementById("player-score");
const dealerScoreElem = document.getElementById("dealer-score");
const resultPopup = document.getElementById("result-popup");
const rulesPopup = document.getElementById("rules-popup");

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    updateBalance();
    setupEventListeners();
    createDeck();
    addBackButton();
});

function addBackButton() {
    // Aggiungi il pulsante per tornare indietro
    const backButton = document.createElement('button');
    backButton.className = 'bj-back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Torna a Funzionamento';
    backButton.onclick = function() {
        window.location.href = 'funzionamento.html';
    };
    
    // Aggiungi stili per il pulsante
    if (!document.querySelector('.bj-back-button-styles')) {
        const styles = document.createElement('style');
        styles.className = 'bj-back-button-styles';
        styles.textContent = `
            .bj-back-button {
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 12px 20px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                cursor: pointer;
                font-family: 'Fredoka', sans-serif;
                font-size: 14px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .bj-back-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            @media (max-width: 768px) {
                .bj-back-button {
                    bottom: 10px;
                    left: 10px;
                    padding: 10px 15px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(backButton);
}

function setupEventListeners() {
    // Controlli scommessa
    document.querySelectorAll('.bj-bet-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            adjustBet(action);
        });
    });
    
    // Bottoni di gioco
    betConfirm.addEventListener('click', startGame);
    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    resetBtn.addEventListener('click', resetGame);
    rulesBtn.addEventListener('click', showRules);
}

function updateBalance() {
    balanceValue.textContent = saldo;
    
    // Aggiorna anche il limite massimo della scommessa
    const maxBet = Math.min(saldo, 100);
    if (bet > maxBet) {
        bet = maxBet;
        betValue.textContent = `€${bet}`;
    }
}

function adjustBet(action) {
    if (gameActive) return;
    
    const maxBet = Math.min(saldo, 100);
    
    if (action === 'increase') {
        if (bet < maxBet) {
            bet = Math.min(bet + 5, maxBet);
        }
    } else if (action === 'decrease') {
        if (bet > 5) {
            bet -= 5;
        }
    }
    
    betValue.textContent = `€${bet}`;
}

function createDeck() {
    mazzo = [];
    const seeds = ['♠', '♥', '♦', '♣'];
    const seedColors = {
        '♠': 'black',
        '♣': 'black', 
        '♥': 'red',
        '♦': 'red'
    };
    
    for (let s = 0; s < 4; s++) {
        for (let n = 1; n <= 13; n++) {
            mazzo.push({
                numero: n, 
                seme: seeds[s],
                colore: seedColors[seeds[s]]
            });
        }
    }
    // Mescola il mazzo
    for (let i = mazzo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]];
    }
}

function drawCard() {
    if (mazzo.length < 10) createDeck();
    return mazzo.pop();
}

function cardValue(card) {
    if (card.numero > 10) return 10;
    if (card.numero === 1) return 11;
    return card.numero;
}

function renderCard(card, container, flipped = false) {
    const div = document.createElement('div');
    div.className = `card ${flipped ? '' : 'flip'} card-deal`;
    
    let displayValue = card.numero === 1 ? 'A' : 
                      card.numero > 10 ? ['J','Q','K'][card.numero-11] : 
                      card.numero;
    
    div.innerHTML = `
        <div class="front">
            <div class="card-corner card-corner-top">
                <span style="color: ${card.colore}">${displayValue}</span><br>
                <span style="color: ${card.colore}">${card.seme}</span>
            </div>
            <div class="card-value" style="color: ${card.colore}">
                ${displayValue}${card.seme}
            </div>
            <div class="card-corner card-corner-bottom">
                <span style="color: ${card.colore}">${displayValue}</span><br>
                <span style="color: ${card.colore}">${card.seme}</span>
            </div>
        </div>
        <div class="back"></div>
    `;
    
    container.appendChild(div);
    
    // Animazione flip
    if (!flipped) {
        setTimeout(() => {
            div.classList.add('flip');
        }, 100);
    }
}

function updateScores() {
    const playerScore = handValue(playerCards);
    const dealerScore = handValue(dealerCards);
    
    playerScoreElem.textContent = `Punteggio: ${playerScore}`;
    
    // Mostra solo il punteggio del dealer quando è il suo turno o fine partita
    if (dealerTurn || !gameActive) {
        dealerScoreElem.textContent = `Punteggio: ${dealerScore}`;
    } else {
        // Per la prima carta del dealer
        const visibleScore = cardValue(dealerCards[0]);
        dealerScoreElem.textContent = `Punteggio: ${visibleScore}+`;
    }
}

function renderHand(showDealerCard = false) {
    if (!showDealerCard) {
        // Render iniziale - seconda carta del dealer coperta
        playerCardsBox.innerHTML = '';
        dealerCardsBox.innerHTML = '';
        
        playerCards.forEach(card => {
            renderCard(card, playerCardsBox, false);
        });
        
        dealerCards.forEach((card, index) => {
            const flipped = index === 1; // Seconda carta coperta
            renderCard(card, dealerCardsBox, flipped);
        });
    } else {
        // Rivela tutte le carte del dealer
        dealerCardsBox.innerHTML = '';
        dealerCards.forEach(card => {
            renderCard(card, dealerCardsBox, false);
        });
    }
    
    updateScores();
}

function handValue(cards) {
    let value = 0, aces = 0;
    cards.forEach(c => {
        let v = cardValue(c);
        if (v === 11) aces++;
        value += v;
    });
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
}

function startGame() {
    if (gameActive) return;
    
    if (bet > saldo || bet < 1) {
        showResult('error', 'Scommessa non valida!', 'Inserisci una scommessa valida');
        return;
    }
    
    // Sottrai immediatamente la scommessa
    saldo -= bet;
    updateBalance();
    
    createDeck();
    playerCards = [drawCard(), drawCard()];
    dealerCards = [drawCard(), drawCard()];
    gameActive = true;
    dealerTurn = false;
    
    renderHand();
    updateGameControls();
    
    // Controlla blackjack immediato
    const playerScore = handValue(playerCards);
    if (playerScore === 21) {
        setTimeout(() => {
            checkBlackjack();
        }, 1000);
    }
}

function updateGameControls() {
    hitBtn.disabled = !gameActive || dealerTurn;
    standBtn.disabled = !gameActive || dealerTurn;
    betConfirm.disabled = gameActive || saldo === 0;
    
    document.querySelectorAll('.bj-bet-btn').forEach(btn => {
        btn.disabled = gameActive || saldo === 0;
    });
}

function hit() {
    if (!gameActive || dealerTurn) return;
    
    const newCard = drawCard();
    playerCards.push(newCard);
    
    // Renderizza solo la nuova carta
    renderCard(newCard, playerCardsBox, false);
    updateScores();
    
    const playerScore = handValue(playerCards);
    if (playerScore > 21) {
        gameActive = false;
        setTimeout(() => {
            endGame('lose');
        }, 1000);
    }
}

async function stand() {
    if (!gameActive || dealerTurn) return;
    
    gameActive = false;
    dealerTurn = true;
    updateGameControls();
    
    // Rivela la carta coperta del dealer
    renderHand(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let dealerScore = handValue(dealerCards);
    
    // Il banco pesca fino a 16, si ferma a 17
    while (dealerScore < 17) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCard = drawCard();
        dealerCards.push(newCard);
        renderCard(newCard, dealerCardsBox, false);
        updateScores();
        
        dealerScore = handValue(dealerCards);
        
        // Se il banco sballa, fermati immediatamente
        if (dealerScore > 21) {
            break;
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    determineWinner();
}

function checkBlackjack() {
    const playerScore = handValue(playerCards);
    const dealerScore = handValue(dealerCards);
    
    renderHand(true); // Rivela tutte le carte del dealer
    
    if (playerScore === 21) {
        if (dealerScore === 21) {
            // Pareggio - restituisci la scommessa
            saldo += bet;
            endGame('draw');
        } else {
            // Blackjack - paga 3:2
            const winAmount = bet + Math.floor(bet * 1.5);
            saldo += winAmount;
            endGame('blackjack');
        }
    }
}

function determineWinner() {
    const playerScore = handValue(playerCards);
    const dealerScore = handValue(dealerCards);
    
    console.log('Player score:', playerScore, 'Dealer score:', dealerScore); // Debug
    
    if (playerScore > 21) {
        // Giocatore sballa - perde la scommessa (già sottratta)
        console.log('Player busts - lose'); // Debug
        endGame('lose');
    } else if (dealerScore > 21) {
        // Banco sballa - giocatore vince 2:1
        console.log('Dealer busts - player wins'); // Debug
        saldo += bet * 2;
        endGame('win');
    } else if (playerScore > dealerScore) {
        // Giocatore vince - vince 2:1
        console.log('Player wins with higher score'); // Debug
        saldo += bet * 2;
        endGame('win');
    } else if (playerScore < dealerScore) {
        // Banco vince - perde la scommessa (già sottratta)
        console.log('Dealer wins with higher score'); // Debug
        endGame('lose');
    } else {
        // Pareggio - restituisci la scommessa
        console.log('Push - tie game'); // Debug
        saldo += bet;
        endGame('draw');
    }
}

function endGame(result) {
    console.log('Game ended with result:', result, 'Saldo:', saldo); // Debug
    updateBalance();
    updateGameControls();
    
    setTimeout(() => {
        showResult(result);
    }, 1000);
}

function showResult(type, title, message) {
    const resultTitle = document.getElementById("result-title");
    const resultMessage = document.getElementById("result-message");
    const resultAmount = document.getElementById("result-amount");
    const resultIcon = document.getElementById("result-icon");
    
    // Reset classes
    resultIcon.className = 'bj-result-icon';
    
    console.log('Showing result:', type, 'Saldo:', saldo); // Debug
    
    // CORREZIONE: Mostra prima il risultato della partita
    switch(type) {
        case 'win':
            resultTitle.textContent = 'HAI VINTO!';
            resultMessage.textContent = 'Complimenti! Hai battuto il banco.';
            resultAmount.textContent = `+€${bet * 2}`;
            resultIcon.classList.add('win');
            resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            break;
            
        case 'blackjack':
            resultTitle.textContent = 'BLACKJACK!';
            resultMessage.textContent = 'Perfetto! Blackjack!';
            resultAmount.textContent = `+€${Math.floor(bet * 2.5)}`;
            resultIcon.classList.add('win');
            resultIcon.innerHTML = '<i class="fas fa-crown"></i>';
            break;
            
        case 'lose':
            resultTitle.textContent = 'HAI PERSO';
            resultMessage.textContent = 'Ritenta, sarai più fortunato!';
            resultAmount.textContent = `-€${bet}`;
            resultIcon.classList.add('lose');
            resultIcon.innerHTML = '<i class="fas fa-times"></i>';
            break;
            
        case 'draw':
            resultTitle.textContent = 'PAREGGIO';
            resultMessage.textContent = 'La tua scommessa ti è stata restituita.';
            resultAmount.textContent = `€${bet}`;
            resultIcon.classList.add('draw');
            resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            break;
            
        case 'error':
            resultTitle.textContent = title || 'Errore';
            resultMessage.textContent = message || 'Si è verificato un errore.';
            resultAmount.textContent = '';
            resultIcon.classList.add('lose');
            resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            break;
    }
    
    resultPopup.classList.remove('bj-popup-hide');
}

function hideResult() {
    resultPopup.classList.add('bj-popup-hide');
    
    console.log('Hiding result, saldo:', saldo); // Debug
    
    // CORREZIONE: Controlla se il saldo è 0 SOLO DOPO aver nascosto il risultato
    if (saldo === 0) {
        console.log('Game over - saldo is 0'); // Debug
        showGameOverMessage();
    } else {
        console.log('Resetting game'); // Debug
        resetGame();
    }
}

function showGameOverMessage() {
    console.log('Showing game over message'); // Debug
    // Crea un messaggio permanente di game over
    const gameOverMessage = document.createElement('div');
    gameOverMessage.className = 'bj-game-over';
    gameOverMessage.innerHTML = `
        <div class="bj-game-over-content">
            <h2>💸 GAME OVER 💸</h2>
            <p>Hai perso tutti i tuoi soldi!</p>
            <p><strong>Ecco cosa comporta la ludopatia...</strong></p>
            <p>Il gioco d'azzardo può creare dipendenza e portare a gravi problemi finanziari.</p>
            <div class="bj-game-over-buttons">
                <button onclick="resetToInitialState()" class="bj-btn bj-btn-primary">
                    <i class="fas fa-redo"></i> Ricomincia da €100
                </button>
                <button onclick="abbandonaGioco()" class="bj-btn bj-btn-secondary">
                    <i class="fas fa-door-open"></i> Abbandona gioco d'azzardo
                </button>
            </div>
        </div>
    `;
    
    // Aggiungi stili per il messaggio di game over
    if (!document.querySelector('.bj-game-over-styles')) {
        const styles = document.createElement('style');
        styles.className = 'bj-game-over-styles';
        styles.textContent = `
            .bj-game-over {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                backdrop-filter: blur(10px);
            }
            .bj-game-over-content {
                background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                color: white;
                max-width: 500px;
                margin: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
                border: 4px solid #ffd700;
            }
            .bj-game-over-content h2 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }
            .bj-game-over-content p {
                font-size: 1.2rem;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            .bj-game-over-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 25px;
            }
            .bj-game-over-buttons .bj-btn {
                justify-content: center;
            }
            @media (max-width: 480px) {
                .bj-game-over-content {
                    padding: 25px 20px;
                    margin: 15px;
                }
                .bj-game-over-content h2 {
                    font-size: 2rem;
                }
                .bj-game-over-content p {
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(gameOverMessage);
}

function resetToInitialState() {
    // Rimuovi il messaggio di game over
    const gameOverMessage = document.querySelector('.bj-game-over');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
    
    // Resetta tutto
    saldo = 100;
    bet = 10;
    resetGame();
}

function abbandonaGioco() {
    // Reindirizza alla home page
    window.location.href = 'home.html';
}

function showRules() {
    rulesPopup.classList.remove('bj-popup-hide');
}

function closeRules() {
    rulesPopup.classList.add('bj-popup-hide');
}

function resetGame() {
    mazzo = [];
    playerCards = [];
    dealerCards = [];
    playerCardsBox.innerHTML = '';
    dealerCardsBox.innerHTML = '';
    playerScoreElem.textContent = '';
    dealerScoreElem.textContent = '';
    
    gameActive = false;
    dealerTurn = false;
    updateGameControls();
    updateBalance();
}

// Funzioni globali per HTML
window.hideResult = hideResult;
window.closeRules = closeRules;
window.resetToInitialState = resetToInitialState;
window.abbandonaGioco = abbandonaGioco;