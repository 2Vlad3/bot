document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    try {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('secondary_bg_color');
    } catch (e) {
        console.error("Telegram WebApp script not found.", e);
    }
    
    // --- ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ---
    let userData = {
        id: tg.initDataUnsafe?.user?.id || '12345',
        name: tg.initDataUnsafe?.user?.first_name || 'Username',
        username: tg.initDataUnsafe?.user?.username || 'user',
        photo: tg.initDataUnsafe?.user?.photo_url || `https://placehold.co/48x48/f6a828/ffffff?text=${(tg.initDataUnsafe?.user?.first_name || 'U').charAt(0)}`,
        balance: 5000,
        level: 12,
        casesOpened: 78,
        status: 'PRO',
        inventory: [],
        history: [],
        lastBonusTime: null
    };

    function loadUserData() {
        const savedData = localStorage.getItem(`userData_${userData.id}`);
        if (savedData) {
            userData = JSON.parse(savedData);
        } else {
            // Генерируем стартовый инвентарь для новых пользователей
            userData.inventory = [
                { id: Date.now() + 1, name: "AKR 'Treasure Hunter'", rarity: "legendary" },
                { id: Date.now() + 2, name: "M9 'Dragon Glass'", rarity: "mythical" },
                { id: Date.now() + 3, name: "M4 'Necromancer'", rarity: "rare" },
                { id: Date.now() + 4, name: "P90 'Dragon'", rarity: "common" },
                { id: Date.now() + 5, name: "FabM 'Fatal'", rarity: "common" },
                { id: Date.now() + 6, name: "G22 'Nest'", rarity: "common" },
                { id: Date.now() + 7, name: "P350 'Forest Spirit'", rarity: "common" },
                { id: Date.now() + 8, name: "UMP45 'Beast'", rarity: "rare" },
                { id: Date.now() + 9, name: "M4 'Samurai'", rarity: "rare" },
                { id: Date.now() + 10, name: "Glock 'Predator'", rarity: "rare" },
                { id: Date.now() + 11, name: "Deagle 'Phoenix'", rarity: "legendary" },
            ];
        }
    }

    function saveUserData() {
        localStorage.setItem(`userData_${userData.id}`, JSON.stringify(userData));
    }

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА ---
    const langSwitcher = document.getElementById('lang-switcher');
    let currentLang = localStorage.getItem('appLanguage') || 'ru';

    function setLanguage(lang) {
        currentLang = lang;
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            if (translations[lang] && translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
        if (langSwitcher) langSwitcher.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;
        localStorage.setItem('appLanguage', lang);
        updateAllDynamicText();
    }

    if (langSwitcher) {
        langSwitcher.addEventListener('click', () => {
            const newLang = currentLang === 'ru' ? 'en' : 'ru';
            setLanguage(newLang);
        });
    }

    function getTranslation(key, replacements = {}) {
        let text = translations[currentLang]?.[key] || key;
        for (const placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return text;
    }

    // --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
    function updateAllDynamicText() {
        const balanceEl = document.getElementById('user-balance');
        if(balanceEl) balanceEl.textContent = getTranslation('balance_stars', { balance: userData.balance });
        renderDailyBonus();
    }
    
    function displayUserInfo() {
        const userNameEl = document.getElementById('user-name');
        const userPhotoEl = document.getElementById('user-photo');
        if(userNameEl) userNameEl.textContent = userData.name;
        if(userPhotoEl) userPhotoEl.src = userData.photo;
        updateAllDynamicText();
    }

    // --- ЛОГИКА СТРАНИЦ ---
    function renderHomePage() {
        const caseGrid = document.getElementById('cases-grid');
        if (!caseGrid) return;
        caseGrid.innerHTML = '';
        for (const caseId in CASES) {
            if (caseId === 'craft_result') continue;
            const caseData = CASES[caseId];
            const caseCard = document.createElement('div');
            caseCard.className = 'case-card';
            caseCard.addEventListener('click', () => openCase(caseId));
            caseCard.innerHTML = `
                <img src="${caseData.image}" alt="${caseData.name}" class="case-img">
                <h3 class="font-semibold">${caseData.name}</h3>
                <div class="case-price"><span class="text-yellow-400">⭐</span><span>${caseData.price}</span></div>
            `;
            caseGrid.appendChild(caseCard);
        }
        renderDailyBonus();
    }

    function renderProfilePage() {
        const levelEl = document.getElementById('profile-level-value');
        const casesOpenedEl = document.getElementById('profile-cases-opened-value');
        const statusEl = document.getElementById('profile-status-value');
        const inventoryGrid = document.querySelector('.inventory-grid');

        if(levelEl) levelEl.textContent = userData.level;
        if(casesOpenedEl) casesOpenedEl.textContent = userData.casesOpened;
        if(statusEl) {
            statusEl.textContent = userData.status;
            if(userData.status === 'PRO') statusEl.className = 'pro-badge';
        }
        if(inventoryGrid) {
            inventoryGrid.innerHTML = '';
            if (userData.inventory.length === 0) {
                 inventoryGrid.innerHTML = `<p class="text-gray-400">${getTranslation('inventory_empty')}</p>`;
            } else {
                userData.inventory.forEach(item => {
                    const rarityInfo = RARITY_STYLES[item.rarity] || {};
                    const itemEl = document.createElement('div');
                    itemEl.className = 'inventory-item';
                    itemEl.innerHTML = `
                        <div>
                            <img src="https://placehold.co/100x80/${rarityInfo.color?.substring(1) || 'ccc'}/ffffff?text=${item.name.substring(0,3)}" alt="${item.name}">
                            <p class="item-name">${item.name}</p>
                            <p class="item-rarity" style="color: ${rarityInfo.color || '#fff'}">${currentLang === 'ru' ? rarityInfo.name_ru : rarityInfo.name}</p>
                        </div>
                        <div class="inventory-item-actions">
                            <button class="withdraw-btn" data-item-id="${item.id}" data-lang="withdraw_button">${getTranslation('withdraw_button')}</button>
                        </div>
                    `;
                    inventoryGrid.appendChild(itemEl);
                });
                
                document.querySelectorAll('.withdraw-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const itemId = parseInt(e.target.dataset.itemId);
                        const item = userData.inventory.find(i => i.id === itemId);
                        if(item) showWithdrawModal(item);
                    });
                });
            }
        }
    }
    
    // --- ФУНКЦИОНАЛ ---
    function openCase(caseId) {
        const caseData = CASES[caseId];
        if (userData.balance < caseData.price) {
            tg.showAlert(getTranslation('alert_no_funds'));
            return;
        }
        userData.balance -= caseData.price;
        userData.casesOpened++;
        const droppedItem = rollItem(caseData.loot);
        if (droppedItem) {
            userData.inventory.push({ ...droppedItem, id: Date.now() });
            userData.history.push({ ...droppedItem, caseName: caseData.name, date: new Date().toISOString() });
            startCaseAnimation(droppedItem, caseData.loot);
        }
        saveUserData();
        displayUserInfo();
    }

    function rollItem(lootTable) {
        let randomNumber = Math.random() * 100;
        let cumulativeChance = 0;
        for (const item of lootTable) {
            cumulativeChance += item.chance;
            if (randomNumber <= cumulativeChance) {
                return { name: item.name, rarity: item.rarity };
            }
        }
        return lootTable[lootTable.length - 1]; // Fallback
    }

    function startCaseAnimation(wonItem, lootTable) {
        const modal = document.getElementById('case-opening-modal');
        const roulette = document.getElementById('roulette');
        const resultContainer = document.getElementById('case-result');
        
        if (!modal || !roulette) return;

        resultContainer.classList.add('hidden');
        roulette.innerHTML = '';
        roulette.style.transform = 'translateX(0)';
        modal.style.display = 'flex';

        // Создаем ленту для рулетки
        let rouletteItems = [];
        for (let i = 0; i < 50; i++) {
            rouletteItems.push(lootTable[Math.floor(Math.random() * lootTable.length)]);
        }
        // Вставляем выигрышный предмет в случайное место во второй половине ленты
        const winIndex = Math.floor(Math.random() * 20) + 25;
        rouletteItems[winIndex] = wonItem;

        rouletteItems.forEach(item => {
            const rarityInfo = RARITY_STYLES[item.rarity] || {};
            const itemEl = document.createElement('div');
            itemEl.className = 'roulette-item';
            itemEl.style.borderLeft = `4px solid ${rarityInfo.color || '#fff'}`;
            itemEl.innerHTML = `
                <img src="https://placehold.co/100x80/${rarityInfo.color?.substring(1) || 'ccc'}/ffffff?text=${item.name.substring(0,3)}" alt="${item.name}">
                <p style="color: ${rarityInfo.color || '#fff'}">${item.name}</p>
            `;
            roulette.appendChild(itemEl);
        });

        // Запускаем анимацию
        setTimeout(() => {
            const itemWidth = 120; // Ширина одного элемента в рулетке
            const offset = Math.random() * (itemWidth * 0.6) - (itemWidth * 0.3); // Случайное смещение
            const targetPosition = (winIndex * itemWidth) - (modal.querySelector('.roulette-container').offsetWidth / 2) + (itemWidth / 2) + offset;
            
            roulette.style.transform = `translateX(-${targetPosition}px)`;

            setTimeout(() => {
                showFinalResult(wonItem);
            }, 5500); // Время должно быть чуть больше, чем в CSS
        }, 100);
    }

    function showFinalResult(item) {
        const resultContainer = document.getElementById('case-result');
        const resultItemName = document.getElementById('result-item-name');
        const resultItemRarity = document.getElementById('result-item-rarity');
        const resultItemImage = document.getElementById('result-item-image');
        
        const rarityInfo = RARITY_STYLES[item.rarity] || {};
        resultItemName.textContent = item.name;
        resultItemName.style.color = rarityInfo.color || '#fff';
        resultItemRarity.textContent = currentLang === 'ru' ? rarityInfo.name_ru : rarityInfo.name;
        resultItemRarity.style.color = rarityInfo.color || '#fff';
        resultItemImage.src = `https://placehold.co/200x150/${rarityInfo.color?.substring(1) || 'ccc'}/ffffff?text=${item.name.substring(0,3)}`;
        
        resultContainer.classList.remove('hidden');
    }

    function showWithdrawModal(item) {
        const modal = document.getElementById('withdraw-modal');
        if (!modal) return;
        
        modal.querySelector('#withdraw-item-name').textContent = `${getTranslation('withdraw_title')}: ${item.name}`;
        
        const closeBtn = modal.querySelector('.close-button');
        const submitBtn = modal.querySelector('#withdraw-submit-btn');

        const closeHandler = () => {
            modal.style.display = 'none';
        };

        const submitHandler = () => {
            const tradeLink = modal.querySelector('#trade-link-input').value;
            if (tradeLink) {
                tg.showAlert(getTranslation('withdraw_success', {itemName: item.name}));
                // Здесь в будущем будет логика отправки на бэкенд
                closeHandler();
            }
        };

        closeBtn.onclick = closeHandler;
        submitBtn.onclick = submitHandler;
        
        modal.style.display = 'flex';
    }

    // --- ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ ---
    function initPage() {
        loadUserData();
        displayUserInfo();
        
        const page = window.location.pathname.split('/').pop() || 'index.html';
        
        if (page === 'index.html') {
            renderHomePage();
            const closeResultBtn = document.getElementById('close-result-btn');
            if(closeResultBtn) closeResultBtn.onclick = () => document.getElementById('case-opening-modal').style.display = "none";
            const claimBtn = document.getElementById('claim-bonus-btn');
            if(claimBtn) claimBtn.addEventListener('click', claimDailyBonus);
        } else if (page === 'profile.html') {
            renderProfilePage();
        }
        // ... другие страницы
        
        setLanguage(currentLang);
        updateActiveNavButton();
    }
    
    function updateActiveNavButton() {
        const pageName = window.location.pathname.split('/').pop().split('.')[0] || 'index';
        document.querySelectorAll('.footer-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === pageName) {
                btn.classList.add('active');
            }
        });
    }

    initPage();
});
