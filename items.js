// Загрузка данных
const loadItems = async () => {
    try {
        const [starterItems, commonItems, rareItems, epicItems, legendaryItems, itemSets] = await Promise.all([
            fetch('starter_items.json').then(r => r.json()),
            fetch('common_items.json').then(r => r.json()),
            fetch('rare_items.json').then(r => r.json()),
            fetch('epic_items.json').then(r => r.json()),
            fetch('legendary_items.json').then(r => r.json()),
            fetch('item_sets.json').then(r => r.json())
        ]);
        return { starterItems, commonItems, rareItems, epicItems, legendaryItems, itemSets };
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return null;
    }
};

// Создание карточки предмета
const createItemCard = (item) => {
    const card = document.createElement('div');
    card.className = `item-card ${item.rarity}`;
    
    const name = document.createElement('h2');
    name.className = 'item-name';
    name.textContent = item.name;
    
    const stats = document.createElement('div');
    stats.className = 'item-stats';
    stats.innerHTML = `
        ${item.damage ? `<p>Урон: ${item.damage}</p>` : ''}
        ${item.defense ? `<p>Защита: ${item.defense}</p>` : ''}
        ${item.ap_cost ? `<p>Стоимость AP: ${item.ap_cost}</p>` : ''}
        ${item.range ? `<p>Дальность: ${item.range}</p>` : ''}
        ${item.hands ? `<p>Рук: ${item.hands}</p>` : ''}
        ${item.type ? `<p>Тип: ${item.type}</p>` : ''}
    `;

    const viewAbilities = document.createElement('button');
    viewAbilities.className = 'view-abilities-btn';
    viewAbilities.textContent = 'Просмотреть способности';
    
    card.appendChild(name);
    card.appendChild(stats);
    card.appendChild(viewAbilities);
    
    return card;
};

// Создание карточки сета
const createSetCard = (set) => {
    const card = document.createElement('div');
    card.className = `set-card ${set.rarity}`;
    
    const name = document.createElement('h2');
    name.className = 'set-name';
    name.textContent = set.name;
    
    const rarity = document.createElement('div');
    rarity.className = 'set-rarity';
    rarity.textContent = `Редкость: ${set.rarity}`;
    
    const items = document.createElement('div');
    items.className = 'set-items';
    items.innerHTML = `
        <h3>Предметы в сете (${set.items.length}):</h3>
        <ul>
            ${set.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    
    const bonuses = document.createElement('div');
    bonuses.className = 'set-bonuses';
    bonuses.innerHTML = `
        <h3>Бонусы сета:</h3>
        ${set.bonuses.map(bonus => `
            <div class="bonus-item">
                <div class="bonus-pieces">${bonus.pieces} предмета:</div>
                <div class="bonus-effects">
                    ${bonus.effects.map(effect => `
                        <div class="bonus-effect">
                            ${effect.type}${effect.value ? ` (${effect.value})` : ''}: ${effect.description}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    
    card.appendChild(name);
    card.appendChild(rarity);
    card.appendChild(items);
    card.appendChild(bonuses);
    
    return card;
};

// Функция для подсчета предметов
const updateItemsCount = (items) => {
    const counts = {
        total: 0,
        starter: 0,
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
    };

    Object.entries(items).forEach(([itemFile, itemData]) => {
        Object.entries(itemData).forEach(([category, categoryData]) => {
            Object.entries(categoryData).forEach(([subcategory, itemsList]) => {
                if (Array.isArray(itemsList)) {
                    itemsList.forEach(item => {
                        counts.total++;
                        counts[item.rarity]++;
                    });
                }
            });
        });
    });

    document.getElementById('total-items').textContent = counts.total;
    document.getElementById('starter-items').textContent = counts.starter;
    document.getElementById('common-items').textContent = counts.common;
    document.getElementById('rare-items').textContent = counts.rare;
    document.getElementById('epic-items').textContent = counts.epic;
    document.getElementById('legendary-items').textContent = counts.legendary;
};

// Фильтрация предметов
const filterItems = (items, rarity = 'all', type = 'all') => {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    
    if (rarity === 'all' && type === 'all') {
        updateItemsCount(items);
    }
    
    Object.entries(items).forEach(([itemFile, itemData]) => {
        Object.entries(itemData).forEach(([category, categoryData]) => {
            Object.entries(categoryData).forEach(([subcategory, itemsList]) => {
                if (Array.isArray(itemsList)) {
                    itemsList.forEach(item => {
                        const isWeapon = category === 'weapons';
                        const isArmor = category === 'armor';
                        
                        const matchesType = 
                            type === 'all' || 
                            (type === 'weapon' && isWeapon) ||
                            (type === 'armor' && isArmor) ||
                            (type === 'amulet' && subcategory === 'amulets');
                            
                        if ((rarity === 'all' || item.rarity === rarity) && matchesType) {
                            const card = createItemCard(item);
                            card.addEventListener('click', () => showAbilitiesModal(item));
                            grid.appendChild(card);
                        }
                    });
                }
            });
        });
    });
    
    container.appendChild(grid);
};

// Отображение сетов
const displaySets = (sets, rarity = 'all') => {
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    
    sets.sets.forEach(set => {
        if (rarity === 'all' || set.rarity === rarity) {
            const card = createSetCard(set);
            card.addEventListener('click', () => showSetModal(set));
            grid.appendChild(card);
        }
    });
    
    container.appendChild(grid);
};

// Показ модального окна сета
function showSetModal(set) {
    const modal = document.getElementById('set-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.querySelector('.modal-set-name').textContent = set.name;
    modalContent.querySelector('.modal-set-rarity').textContent = `Редкость: ${set.rarity}`;
    
    const itemsList = modalContent.querySelector('.set-items-list');
    itemsList.innerHTML = set.items.map(item => `
        <div class="set-item">
            <div class="set-item-name">${item}</div>
        </div>
    `).join('');
    
    const bonusesList = modalContent.querySelector('.set-bonuses-list');
    bonusesList.innerHTML = set.bonuses.map(bonus => `
        <div class="set-bonus">
            <div class="set-bonus-header">Бонус за ${bonus.pieces} предмета:</div>
            <div class="set-bonus-effects">
                ${bonus.effects.map(effect => `
                    <div class="set-bonus-effect">
                        ${effect.type}${effect.value ? ` (${effect.value})` : ''}: ${effect.description}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    modal.classList.add('show');
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    const items = await loadItems();
    if (!items) return;
    
    // Обработчики режима просмотра
    document.querySelectorAll('.view-mode button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.view-mode button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const mode = e.target.dataset.mode;
            document.getElementById('items-container').classList.toggle('active-view', mode === 'items');
            document.getElementById('sets-container').classList.toggle('active-view', mode === 'sets');
            
            if (mode === 'sets') {
                displaySets(items.itemSets);
            } else {
                filterItems(items);
            }
        });
    });
    
    // Обработчики фильтров
    document.querySelectorAll('.rarity-filter button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.rarity-filter button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const rarity = e.target.dataset.rarity;
            
            if (document.querySelector('.view-mode button.active').dataset.mode === 'sets') {
                displaySets(items.itemSets, rarity);
            } else {
                const type = document.querySelector('.type-filter button.active').dataset.type;
                filterItems(items, rarity, type);
            }
        });
    });
    
    // Остальные обработчики...
    document.querySelectorAll('.type-filter button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.type-filter button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const type = e.target.dataset.type;
            const rarity = document.querySelector('.rarity-filter button.active').dataset.rarity;
            filterItems(items, rarity, type);
        });
    });
    
    // Обработчики закрытия модальных окон
    document.querySelectorAll('.modal .close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.remove('show');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Начальная фильтрация
    filterItems(items);
});

