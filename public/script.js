const socket = io();

const multiplierEl = document.getElementById('multiplier');
const statusEl = document.getElementById('status');
const cashoutBtn = document.getElementById('cashout-btn');
const announcementsEl = document.createElement('div');
document.getElementById('game').appendChild(announcementsEl);

cashoutBtn.addEventListener('click', () => {
    const userId = '6884f84df3a798e1225dbd0b';
    socket.emit('cashout', { userId });
    cashoutBtn.disabled = true;
});

socket.on('connect', () => {
    statusEl.innerText = 'Connected! Waiting for next round...';
    statusEl.style.color = '#03a9f4';
});

socket.on('round_starting', (data) => {
    statusEl.innerText = 'Next round starts soon...';
    statusEl.style.color = '#ffc107';
    multiplierEl.innerText = '1.00x';
    multiplierEl.style.color = '#ffffff';
    cashoutBtn.disabled = true;
    announcementsEl.innerHTML = '';
});

socket.on('round_started', (data) => {
    statusEl.innerText = 'In Progress...';
    statusEl.style.color = '#4caf50';
    cashoutBtn.disabled = false;
});

socket.on('multiplier_update', (data) => {
    multiplierEl.innerText = `${data.multiplier.toFixed(2)}x`;
});

socket.on('crash', (data) => {
    statusEl.innerText = `Crashed @ ${data.crashPoint.toFixed(2)}x`;
    statusEl.style.color = '#f44336';
    multiplierEl.style.color = '#f44336';
    cashoutBtn.disabled = true;
});

socket.on('disconnect', () => {
    statusEl.innerText = 'Disconnected from server.';
    statusEl.style.color = '#f44336';
    cashoutBtn.disabled = true;
});

socket.on('cashout_success', (data) => {
    statusEl.innerText = `Cashed out at ${data.cashoutMultiplier}x for $${data.winningsUSD.toFixed(2)}!`;
    statusEl.style.color = '#03a9f4';
    cashoutBtn.disabled = true;
});

socket.on('cashout_fail', (data) => {
    const originalStatus = statusEl.innerText;
    statusEl.innerText = data.msg;
    statusEl.style.color = '#f44336';
    setTimeout(() => {
        if (statusEl.innerText === data.msg) {
            statusEl.innerText = originalStatus;
            statusEl.style.color = '#4caf50';
            cashoutBtn.disabled = false;
        }
    }, 2000);
});

socket.on('player_cashed_out', (data) => {
    const p = document.createElement('p');
    p.innerText = `${data.username} cashed out at ${data.cashoutMultiplier}x`;
    announcementsEl.appendChild(p);
});