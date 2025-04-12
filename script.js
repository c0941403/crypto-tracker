const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc';
const cryptoListDiv = document.getElementById('crypto-list');
const comparisonListDiv = document.getElementById('comparison-list');
const favoriteListDiv = document.getElementById('favorite-list');
const exportBtn = document.getElementById('export-btn');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort-options');
const toggle24hBtn = document.getElementById('toggle-24h');
const themeToggleBtn = document.getElementById('theme-toggle');

let allCryptos = [];
let comparisonList = JSON.parse(localStorage.getItem('comparisonList')) || [];
let favoriteList = JSON.parse(localStorage.getItem('favoriteList')) || [];
let show24hChange = JSON.parse(localStorage.getItem('show24hChange')) ?? true;
let currentSort = localStorage.getItem('currentSort') || 'desc';

sortSelect.value = currentSort;

function fetchData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allCryptos = data;
      applyUserPreferences();
    });
}

function applyUserPreferences() {
  sortCryptos();
  renderCryptoList(allCryptos);
  updateComparisonSection();
  updateFavoriteSection();
}

function sortCryptos() {
  if (currentSort === 'asc') {
    allCryptos.sort((a, b) => a.market_cap - b.market_cap);
  } else {
    allCryptos.sort((a, b) => b.market_cap - a.market_cap);
  }
}

function renderCryptoList(data) {
  cryptoListDiv.innerHTML = '';
  data.forEach(coin => {
    if (!coin.name.toLowerCase().includes(searchInput.value.toLowerCase()) &&
        !coin.symbol.toLowerCase().includes(searchInput.value.toLowerCase())) return;

    const card = document.createElement('div');
    card.className = 'crypto-card';
    card.innerHTML = `
      <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
      <p>Price: $${coin.current_price.toLocaleString()}</p>
      ${show24hChange ? `<p>24h Change: ${coin.price_change_percentage_24h?.toFixed(2) ?? 0}%</p>` : ''}
      <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
      <button onclick="addToComparison('${coin.id}')">Compare</button>
      <button onclick="toggleFavorite('${coin.id}')">${favoriteList.includes(coin.id) ? '★ Favorite' : '☆ Favorite'}</button>
    `;
    cryptoListDiv.appendChild(card);
  });
}

function updateComparisonSection() {
  comparisonListDiv.innerHTML = '';
  comparisonList.forEach(id => {
    const coin = allCryptos.find(c => c.id === id);
    if (!coin) return;

    const card = document.createElement('div');
    card.className = 'crypto-card';
    card.innerHTML = `
      <h3>${coin.name}</h3>
      <p>Price: $${coin.current_price.toLocaleString()}</p>
      ${show24hChange ? `<p>24h Change: ${coin.price_change_percentage_24h?.toFixed(2) ?? 0}%</p>` : ''}
      <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
      <button class="remove-btn" onclick="removeFromComparison('${coin.id}')">Remove</button>
    `;
    comparisonListDiv.appendChild(card);
  });
  localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
}

function updateFavoriteSection() {
  favoriteListDiv.innerHTML = '';
  favoriteList.forEach(id => {
    const coin = allCryptos.find(c => c.id === id);
    if (!coin) return;

    const card = document.createElement('div');
    card.className = 'crypto-card';
    card.innerHTML = `
      <h3>${coin.name}</h3>
      <p>Price: $${coin.current_price.toLocaleString()}</p>
      ${show24hChange ? `<p>24h Change: ${coin.price_change_percentage_24h?.toFixed(2) ?? 0}%</p>` : ''}
      <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
      <button onclick="toggleFavorite('${coin.id}')">Remove Favorite</button>
    `;
    favoriteListDiv.appendChild(card);
  });
  localStorage.setItem('favoriteList', JSON.stringify(favoriteList));
}

function addToComparison(id) {
  if (comparisonList.includes(id)) return;
  if (comparisonList.length >= 5) {
    alert("You can only compare up to 5 cryptocurrencies.");
    return;
  }
  comparisonList.push(id);
  updateComparisonSection();
}

function removeFromComparison(id) {
  comparisonList = comparisonList.filter(cid => cid !== id);
  updateComparisonSection();
}

function toggleFavorite(id) {
  if (favoriteList.includes(id)) {
    favoriteList = favoriteList.filter(fid => fid !== id);
  } else {
    favoriteList.push(id);
  }
  updateFavoriteSection();
  renderCryptoList(allCryptos);
}

searchInput.addEventListener('input', () => {
  renderCryptoList(allCryptos);
});

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  localStorage.setItem('currentSort', currentSort);
  applyUserPreferences();
});

toggle24hBtn.addEventListener('click', () => {
  show24hChange = !show24hChange;
  localStorage.setItem('show24hChange', show24hChange);
  applyUserPreferences();
});

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

exportBtn.addEventListener('click', () => {
  let content = "Cryptocurrency Comparison:\n\n";
  comparisonList.forEach(id => {
    const coin = allCryptos.find(c => c.id === id);
    if (!coin) return;
    content += `${coin.name} (${coin.symbol.toUpperCase()})\nPrice: $${coin.current_price.toLocaleString()}\nChange (24h): ${coin.price_change_percentage_24h?.toFixed(2) ?? 0}%\nMarket Cap: $${coin.market_cap.toLocaleString()}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'crypto_comparison.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
  }
  fetchData();
  setInterval(fetchData, 60000);
});