function showAbilitiesModal(item) {
    const modal = document.getElementById('abilities-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Заполняем заголовок и статистику предмета
    modalContent.querySelector('.modal-item-name').textContent = item.name;
    const statsContainer = modalContent.querySelector('.modal-item-stats');
    statsContainer.innerHTML = `
        <span>Урон: ${item.damage || 0}</span>
        <span>Защита: ${item.defense || 0}</span>
        <span>Стоимость AP: ${item.ap_cost || 0}</span>
        <span>Дальность: ${item.range || 'Ближняя'}</span>
    `;

    // Очищаем и заполняем контейнер веток
    const branchesContainer = modalContent.querySelector('.branches-container');
    branchesContainer.innerHTML = '';

    // Создаем ветки способностей
    if (item.abilities_tree) {
        Object.entries(item.abilities_tree).forEach(([branchKey, branch]) => {
            const branchElement = document.createElement('div');
            branchElement.className = 'branch';
            
            const branchTitle = document.createElement('h3');
            branchTitle.className = 'branch-name';
            branchTitle.textContent = branch.name;
            
            const abilitiesList = document.createElement('div');
            abilitiesList.className = 'abilities-list';

            // Добавляем узлы способностей
            branch.abilities.forEach(ability => {
                const abilityNode = createAbilityNode(ability);
                abilitiesList.appendChild(abilityNode);
            });

            branchElement.appendChild(branchTitle);
            branchElement.appendChild(abilitiesList);
            branchesContainer.appendChild(branchElement);
        });
    }

    // Показываем модальное окно
    modal.classList.add('show');
}

function createAbilityNode(ability) {
    const node = document.createElement('div');
    node.className = 'ability-node';
    
    const header = document.createElement('div');
    header.className = 'ability-header';
    header.textContent = ability.name;
    
    const details = document.createElement('div');
    details.className = 'ability-details';
    
    // Добавляем описание способности
    if (ability.description) {
        const description = document.createElement('div');
        description.className = 'ability-description';
        description.textContent = ability.description;
        details.appendChild(description);
    }
    
    // Добавляем статистику способности
    const stats = document.createElement('div');
    stats.className = 'ability-stats';
    stats.innerHTML = `
        ${ability.damage ? `<span>Урон: ${ability.damage}</span>` : ''}
        ${ability.ap_cost ? `<span>Стоимость AP: ${ability.ap_cost}</span>` : ''}
        ${ability.cooldown ? `<span>Перезарядка: ${ability.cooldown} ходов</span>` : ''}
        ${ability.duration ? `<span>Длительность: ${ability.duration} ходов</span>` : ''}
    `;
    details.appendChild(stats);
    
    // Добавляем описание эффектов
    if (ability.effects && ability.effects.length > 0) {
        const effectsList = document.createElement('div');
        effectsList.className = 'effects-list';
        ability.effects.forEach(effect => {
            const effectItem = document.createElement('div');
            effectItem.className = 'effect-item';
            effectItem.innerHTML = `
                <strong>${effect.type}</strong>
                ${effect.value ? ` (${effect.value})` : ''}
                ${effect.duration ? ` - ${effect.duration} ходов` : ''}
                <br>${effect.description}
            `;
            effectsList.appendChild(effectItem);
        });
        details.appendChild(effectsList);
    }
    
    node.appendChild(header);
    node.appendChild(details);
    
    // Добавляем обработчик для раскрытия/скрытия деталей
    node.addEventListener('click', () => {
        node.classList.toggle('expanded');
    });
    
    return node;
}