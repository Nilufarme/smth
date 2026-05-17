import React, { useState, useEffect } from 'react';
import {
  Flame, Droplet, BookOpen, Calendar, ShoppingBag, Plus,
  TrendingUp, Heart, Check, X, AlertTriangle, Clock, User,
  ExternalLink, Trash2, ChefHat, Pencil, Streak as StreakIcon
} from 'lucide-react';

// ----------------------------- CONSTANTS -----------------------------
const STORAGE_KEY = 'maida-v1';

const DEFAULT_DATA = {
  userName: '',
  dailyGoal: 1800,
  waterGoal: 8,
  today: null, // will be set dynamically
  streak: 0,
  mealPlan: {
    'Понедельник': { breakfast: 'Овсянка с ягодами', lunch: 'Чечевичный суп', dinner: 'Курица с овощами' },
    'Вторник': { breakfast: 'Йогурт с орехами', lunch: 'Борщ', dinner: 'Запечённый лосось' },
    'Среда': { breakfast: 'Яйца с хлебом', lunch: 'Тыквенный крем-суп', dinner: 'Овощное карри' },
    'Четверг': { breakfast: 'Творог с мёдом', lunch: 'Уха', dinner: 'Курица с овощами' },
    'Пятница': { breakfast: 'Омлет', lunch: 'Чечевичный суп', dinner: 'Запечённый лосось' },
    'Суббота': { breakfast: 'Сырники с фруктами', lunch: 'Борщ', dinner: 'Запечённый лосось' },
    'Воскресенье': { breakfast: 'Смузи-боул', lunch: 'Семейный обед', dinner: 'Лёгкий ужин' },
  },
  shoppingList: [],
  customRecipes: [],
  history: [],
};

const ALERTS = {
  caffeine: { words: ['кофе', 'эспрессо', 'латте', 'капучино', 'энергетик'], title: 'Кофеин', icon: '⚡', message: 'Кофеин может влиять на сон. Попробуйте ограничить после обеда.' },
  fried: { words: ['жаре', 'жарен', 'фри', 'чипс', 'наггет'], title: 'Жареное', icon: '🍟', message: 'Жареная пища содержит много трансжиров. Выберите запечённый вариант.' },
  sugar: { words: ['торт', 'пирожн', 'конфет', 'шокол', 'мороженое', 'газиров'], title: 'Сахар', icon: '🍬', message: 'Высокое содержание сахара. Помните о норме до 30г в день.' },
  alcohol: { words: ['вино', 'пиво', 'водка', 'коньяк', 'шампан'], title: 'Алкоголь', icon: '🍷', message: 'Алкоголь высококалориен и обезвоживает.' },
  fastfood: { words: ['бургер', 'пицца', 'хот-дог', 'шаурма'], title: 'Фастфуд', icon: '🍔', message: 'Богат калориями и беден питательными веществами.' },
};

const COMMON_FOODS = [
  { name: 'Овсянка с ягодами', cal: 280, meal: 'breakfast' },
  { name: 'Йогурт с орехами', cal: 220, meal: 'breakfast' },
  { name: 'Яйца с хлебом', cal: 320, meal: 'breakfast' },
  { name: 'Творог с мёдом', cal: 200, meal: 'breakfast' },
  { name: 'Кофе с молоком', cal: 80, meal: 'breakfast' },
  { name: 'Чечевичный суп', cal: 280, meal: 'lunch' },
  { name: 'Борщ', cal: 290, meal: 'lunch' },
  { name: 'Уха', cal: 320, meal: 'lunch' },
  { name: 'Гречка с курицей', cal: 450, meal: 'lunch' },
  { name: 'Запечённый лосось', cal: 420, meal: 'dinner' },
  { name: 'Курица с овощами', cal: 380, meal: 'dinner' },
  { name: 'Овощное карри', cal: 340, meal: 'dinner' },
  { name: 'Яблоко', cal: 95, meal: 'snack' },
  { name: 'Горсть орехов', cal: 170, meal: 'snack' },
  { name: 'Стакан кефира', cal: 110, meal: 'snack' },
];

