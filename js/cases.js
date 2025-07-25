// В этом файле хранятся все данные о кейсах.
// Вы можете легко добавлять новые кейсы или изменять существующие.
// Просто скопируйте существующий блок, измените id (например, 'new_case'),
// и настройте название, цену, картинку и содержимое (лут).

const CASES = {
    loot_case: {
        name: "Loot Case",
        price: 100,
        image: "https://placehold.co/200x150/ff6b6b/ffffff?text=Loot+Case",
        loot: [
            { name: "M4 'Necromancer'", rarity: "rare", chance: 30 },
            { name: "P90 'Dragon'", rarity: "common", chance: 70 }
        ]
    },
    shard_case: {
        name: "Shard Case",
        price: 250,
        image: "https://placehold.co/200x150/4d94ff/ffffff?text=Shard+Case",
        loot: [
            { name: "AWP 'Genesis'", rarity: "legendary", chance: 5 },
            { name: "UMP45 'Beast'", rarity: "rare", chance: 35 },
            { name: "FabM 'Fatal'", rarity: "common", chance: 60 }
        ]
    },
    gen_case: {
        name: "Gen Case",
        price: 500,
        image: "https://placehold.co/200x150/1dd1a1/ffffff?text=Gen+Case",
        loot: [
            { name: "AKR 'Treasure Hunter'", rarity: "legendary", chance: 10 },
            { name: "G22 'Nest'", rarity: "common", chance: 90 }
        ]
    },
    peach_case: {
        name: "Peach Case",
        price: 1000,
        image: "https://placehold.co/200x150/ff9f43/ffffff?text=Peach+Case",
        loot: [
            { name: "★ Karambit 'Gold'", rarity: "mythical", chance: 1 },
            { name: "M4 'Samurai'", rarity: "rare", chance: 29 },
            { name: "P350 'Forest Spirit'", rarity: "common", chance: 70 }
        ]
    },
    // Специальный "кейс" для результатов крафта
    craft_result: {
        name: "Craft Result",
        loot: [
            { name: "Glock 'Predator'", rarity: "rare", chance: 60 },
            { name: "USP 'Cyber'", rarity: "rare", chance: 30 },
            { name: "Deagle 'Phoenix'", rarity: "legendary", chance: 10 }
        ]
    }
};

const RARITY_STYLES = {
    common: { name: "Common", name_ru: "Обычный", color: "#b0b0b0" },
    rare: { name: "Rare", name_ru: "Редкий", color: "#4b69ff" },
    legendary: { name: "Legendary", name_ru: "Легендарный", color: "#ff8000" },
    mythical: { name: "Mythical", name_ru: "Мифический", color: "#d42424" }
};