const MEAL_LABELS = { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус' };
const DAYS_RU = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

// Built-in recipes
const RECIPES = {
  lentil: {
    name: 'Чечевичный суп', time: '40 мин', servings: 6, calories: 280,
    description: 'Сытный и полезный суп из красной чечевицы',
    ingredients: ['Чечевица красная - 200г', 'Морковь - 1 шт', 'Лук - 1 шт', 'Томатная паста - 1 ст.л', 'Чеснок - 2 зубчика', 'Специи по вкусу'],
    steps: ['Обжарьте лук и морковь', 'Добавьте томатную пасту', 'Всыпьте чечевицу и залейте водой', 'Варите 20 минут', 'Добавьте специи и чеснок'],
    tags: ['суп', 'веган', 'бюджетно']
  },
  uha: {
    name: 'Уха', time: '30 мин', servings: 4, calories: 320,
    description: 'Ароматный рыбный суп',
    ingredients: ['Рыба белая - 400г', 'Картофель - 3 шт', 'Морковь - 1 шт', 'Лук - 1 шт', 'Укроп, лавровый лист'],
    steps: ['Поставьте рыбу вариться', 'Добавьте нарезанные овощи', 'Варите 20 минут', 'Добавьте специи и зелень'],
    tags: ['суп', 'рыба']
  },
  borscht: {
    name: 'Лёгкий борщ', time: '45 мин', servings: 6, calories: 290,
    description: 'Постный борщ без мяса',
    ingredients: ['Свекла - 2 шт', 'Капуста - 300г', 'Морковь - 1 шт', 'Лук - 1 шт', 'Томатная паста', 'Лимонный сок'],
    steps: ['Натрите свеклу и морковь', 'Тушите с томатной пастой', 'Добавьте нарезанную капусту', 'Залейте водой и варите 20 минут'],
    tags: ['суп', 'веган']
  },
  pumpkin: {
    name: 'Тыквенный крем-суп', time: '35 мин', servings: 4, calories: 250,
    description: 'Нежный сливочный суп из тыквы',
    ingredients: ['Тыква - 500г', 'Морковь - 1 шт', 'Лук - 1 шт', 'Сливки 10% - 100мл', 'Имбирь - кусочек'],
    steps: ['Обжарьте лук, морковь и имбирь', 'Добавьте тыкву и воду', 'Варите до мягкости', 'Пюрируйте блендером', 'Добавьте сливки'],
    tags: ['суп', 'крем-суп', 'веган']
  },
};

// Helper functions
function formatDateRu() {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const d = new Date();
  return weekdays[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
}

function checkAlerts(name) {
  const l = name.toLowerCase();
  return Object.values(ALERTS).filter(a => a.words.some(w => l.includes(w)));
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function createEmptyToday() {
  return {
    date: getTodayStr(),
    calories: [],
    water: 0,
    mealsEaten: { breakfast: false, lunch: false, dinner: false }
  };
}

// ----------------------------- MAIN APP -----------------------------
export default function MaidaApp() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [healthAlert, setHealthAlert] = useState(null);

  // Load/Save functions
  const saveData = async (newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      let loaded = null;
      if (stored) {
        try {
          loaded = JSON.parse(stored);
          if (!loaded.customRecipes) loaded.customRecipes = [];
          if (!loaded.history) loaded.history = [];
        } catch (e) { console.error(e); }
      }
      
      if (!loaded || !loaded.userName) {
        loaded = { ...DEFAULT_DATA, today: createEmptyToday() };
      }
      
      // Handle date rollover
      const todayStr = getTodayStr();
      if (!loaded.today || loaded.today.date !== todayStr) {
        // Save yesterday to history if data exists
        if (loaded.today && loaded.today.calories) {
          const totalCal = (loaded.today.calories || []).reduce((s, f) => s + f.cal, 0);
          const mealsCount = ['breakfast', 'lunch', 'dinner'].filter(m => loaded.today.mealsEaten?.[m]).length;
          const allMeals = mealsCount === 3;
          loaded.history = [
            ...(loaded.history || []),
            {
              date: loaded.today.date,
              calories: totalCal,
              water: loaded.today.water || 0,
              meals: mealsCount,
              allMeals: allMeals,
              items: (loaded.today.calories || []).length
            }
          ].slice(-90);
          // Update streak
          if (allMeals) {
            loaded.streak = (loaded.streak || 0) + 1;
          } else {
            loaded.streak = 0;
          }
        } else {
          if (loaded.streak === undefined) loaded.streak = 0;
        }
        loaded.today = createEmptyToday();
      }
      
      if (!loaded.today.mealsEaten) loaded.today.mealsEaten = { breakfast: false, lunch: false, dinner: false };
      if (!loaded.today.calories) loaded.today.calories = [];
      if (!loaded.today.water && loaded.today.water !== 0) loaded.today.water = 0;
      
      setData(loaded);
    };
    
    loadData();
  }, []);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  const totalCalories = data.today.calories.reduce((s, f) => s + f.cal, 0);
  const caloriePercent = Math.min((totalCalories / data.dailyGoal) * 100, 100);

  const addFood = (food) => {
    const nd = { ...data };
    nd.today = {
      ...nd.today,
      calories: [...nd.today.calories, { ...food, time: new Date().toISOString() }]
    };
    if (food.meal && food.meal !== 'snack') {
      nd.today.mealsEaten = { ...nd.today.mealsEaten, [food.meal]: true };
    }
    saveData(nd);
    setShowAddFood(false);
    const alerts = checkAlerts(food.name);
    if (alerts.length > 0) setHealthAlert({ alerts, foodName: food.name });
  };

  const removeFood = (i) => {
    const nd = { ...data };
    nd.today.calories = nd.today.calories.filter((_, idx) => idx !== i);
    saveData(nd);
  };

  const addWater = () => {
    if (data.today.water < data.waterGoal + 4) {
      const nd = { ...data };
      nd.today.water = Math.min(nd.today.water + 1, nd.waterGoal + 4);
      saveData(nd);
    }
  };

  const removeWater = () => {
    if (data.today.water > 0) {
      const nd = { ...data };
      nd.today.water = nd.today.water - 1;
      saveData(nd);
    }
  };

  const toggleShoppingItem = (i) => {
    const nd = { ...data };
    nd.shoppingList = [...nd.shoppingList];
    nd.shoppingList[i] = { ...nd.shoppingList[i], done: !nd.shoppingList[i].done };
    saveData(nd);
  };

  const addShoppingItem = () => {
    if (!newShoppingItem.trim()) return;
    const nd = { ...data };
    nd.shoppingList = [...nd.shoppingList, { name: newShoppingItem.trim(), done: false }];
    saveData(nd);
    setNewShoppingItem('');
  };

  const removeShoppingItem = (i) => {
    const nd = { ...data };
    nd.shoppingList = nd.shoppingList.filter((_, idx) => idx !== i);
    saveData(nd);
  };

  const generateShoppingFromPlan = () => {
    const itemsSet = new Set();
    const ingredientMap = {
      'овсянка': 'Овсяные хлопья', 'ягоды': 'Ягоды', 'йогурт': 'Йогурт', 'орехи': 'Орехи',
      'чечевичный суп': 'Чечевица, Лук, Морковь', 'борщ': 'Свекла, Капуста, Морковь',
      'курица': 'Куриное филе', 'лосось': 'Лосось', 'тыквенный': 'Тыква', 'овощное карри': 'Овощи, Кокосовое молоко',
      'омлет': 'Яйца, Молоко', 'сырники': 'Творог, Яйца, Мука', 'смузи': 'Фрукты, Йогурт'
    };
    Object.values(data.mealPlan).forEach(day => {
      Object.values(day).forEach(meal => {
        if (!meal) return;
        const lowerMeal = meal.toLowerCase();
        for (const [key, items] of Object.entries(ingredientMap)) {
          if (lowerMeal.includes(key)) {
            items.split(',').forEach(i => itemsSet.add(i.trim()));
          }
        }
        itemsSet.add('Лук');
        itemsSet.add('Морковь');
        itemsSet.add('Чеснок');
        itemsSet.add('Растительное масло');
      });
    });
    const existing = new Set(data.shoppingList.map(i => i.name.toLowerCase()));
    const toAdd = [...itemsSet].filter(i => !existing.has(i.toLowerCase())).map(name => ({ name, done: false }));
    if (toAdd.length) {
      const nd = { ...data };
      nd.shoppingList = [...nd.shoppingList, ...toAdd];
      saveData(nd);
    }
  };

  const updateMeal = (day, meal, value) => {
    const nd = { ...data };
    nd.mealPlan = { ...nd.mealPlan };
    nd.mealPlan[day] = { ...nd.mealPlan[day], [meal]: value };
    saveData(nd);
  };

  const addCustomRecipe = (recipe) => {
    const nd = { ...data };
    nd.customRecipes = [...nd.customRecipes, { ...recipe, id: Date.now().toString(), isCustom: true }];
    saveData(nd);
  };

  const deleteCustomRecipe = (id) => {
    const nd = { ...data };
    nd.customRecipes = nd.customRecipes.filter(r => r.id !== id);
    saveData(nd);
  };

  const getRecipe = (key) => {
    if (!key) return null;
    if (RECIPES[key]) return RECIPES[key];
    return data.customRecipes.find(r => r.id === key);
  };

  const setUserName = (name) => {
    saveData({ ...data, userName: name.trim() });
  };

  // Onboarding
  if (!data.userName) {
    return <OnboardingScreen onSave={setUserName} />;
  }

  return (
    <div className="max-w-md mx-auto pb-24 mesh-bg">
      <header className="px-6 pt-10 pb-6 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="font-display text-white text-xl font-bold">M</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">maida</span>
          </div>
          {data.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/70">
              <StreakIcon size={14} strokeWidth={2.5} className="text-amber-500" />
              <span className="font-display font-semibold text-sm text-slate-700">{data.streak} дней</span>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-body text-slate-400">ПРИВЕТСТВУЕМ,</p>
        <h1 className="font-display text-4xl mt-1 leading-tight font-bold text-slate-900">
          {formatDateRu()},<br />
          <span className="text-blue-600">{data.userName}</span>
        </h1>
      </header>

      {activeTab === 'today' && (
        <TodayTab
          data={data}
          totalCalories={totalCalories}
          caloriePercent={caloriePercent}
          addWater={addWater}
          removeWater={removeWater}
          removeFood={removeFood}
        />
      )}
      {activeTab === 'stats' && <StatsTab data={data} totalCalories={totalCalories} />}
      {activeTab === 'recipes' && (
        <RecipesTab
          onSelect={setSelectedRecipe}
          customRecipes={data.customRecipes}
          onAddClick={() => setShowAddRecipe(true)}
        />
      )}
      {activeTab === 'plan' && (
        <PlanTab
          mealPlan={data.mealPlan}
          onGenerateShopping={generateShoppingFromPlan}
          updateMeal={updateMeal}
        />
      )}
      {activeTab === 'shopping' && (
        <ShoppingTab
          list={data.shoppingList}
          toggle={toggleShoppingItem}
          remove={removeShoppingItem}
          addItem={addShoppingItem}
          newItem={newShoppingItem}
          setNewItem={setNewShoppingItem}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddFood(true)}
        className="fixed z-50 bottom-24 right-4 md:right-[calc(50%-200px)] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-3 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="flex items-center justify-around bg-white/90 backdrop-blur-md rounded-full py-2.5 px-2 shadow-lg border border-blue-100/50">
            <NavBtn icon={<Heart size={18} />} label="Сегодня" active={activeTab === 'today'} onClick={() => setActiveTab('today')} />
            <NavBtn icon={<TrendingUp size={18} />} label="Прогресс" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
            <NavBtn icon={<BookOpen size={18} />} label="Рецепты" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
            <NavBtn icon={<Calendar size={18} />} label="План" active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
            <NavBtn icon={<ShoppingBag size={18} />} label="Список" active={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')} />
          </div>
        </div>
      </nav>

      {/* Modals */}
      {healthAlert && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 animate-fade-up animate-shake bg-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100">
                <AlertTriangle size={22} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-slate-900">Внимание</h2>
              </div>
            </div>
            <p className="font-body text-sm mb-4 text-slate-600">Вы добавили <span className="font-bold">{healthAlert.foodName}</span></p>
            <div className="space-y-3 mb-5">
              {healthAlert.alerts.map((a, i) => (
                <div key={i} className="p-4 rounded-2xl bg-blue-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{a.icon}</span>
                    <p className="font-display font-bold text-base text-slate-900">{a.title}</p>
                  </div>
                  <p className="font-body text-sm text-slate-600 leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setHealthAlert(null)} className="w-full py-3 rounded-2xl font-body font-semibold bg-slate-900 text-white">Понятно</button>
          </div>
        </div>
      )}

      {showAddFood && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 animate-fade-up max-h-[80vh] overflow-y-auto bg-white">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-slate-900">Добавить приём</h2>
              <button onClick={() => setShowAddFood(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-2">
              {COMMON_FOODS.map((food, i) => (
                <button key={i} onClick={() => addFood(food)} className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                  <div className="text-left">
                    <p className="font-body font-medium text-sm text-slate-900">{food.name}</p>
                    <p className="text-xs uppercase tracking-wider mt-0.5 text-slate-400">{MEAL_LABELS[food.meal]}</p>
                  </div>
                  <span className="font-display font-bold text-blue-600">{food.cal} ккал</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && getRecipe(selectedRecipe) && (
        <RecipeModal
          recipe={getRecipe(selectedRecipe)}
          recipeId={selectedRecipe}
          isCustom={selectedRecipe.startsWith('custom-') || !!getRecipe(selectedRecipe)?.isCustom}
          onClose={() => setSelectedRecipe(null)}
          onDelete={deleteCustomRecipe}
        />
      )}

      {showAddRecipe && (
        <AddRecipeModal onClose={() => setShowAddRecipe(false)} onSave={addCustomRecipe} />
      )}
    </div>
  );
}

// ----------------------------- SUBCOMPONENTS -----------------------------
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-1.5 px-2 transition-all">
      <div className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</div>
      <span className={`text-[10px] uppercase tracking-wider font-body font-semibold ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}

function TodayTab({ data, totalCalories, caloriePercent, addWater, removeWater, removeFood }) {
  return (
    <div className="px-6 animate-fade-up space-y-4">
      <div className="rounded-3xl p-6 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">КАЛОРИИ</p>
            <p className="font-display text-4xl mt-1 font-bold text-slate-900">{totalCalories}<span className="text-xl font-body font-normal ml-2 text-slate-400">/ {data.dailyGoal}</span></p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="#DBEAFE" strokeWidth="6" fill="none" />
              <circle cx="40" cy="40" r="34" stroke="#2563EB" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={`${2 * Math.PI * 34 * (1 - caloriePercent / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><Flame size={20} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="flex gap-2">
          {['breakfast', 'lunch', 'dinner'].map(m => (
            <div key={m} className="flex-1 py-2 px-3 rounded-xl text-center bg-slate-50">
              <p className="text-[10px] uppercase tracking-wider font-body font-semibold text-slate-500">{MEAL_LABELS[m]}</p>
              {data.today.mealsEaten[m] && <Check size={14} className="mx-auto mt-1 text-green-500" />}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Droplet size={18} className="text-cyan-500" /><p className="font-display text-lg font-bold text-slate-900">Вода</p></div>
          <p className="font-body text-slate-500"><span className="font-display font-bold text-xl text-slate-900">{data.today.water}</span><span className="ml-1">/ {data.waterGoal} стак.</span></p>
        </div>
        <div className="flex gap-1.5 mb-3">
          {[...Array(data.waterGoal)].map((_, i) => (
            <div key={i} className={`flex-1 h-3 rounded-full transition-all ${i < data.today.water ? 'bg-cyan-400' : 'bg-slate-100'}`}></div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={removeWater} className="flex-1 py-2 rounded-xl font-body font-semibold bg-red-50 text-red-500 text-sm">− Убрать</button>
          <button onClick={addWater} className="flex-1 py-2 rounded-xl font-body font-semibold bg-blue-50 text-blue-600 text-sm">+ Добавить</button>
        </div>
      </div>

      {data.today.calories.length > 0 && (
        <div className="rounded-3xl p-5 bg-white shadow-md">
          <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400 mb-3">СЕГОДНЯ</p>
          <div className="space-y-2">
            {data.today.calories.map((f, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl">
                <div><p className="font-body text-sm text-slate-900">{f.name}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">{MEAL_LABELS[f.meal]}</p></div>
                <div className="flex items-center gap-3"><span className="font-display font-bold text-sm text-slate-900">{f.cal} ккал</span><button onClick={() => removeFood(i)} className="text-slate-400 hover:text-red-500">✕</button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({ r, onClick, isCustom }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-3xl p-5 bg-white shadow-md hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-2">
        <div className="pr-3"><h3 className="font-display text-xl font-bold text-slate-900">{r.name}</h3></div>
        <div className="flex flex-col items-end flex-shrink-0">{r.calories && <span className="font-display font-bold text-2xl text-blue-600">{r.calories}<span className="text-xs text-slate-400 ml-1">ккал</span></span>}</div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {r.time && <span className="flex items-center gap-1 font-body text-slate-500">⏱ {r.time}</span>}
        {r.servings && <span className="flex items-center gap-1 font-body text-slate-500">👥 {r.servings} порц.</span>}
      </div>
      {r.tags && r.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3"><span className="px-2.5 py-0.5 text-[10px] uppercase rounded-full bg-blue-50 text-blue-600">{r.tags[0]}</span></div>}
    </button>
  );
}

function RecipesTab({ onSelect, customRecipes, onAddClick }) {
  return (
    <div className="px-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">РЕЦЕПТЫ</p>
        <button onClick={onAddClick} className="flex items-center gap-1.5 text-xs font-body font-semibold text-blue-600"><Plus size={12} strokeWidth={3} /> Новый рецепт</button>
      </div>
      {customRecipes.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400 mb-2">Мои рецепты</p>
          <div className="space-y-3 mb-6">
            {customRecipes.map(r => <RecipeCard key={r.id} r={r} onClick={() => onSelect(r.id)} isCustom />)}
          </div>
        </>
      )}
      <p className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400 mb-2">База рецептов</p>
      <div className="space-y-3">
        {Object.entries(RECIPES).map(([key, r]) => <RecipeCard key={key} r={r} onClick={() => onSelect(key)} />)}
      </div>
    </div>
  );
}

function RecipeModal({ recipe, recipeId, isCustom, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl p-6 animate-fade-up max-h-[85vh] overflow-y-auto bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="pr-4">
            {isCustom && <p className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-blue-600 mb-1">Ваш рецепт</p>}
            <h2 className="font-display text-3xl font-bold text-slate-900">{recipe.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        {recipe.description && <p className="font-body text-sm mb-5 text-slate-600">{recipe.description}</p>}
        <div className="flex gap-4 mb-5 pb-5 border-b flex-wrap">
          {recipe.time && <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /><span className="text-sm font-body">{recipe.time}</span></div>}
          {recipe.servings && <div className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /><span className="text-sm font-body">{recipe.servings} порц.</span></div>}
          {recipe.calories && <div className="flex items-center gap-1.5"><Flame size={14} className="text-slate-400" /><span className="text-sm font-body">{recipe.calories} ккал</span></div>}
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {recipe.tags.map(t => <span key={t} className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600">{t}</span>)}
          </div>
        )}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <>
            <h3 className="font-display text-lg font-bold mb-3 text-slate-900">Ингредиенты</h3>
            <ul className="space-y-2 mb-5">
              {recipe.ingredients.map((ing, i) => <li key={i} className="flex items-start gap-3 font-body text-sm text-slate-700"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>{ing}</li>)}
            </ul>
          </>
        )}
        {recipe.steps && recipe.steps.length > 0 && (
          <>
            <h3 className="font-display text-lg font-bold mb-3 text-slate-900">Приготовление</h3>
            <ol className="space-y-3 mb-5">
              {recipe.steps.map((s, i) => <li key={i} className="flex items-start gap-3 font-body text-sm text-slate-700"><span className="font-display font-bold text-base text-blue-600 w-5">{i+1}.</span><span style={{ lineHeight: 1.55 }}>{s}</span></li>)}
            </ol>
          </>
        )}
        {isCustom && (
          <button onClick={() => { if (confirm('Удалить рецепт?')) { onDelete(recipeId); onClose(); } }} className="w-full mt-4 py-2.5 rounded-xl font-body text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"><Trash2 size={14} /> Удалить рецепт</button>
        )}
      </div>
    </div>
  );
}

function AddRecipeModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');

  const canSave = name.trim().length > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      time: time.trim(),
      servings: servings ? parseInt(servings, 10) : null,
      calories: calories ? parseInt(calories, 10) : null,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      ingredients: ingredientsText.split('\n').map(s => s.trim()).filter(Boolean),
      steps: stepsText.split('\n').map(s => s.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl p-6 animate-fade-up max-h-[90vh] overflow-y-auto bg-white">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2"><ChefHat size={22} className="text-blue-600" /><h2 className="font-display text-2xl font-bold text-slate-900">Ваш рецепт</h2></div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400">✕</button>
        </div>
        <div className="space-y-4">
          <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Название</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Бабушкин пирог" className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900" /></div>
          <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Описание</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Нежный и воздушный..." className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Время</label><input value={time} onChange={e => setTime(e.target.value)} placeholder="45 мин" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
            <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Порций</label><input value={servings} onChange={e => setServings(e.target.value)} placeholder="4" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
            <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Ккал</label><input value={calories} onChange={e => setCalories(e.target.value)} placeholder="320" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
          </div>
          <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Теги (через запятую)</label><input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="десерт, домашний" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
          <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Ингредиенты (по одному на строку)</label><textarea rows="4" value={ingredientsText} onChange={e => setIngredientsText(e.target.value)} placeholder="Мука - 200г\nЯйца - 2 шт" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
          <div><label className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-slate-400">Приготовление (пошагово)</label><textarea rows="4" value={stepsText} onChange={e => setStepsText(e.target.value)} placeholder="1. Смешать ингредиенты\n2. Выпекать 30 минут" className="w-full mt-1 p-3 rounded-xl bg-slate-50" /></div>
          <button onClick={handleSave} disabled={!canSave} className={`w-full py-3 rounded-xl font-display font-bold text-white transition ${canSave ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md' : 'bg-slate-300 cursor-not-allowed'}`}>Сохранить рецепт</button>
        </div>
      </div>
    </div>
  );
}

function PlanTab({ mealPlan, onGenerateShopping, updateMeal }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (day, meal) => { setEditing({ day, meal }); setDraft(mealPlan[day]?.[meal] || ''); };
  const saveEdit = () => { if (editing) { updateMeal(editing.day, editing.meal, draft); setEditing(null); } };
  const cancelEdit = () => { setEditing(null); setDraft(''); };

  return (
    <div className="px-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">ПЛАН ПИТАНИЯ</p>
        <button onClick={onGenerateShopping} className="text-xs font-body font-semibold text-blue-600">Сгенерировать список</button>
      </div>
      <div className="space-y-3">
        {DAYS_RU.map(day => (
          <div key={day} className="rounded-3xl p-5 bg-white shadow-md">
            <h3 className="font-display text-xl font-bold mb-3 text-slate-900">{day}</h3>
            <div className="space-y-2">
              {['breakfast', 'lunch', 'dinner'].map(meal => {
                const isEditing = editing && editing.day === day && editing.meal === meal;
                const mealValue = mealPlan[day]?.[meal] || '';
                return (
                  <div key={meal} className="flex items-center gap-2 pb-2 border-b border-slate-100 last:border-0">
                    <span className="text-[10px] uppercase tracking-wider font-body font-semibold text-slate-400 w-16">{MEAL_LABELS[meal]}</span>
                    {isEditing ? (
                      <>
                        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} className="flex-1 p-1.5 rounded-lg bg-slate-50 text-sm" />
                        <button onClick={saveEdit} className="p-2 rounded-lg text-green-600">✓</button>
                        <button onClick={cancelEdit} className="p-2 rounded-lg text-red-400">✕</button>
                      </>
                    ) : (
                      <p className="font-body text-sm flex-1 min-w-0 text-slate-700">{mealValue || '—'}</p>
                    )}
                    {!isEditing && <button onClick={() => startEdit(day, meal)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50"><Pencil size={14} /></button>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShoppingTab({ list, toggle, remove, addItem, newItem, setNewItem }) {
  return (
    <div className="px-6 animate-fade-up">
      <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400 mb-4">СПИСОК ПОКУПОК</p>
      <div className="flex gap-2 mb-5">
        <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="Добавить продукт..." className="flex-1 p-3 rounded-xl bg-white border border-slate-200 text-sm" />
        <button onClick={addItem} className="px-5 rounded-xl font-body text-sm font-semibold bg-blue-600 text-white">+</button>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl"><p className="font-body text-slate-400">Список покупок пуст</p></div>
      ) : (
        <div className="space-y-2">
          {list.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm">
              <button onClick={() => toggle(i)} className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${item.done ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>{item.done && <Check size={12} color="#FFFFFF" strokeWidth={3} />}</button>
              <p className={`font-body text-sm flex-1 ${item.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</p>
              <button onClick={() => remove(i)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingScreen({ onSave }) {
  const [name, setName] = useState('');
  const handleContinue = () => { if (name.trim()) onSave(name.trim()); };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl animate-[fadeUp_0.6s_ease-out_both]">
            <span className="font-display text-white text-5xl font-bold">M</span>
          </div>
        </div>
        <h1 className="font-display text-5xl font-bold mb-3 text-slate-900 animate-[fadeUp_0.6s_ease-out_0.15s_both]">Добро пожаловать<br />в <span className="text-blue-600">Maida</span></h1>
        <p className="font-body text-base mb-10 text-slate-500 animate-[fadeUp_0.6s_ease-out_0.3s_both]">Ваш мягкий спутник на пути<br />к здоровому питанию</p>
        <div className="animate-[fadeUp_0.6s_ease-out_0.45s_both]">
          <label className="text-xs uppercase tracking-[0.2em] font-body font-semibold text-slate-400 block mb-2">Как Вас зовут?</label>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleContinue()} placeholder="Ваше имя" autoFocus className="w-full px-5 py-4 rounded-2xl text-lg font-body text-center bg-white border-2 border-blue-200 focus:border-blue-500 outline-none transition" />
          <button onClick={handleContinue} disabled={!name.trim()} className={`w-full py-4 rounded-2xl font-display font-bold text-base text-white mt-5 transition ${name.trim() ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg hover:shadow-xl' : 'bg-slate-300 cursor-not-allowed'}`}>Начать</button>
        </div>
      </div>
    </div>
  );
}

function StatsTab({ data, totalCalories }) {
  const todayMeals = ['breakfast', 'lunch', 'dinner'].filter(m => data.today.mealsEaten?.[m]);
  const todaySnapshot = {
    date: data.today.date,
    calories: totalCalories,
    water: data.today.water || 0,
    meals: todayMeals.length,
    allMeals: todayMeals.length === 3,
    items: (data.today.calories || []).length
  };
  const allDays = [...(data.history || []), todaySnapshot];
  const last7 = allDays.slice(-7);
  const last30 = allDays.slice(-30);

  const totalDaysTracked = allDays.length;
  const perfectDays = allDays.filter(d => d.allMeals).length;
  const avgCalories7 = last7.length > 0 ? Math.round(last7.reduce((s, d) => s + d.calories, 0) / last7.length) : 0;
  const avgWater7 = last7.length > 0 ? (last7.reduce((s, d) => s + d.water, 0) / last7.length).toFixed(1) : 0;
  const daysHitGoal30 = last30.filter(d => d.water >= data.waterGoal).length;
  const maxCal = Math.max(...last7.map(d => d.calories), data.dailyGoal, 100);
  const dayShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const formatDayShort = (dateStr) => { const d = new Date(dateStr); return dayShort[d.getDay()]; };

  return (
    <div className="px-6 animate-fade-up space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<StreakIcon size={18} />} label="Серия" value={data.streak || 0} unit="дней" color="#F59E0B" />
        <StatCard icon={<Check size={18} />} label="Идеальных дней" value={perfectDays} unit="дней" color="#10B981" />
        <StatCard icon={<Flame size={18} />} label="Средние калории" value={avgCalories7} unit="ккал/день" color="#EF4444" />
        <StatCard icon={<Droplet size={18} />} label="Средняя вода" value={avgWater7} unit="стаканов" color="#0EA5E9" />
      </div>

      <div className="rounded-3xl p-5 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">КАЛОРИИ</p><p className="font-display text-lg font-bold mt-0.5 text-slate-900">Последние 7 дней</p></div>
          <div className="text-right"><p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Цель</p><p className="font-display font-bold text-sm text-blue-600">{data.dailyGoal} ккал</p></div>
        </div>
        {last7.length === 0 ? <p className="font-body text-sm py-6 text-center text-slate-400">Данные появятся после 7 дней трекинга</p> : (
          <div className="flex items-end gap-2 h-[140px]">
            {last7.map((d, i) => {
              const heightPct = maxCal > 0 ? (d.calories / maxCal) * 100 : 0;
              const isToday = i === last7.length - 1;
              const reached = d.calories >= data.dailyGoal * 0.8;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end relative">
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(heightPct, 2)}%`, background: isToday ? 'linear-gradient(180deg, #2563EB, #0EA5E9)' : (reached ? '#93C5FD' : '#DBEAFE') }}></div>
                  <span className="font-body text-[10px] mt-1.5 font-semibold text-slate-500">{formatDayShort(d.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl p-5 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">ВОДА</p><p className="font-display text-lg font-bold mt-0.5 text-slate-900">Последние 7 дней</p></div>
          <div className="text-right"><p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Цель</p><p className="font-display font-bold text-sm text-cyan-600">{data.waterGoal} стак.</p></div>
        </div>
        {last7.length === 0 ? <p className="font-body text-sm py-6 text-center text-slate-400">Данные появятся после недели</p> : (
          <div className="space-y-2">
            {last7.map((d, i) => {
              const widthPct = Math.min((d.water / data.waterGoal) * 100, 100);
              const hitGoal = d.water >= data.waterGoal;
              return (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="font-body text-xs font-semibold w-7 text-slate-500">{formatDayShort(d.date)}</span>
                  <div className="flex-1 h-6 rounded-full relative overflow-hidden bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${widthPct}%`, background: hitGoal ? 'linear-gradient(90deg, #0EA5E9, #2563EB)' : '#93C5FD' }}></div></div>
                  <span className="font-display font-bold text-sm w-8 text-right text-slate-700">{d.water}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-3xl p-5 bg-white shadow-md">
        <div><p className="text-xs uppercase tracking-[0.18em] font-body font-semibold text-slate-400">ПРИЁМЫ ПИЩИ</p><p className="font-display text-lg font-bold mt-0.5 text-slate-900">Календарь (30 дней)</p></div>
        {last30.length === 0 ? <p className="font-body text-sm py-6 text-center text-slate-400">Данные появятся позже</p> : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {last30.map(d => {
                let bg = '#EFF6FF';
                if (d.meals === 3) bg = '#0D9488';
                else if (d.meals === 2) bg = '#5EEAD4';
                else if (d.meals === 1) bg = '#CCFBF1';
                return <div key={d.date} className="w-5 h-5 rounded" style={{ backgroundColor: bg, border: d.allMeals ? '1px solid #0D9488' : 'none' }} title={`${d.date}: ${d.meals} приёма`}></div>;
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-body font-semibold text-slate-400"><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-700"></span>3 приёма</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-300"></span>2 приёма</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-100"></span>1 приём</span><span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-100"></span>нет данных</span></div>
          </>
        )}
      </div>

      <div className="rounded-3xl p-5 bg-white shadow-md">
        <p className="text-xs uppercase tracking-[0.18em] font-body font-semibold mb-1 text-slate-400">ВОДНЫЙ БАЛАНС</p>
        <p className="font-display text-lg font-bold mb-3 text-slate-900">{daysHitGoal30} / {last30.length} дней с нормой воды</p>
        <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${last30.length > 0 ? (daysHitGoal30 / last30.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #0EA5E9, #2563EB)' }}></div></div>
      </div>

      {totalDaysTracked < 3 && (
        <div className="rounded-3xl p-5 text-center bg-blue-100">
          <p className="font-body text-sm text-blue-800"><span className="font-bold">Продолжайте отмечать каждый день</span><br />Через неделю появится больше статистики</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, color }) {
  return (
    <div className="rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-2"><div style={{ color }}>{icon}</div><p className="text-[10px] uppercase tracking-wider font-body font-semibold text-slate-400">{label}</p></div>
      <p className="font-display text-2xl font-bold leading-none text-slate-900">{value}</p>
      <p className="font-body text-[11px] mt-1 text-slate-400">{unit}</p>
    </div>
  );
}