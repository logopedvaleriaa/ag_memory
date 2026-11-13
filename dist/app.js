'use strict';
const exercises=[
['Лягушка','Улыбнись, покажи зубки. Губы растяни в улыбке, зубы не сжимай. Удерживай улыбку спокойно.','5 секунд'],
['Забор','Улыбнись и покажи сомкнутые зубы, как ровный заборчик. Удерживай положение без напряжения.','5 секунд'],
['Слоник','Сомкни зубы, а губы вытяни вперёд трубочкой, как хобот слоника. Затем расслабь губы.','5 секунд'],
['Маляр','Приоткрой рот и улыбнись. Кончиком языка поглаживай нёбо от верхних зубов назад и обратно. Нижняя челюсть остаётся неподвижной.','5 повторов'],
['Парус','Улыбнись и широко открой рот. Подними кончик языка к бугоркам за верхними зубами. Удерживай его наверху, как парус.','5 секунд'],
['Качели','Улыбнись и приоткрой рот. Тянись кончиком языка то к верхним зубам, то к нижним. Двигай языком, сохраняя челюсть неподвижной.','5 повторов'],
['Вкусное варенье','Улыбнись и приоткрой рот. Широким языком оближи верхнюю губу движением сверху вниз. Старайся не помогать нижней губой.','5 повторов'],
['Часы','Улыбнись и приоткрой рот. Кончиком языка поочерёдно касайся правого и левого уголков рта: тик-так!','5 повторов'],
['Чистим зубы','Улыбнись, приоткрой рот. Кончиком языка проведи по внутренней стороне нижних зубов вправо и влево, будто чистишь их щёткой.','5 повторов'],
['Чашечка','Улыбнись и открой рот. Высуни широкий язык, приподними его края и кончик, чтобы получилась чашечка. Удерживай её без напряжения.','5 секунд'],
['Лопата','Улыбнись и приоткрой рот. Положи широкий, расслабленный язык на нижнюю губу. Не прижимай его зубами.','5 секунд'],
['Барабан','Улыбнись и открой рот. Постучи кончиком языка по бугоркам за верхними зубами, произнося «д-д-д». Челюсть не двигается.','5 повторов'],
['Грибок','Улыбнись, прижми широкий язык к нёбу и медленно открой рот. Язык — шляпка гриба, а уздечка под ним — ножка.','5 секунд'],
['Лошадка','Улыбнись и открой рот. Присоси язык к нёбу и щёлкни им, как цокает лошадка. Старайся не двигать нижней челюстью.','5 повторов'],
['Гармошка','Сделай «Грибок»: присоси язык к нёбу. Медленно открывай и закрывай рот, удерживая язык наверху. Двигайся в удобном для тебя диапазоне.','5 повторов'],
['Комар','Улыбнись и приоткрой рот. Подними кончик языка за верхние зубы и протяжно произнеси «з-з-з», как звенит комарик.','5 секунд']
];

const stories = {
  mail: {
    title: 'Звёздная почта', icon: '✉',
    description: 'Отправляйте письма, которые зажигают звёзды.',
    task: 'Отправь письмо с желанием — зажги звезду.',
    collection: 'Зажжённые звёзды', reward: 'Письмо с желанием',
    finish: 'Созвездие зажглось!',
    ending: 'Все письма долетели до звёзд. Волшебный городок засиял!'
  },
  workshop: {
    title: 'Мастерская чудес', icon: '⚙',
    description: 'Заряжайте машину светящимися шариками.',
    task: 'Найдите пары, чтобы запустить машину чудес.',
    collection: 'Заряд машины', reward: 'Огонёк',
    finish: 'Машина заработала!',
    ending: 'Все огоньки собраны. Мастерская выпускает бумажных птиц.'
  },
  sea: {
    title: 'Море находок', icon: '◌',
    description: 'Собирайте жемчужины в морской сундук.',
    task: 'Найдите пары и наполните сундук жемчужинами.',
    collection: 'Жемчужины в сундуке', reward: 'Жемчужина',
    finish: 'Сокровища собраны!',
    ending: 'Сундук наполнен. Светящиеся рыбки отправляются в море.'
  }
};
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
let selected = new Set([0, 2, 6, 7, 9, 13]);
let favorites = new Set();
let filter = 'all';
let seconds = 10;
let storyId = null; // Every visit starts with an explicit story choice.
let pickerReturn = null;
let view = 'stories';
let deck = [];
let opened = [];
let matched = new Set();
let moves = 0;
let completed = 0;
let locked = false;
let epoch = 0;
let timer = null;
let remaining = 0;
let activeExercise = null;
let focusedCardIndex = 0;
let collected = [];
const pending = new Set();
let boardObserver = null;
function setView(next) {
  view = next;
  document.body.dataset.view = next;
  if (boardObserver) boardObserver.disconnect();
}
// Pick the largest cards that fit the available area, keeping empty matched
// slots in place so the board never moves during a game.
function fitBoard() {
  if (view !== 'game') return;
  const board = app.querySelector('.board');
  if (!board) return;
  const width = board.clientWidth;
  const height = board.clientHeight;
  const gap = parseFloat(getComputedStyle(board).columnGap) || 6;
  if (!width || !height) return;
  let best = { size: 0, columns: 1, rows: deck.length };
  for (let columns = 1; columns <= deck.length; columns++) {
    const rows = Math.ceil(deck.length / columns);
    const size = Math.min(200, (width - gap * (columns - 1)) / columns, (height - gap * (rows - 1)) / rows * 1.08);
    if (size > best.size + .1) best = { size, columns, rows };
  }
  board.style.setProperty('--columns', best.columns);
  board.style.setProperty('--rows', best.rows);
  board.style.setProperty('--card-width', `${Math.max(1, Math.floor(best.size))}px`);
  board.style.setProperty('--card-height', `${Math.max(1, Math.floor(best.size / 1.08))}px`);
}
function observeBoard() {
  if (!boardObserver) boardObserver = new ResizeObserver(fitBoard);
  boardObserver.observe(app.querySelector('.board'));
  fitBoard();
}

function readSavedSetting(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
const savedSelection = readSavedSetting('forest-selection', null);
if (Array.isArray(savedSelection)) selected = new Set(savedSelection.filter(validExercise).slice(0, exercises.length));
const savedSeconds = Number(readSavedSetting('forest-duration', null));
if ([5, 10, 15].includes(savedSeconds)) seconds = savedSeconds;
const savedFavorites = readSavedSetting('forest-favorites', []);
if (Array.isArray(savedFavorites)) favorites = new Set(savedFavorites.filter(validExercise));

function plural(number, one, few, many) {
  const lastTwo = number % 100;
  const last = number % 10;
  return lastTwo >= 11 && lastTwo <= 14 ? many : last === 1 ? one : last >= 2 && last <= 4 ? few : many;
}
function validExercise(id) {
  return Number.isInteger(id) && id >= 0 && id < exercises.length;
}
function saveSettings() {
  try {
    localStorage.setItem('forest-selection', JSON.stringify([...selected]));
    localStorage.setItem('forest-duration', String(seconds));
    localStorage.setItem('forest-favorites', JSON.stringify([...favorites]));
  } catch {}
}
function later(callback, delay) {
  const currentEpoch = epoch;
  const handle = setTimeout(() => {
    pending.delete(handle);
    if (currentEpoch === epoch) callback();
  }, delay);
  pending.add(handle);
}
function clearPending() {
  epoch++;
  clearInterval(timer);
  pending.forEach(clearTimeout);
  pending.clear();
  document.querySelectorAll('.delivery-token').forEach(node => node.remove());
}
function applyStory() {
  const story = stories[storyId];
  document.body.dataset.story = story ? storyId : 'picker';
  document.querySelector('#brand-title').textContent = story ? story.title : 'Открой волшебство';
  document.querySelector('.brand-icon').textContent = story ? story.icon : '✧';
  document.title = story ? `${story.title} · Открой волшебство` : 'Открой волшебство — Артикуляционная игра мемори';
}
// Individual [x, y, width, height] bounds, including a transparent edge.
const EXERCISE_ARTWORK = {
  mail: {
    src: 'exercises-mail.png', width: 1254, height: 1254,
    regions: [
      [15, 35, 281, 261],
      [310, 45, 303, 246],
      [632, 24, 302, 280],
      [962, 18, 262, 290],
      [10, 323, 287, 304],
      [311, 325, 304, 300],
      [630, 348, 295, 268],
      [972, 321, 237, 298],
      [37, 642, 236, 282],
      [316, 686, 297, 213],
      [628, 632, 273, 297],
      [929, 661, 306, 264],
      [16, 946, 269, 287],
      [304, 932, 291, 299],
      [619, 978, 306, 235],
      [946, 954, 290, 273]
    ]
  },
  workshop: {
    src: 'exercises-workshop.png', width: 1254, height: 1254,
    regions: [
      [15, 36, 282, 264],
      [308, 40, 309, 253],
      [630, 24, 304, 283],
      [966, 17, 259, 293],
      [6, 323, 292, 302],
      [307, 324, 310, 301],
      [624, 349, 296, 268],
      [971, 324, 239, 295],
      [37, 641, 236, 281],
      [320, 685, 295, 213],
      [627, 633, 272, 299],
      [927, 662, 311, 259],
      [18, 949, 263, 285],
      [293, 932, 301, 303],
      [619, 978, 307, 235],
      [948, 952, 289, 270]
    ]
  },
  sea: {
    src: 'exercises-sea.png', width: 1254, height: 1254,
    regions: [
      [13, 39, 283, 263],
      [309, 49, 301, 248],
      [631, 28, 300, 279],
      [965, 20, 259, 289],
      [13, 327, 285, 298],
      [306, 323, 305, 299],
      [631, 347, 298, 269],
      [971, 323, 236, 293],
      [36, 644, 234, 277],
      [319, 685, 292, 210],
      [619, 635, 278, 293],
      [928, 660, 305, 260],
      [16, 948, 267, 283],
      [301, 930, 291, 304],
      [619, 980, 308, 231],
      [944, 954, 292, 273]
    ]
  }
};
const COVER_ARTWORK = {
  src: 'card-backs.png', width: 2172, height: 724,
  regions: [
    [17, 18, 685, 662],
    [756, 46, 661, 635],
    [1453, 43, 705, 642]
  ]
};

// Nested SVG viewports show one measured subject, preserving the original PNG.
// The inner viewport has the crop's exact aspect ratio and clips all other art.
function croppedArtwork(sheet, region, className, label = '') {
  const [x, y, width, height] = region;
  const scale = 288 / Math.max(width, height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  return `<svg class="${className}" viewBox="0 0 320 320" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} focusable="false"><svg x="${(320 - drawWidth) / 2}" y="${(320 - drawHeight) / 2}" width="${drawWidth}" height="${drawHeight}" viewBox="${x} ${y} ${width} ${height}" overflow="hidden"><image href="${sheet.src}" width="${sheet.width}" height="${sheet.height}"/></svg></svg>`;
}
function art(id) {
  const sheet = EXERCISE_ARTWORK[storyId] || EXERCISE_ARTWORK.workshop;
  return croppedArtwork(sheet, sheet.regions[id], 'illustration', exercises[id][0]);
}
function cardBack(id) {
  const index = ['mail', 'workshop', 'sea'].indexOf(id);
  return croppedArtwork(COVER_ARTWORK, COVER_ARTWORK.regions[index], `card-back-art cover-${id}`);
}
const storyArt = id => `<img class="story-art" src="${id === 'mail' ? 'mail-magic' : id === 'sea' ? 'sea-refined' : id + '-transparent'}.png" alt="${id === 'mail' ? 'Волшебный почтовый ящик на облаке' : id === 'workshop' ? 'Машина чудес' : 'Сундук с жемчужинами'}" draggable="false">`;
const reward = (id, title = '') => `<span class="reward reward-${id}" ${title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"'}>${id === 'mail' ? '✉' : ''}</span>`;

// Each completed exercise lights its own star. Two SVG arrangements keep
// the constellation readable in both sidebar and compact mobile layouts.
function mailConstellation() {
  const ids = [...selected];
  function sky(columns, className) {
    columns = Math.min(columns, ids.length);
    const rows = Math.ceil(ids.length / columns);
    const points = ids.map((id, index) => {
      const row = Math.floor(index / columns);
      const col = row % 2 ? columns - 1 - index % columns : index % columns;
      return { id, x: columns === 1 ? 100 : 15 + col * 170 / (columns - 1), y: 14 + row * 25 + (col % 2) * 5 };
    });
    const links = points.slice(1).map((point, index) => {
      const previous = points[index];
      const lit = collected.includes(point.id) && collected.includes(previous.id);
      return `<line class="constellation-link ${lit ? 'lit' : ''}" x1="${previous.x}" y1="${previous.y}" x2="${point.x}" y2="${point.y}"/>`;
    }).join('');
    const stars = points.map(point => `<g class="constellation-star ${collected.includes(point.id) ? 'lit' : ''} ${collected.at(-1) === point.id ? 'new-star' : ''}" transform="translate(${point.x} ${point.y})"><circle class="star-halo" r="11"/><path class="star-shape" d="M0-6 1.9-1.9 6 0 1.9 1.9 0 6-1.9 1.9-6 0-1.9-1.9Z"/></g>`).join('');
    return `<svg class="${className}" viewBox="0 0 200 ${rows * 25 + 9}" aria-hidden="true">${links}${stars}</svg>`;
  }
  return `<div class="mail-constellation" role="img" aria-label="Зажжено звёзд: ${completed} из ${selected.size}" data-lit-count="${completed}">${sky(4, 'constellation-full')}${sky(8, 'constellation-compact')}</div>`;
}
function collectionItems() {
  if (storyId === 'mail') return mailConstellation();
  const story = stories[storyId];
  return `<div class="collection-items">${[...selected].map((id, index) => `<span class="reward-slot ${collected.includes(id) ? 'filled' : ''}" title="${collected.includes(id) ? exercises[id][0] : 'Ещё не собрано'}">${reward(storyId, `${story.reward} ${index + 1}${collected.includes(id) ? ': ' + exercises[id][0] : ': не собрано'}`)}</span>`).join('')}</div>`;
}
function mailSparkles() {
  return `<span class="postal-sparkles" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--spark:${i}">✧</i>`).join('')}</span>`;
}
const endingArt = id => id === 'mail' ? '<img class="story-art" src="wishes-sky.png" alt="Волшебный городок под сияющим созвездием" draggable="false">' : storyArt(id);

function showStories(returnTo = null) {
  setView('stories');
  pickerReturn = returnTo;
  modal.close();
  document.body.dataset.story = 'picker';
  document.querySelector('#brand-title').textContent = 'Открой волшебство';
  document.querySelector('.brand-icon').textContent = '✧';
  document.title = 'Открой волшебство — Артикуляционная игра мемори';
  app.innerHTML = `<section class="story-picker">
    <div class="picker-heading"><h1>Выберите сюжет</h1>${returnTo ? '<button class="secondary" id="picker-back">← Вернуться</button>' : ''}</div>
    <div class="story-options">${Object.entries(stories).map(([id, story]) => `
      <button class="story-option" data-story-option="${id}">
        <span class="story-preview story-preview-${id}">${storyArt(id)}</span>
        <strong>${story.title}</strong>
        <span class="story-description">${story.description}</span>
        <span class="story-enter">Выбрать <span aria-hidden="true">→</span></span>
      </button>`).join('')}</div>
  </section>`;
  app.querySelectorAll('[data-story-option]').forEach(button => {
    button.onclick = () => {
      storyId = button.dataset.storyOption;
      applyStory();
      if (pickerReturn === 'game') renderGame();
      else selection();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  });
  if (returnTo) document.querySelector('#picker-back').onclick = () => {
    applyStory();
    returnTo === 'game' ? renderGame() : selection();
  };
}

function selection() {
  if (!storyId) return showStories();
  const previousView = view;
  const activeControl = document.activeElement;
  let focusSelector = null;
  if (activeControl && app.contains(activeControl)) {
    for (const key of ['select', 'favorite', 'filter']) {
      if (activeControl.dataset[key] !== undefined) focusSelector = `[data-${key}="${activeControl.dataset[key]}"]`;
    }
    if (['select-all', 'clear', 'duration', 'start'].includes(activeControl.id)) focusSelector = `#${activeControl.id}`;
  }
  clearPending();
  activeExercise = null;
  locked = false;
  modal.oncancel = null;
  modal.close();
  setView('selection');
  applyStory();
  saveSettings();
  const story = stories[storyId];
  app.innerHTML = `<section class="selection-screen">
    <div class="chosen-story">${storyArt(storyId)}<strong>${story.title}</strong><button class="text-btn" id="change-story">Сменить сюжет</button></div>
    <div class="section-head"><div><h1>Выберите упражнения</h1><p>От 2 до 16 упражнений для одной игры</p></div>
      <div class="filters"><button data-filter="all" class="${filter === 'all' ? 'active' : ''}">Все упражнения</button><button data-filter="favorites" class="${filter === 'favorites' ? 'active' : ''}">☆ Избранное</button></div>
    </div>
    <div class="grid">${exercises.map((exercise, id) => filter === 'favorites' && !favorites.has(id) ? '' : `
      <article class="exercise ${selected.has(id) ? 'selected' : ''}">
        <button class="favorite" data-favorite="${id}" aria-label="${favorites.has(id) ? 'Убрать из избранного' : 'В избранное'}: ${exercise[0]}" aria-pressed="${favorites.has(id)}">${favorites.has(id) ? '★' : '☆'}</button>
        <button class="card-select" data-select="${id}" aria-pressed="${selected.has(id)}"><span class="tick">${selected.has(id) ? '✓' : ''}</span>${art(id)}<strong>${exercise[0]}</strong><small>${selected.has(id) ? 'Выбрано' : 'Выбрать'}</small></button>
      </article>`).join('') || '<p class="empty">Нет избранных упражнений. Нажмите ☆ на карточке, чтобы добавить.</p>'}
    </div></section>
    <div class="selection-bar"><div><strong>Выбрано: ${selected.size} из 16</strong><small>${selected.size * 2} ${plural(selected.size * 2, 'карточка', 'карточки', 'карточек')} · ${selected.size} ${plural(selected.size, 'упражнение', 'упражнения', 'упражнений')}</small></div>
      <div class="selection-actions" role="group" aria-label="Выбор всех упражнений">
        <button class="text-btn" id="select-all">Выбрать все</button>
        <button class="text-btn" id="clear">Сбросить все</button>
      </div>
      <label class="settings">Таймер <select id="duration">${[5, 10, 15].map(value => `<option value="${value}" ${seconds === value ? 'selected' : ''}>${value} сек</option>`).join('')}</select></label>
      <button class="primary" id="start" ${selected.size < 2 ? 'disabled' : ''}>Начать игру <span aria-hidden="true" style="margin-left:17px">→</span></button>
    </div>`;
  app.querySelectorAll('[data-select]').forEach(button => button.onclick = () => {
    const id = Number(button.dataset.select);
    selected.has(id) ? selected.delete(id) : selected.add(id);
    selection();
  });
  app.querySelectorAll('[data-favorite]').forEach(button => button.onclick = () => {
    const id = Number(button.dataset.favorite);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    selection();
  });
  app.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
    filter = button.dataset.filter;
    selection();
  });
  document.querySelector('#change-story').onclick = () => showStories('selection');
  document.querySelector('#select-all').onclick = () => { selected = new Set(exercises.map((_, id) => id)); selection(); };
  document.querySelector('#clear').onclick = () => { selected.clear(); selection(); };
  document.querySelector('#duration').onchange = event => { seconds = Number(event.target.value); saveSettings(); };
  document.querySelector('#start').onclick = startGame;
  if (focusSelector) {
    const control = app.querySelector(focusSelector) || app.querySelector('[data-filter].active');
    control?.focus({ preventScroll: true });
  } else if (previousView !== 'selection') {
    const heading = app.querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function startGame() {
  if (!storyId || selected.size < 2) return;
  clearPending();
  modal.close();
  activeExercise = null;
  modal.oncancel = null;
  collected = [];
  focusedCardIndex = 0;
  deck = shuffle([...selected, ...selected]);
  opened = [];
  matched.clear();
  moves = 0;
  completed = 0;
  locked = false;
  renderGame();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderGame() {
  const activeCard = document.activeElement?.closest('[data-card]');
  if (activeCard && app.contains(activeCard)) focusedCardIndex = Number(activeCard.dataset.card);
  setView('game');
  applyStory();
  const story = stories[storyId];
  const columns = deck.length <= 6 ? 2 : deck.length > 20 ? 6 : 4;
  app.innerHTML = `<div class="game-top">
    <button class="secondary" id="back" ${locked ? 'disabled' : ''}>← К упражнениям</button>
    <div class="game-tools"><button class="secondary" id="game-story" ${locked ? 'disabled' : ''}>Сменить сюжет</button><button class="secondary" id="restart" aria-label="Начать заново" ${locked ? 'disabled' : ''}>↻</button></div>
    </div>
    <section class="game-heading"><h1>${story.title}</h1><p class="intro" style="margin:auto">${story.task}</p></section>
    <section class="story-scene scene-${storyId} ${completed === selected.size ? 'celebrating' : ''}">
      <aside class="story-destination">
        <div class="destination-image" id="destination">${storyArt(storyId)}${storyId === 'mail' ? mailSparkles() : ''}<span class="destination-glow" aria-hidden="true"></span></div>
        <div class="collection"><span class="eyebrow">${story.collection}</span><strong class="collection-count" aria-live="polite">${completed} / ${selected.size}</strong>
          ${collectionItems()}
          <div class="progress" role="progressbar" aria-label="Выполненные упражнения" aria-valuemin="0" aria-valuemax="${selected.size}" aria-valuenow="${completed}"><span style="width:${completed / selected.size * 100}%"></span></div>
        </div>
      </aside>
      <div class="board" style="--columns:${columns}">${deck.map((id, i) => `
        <button class="memory memory-${storyId} ${opened.includes(i) ? 'open' : ''} ${matched.has(i) ? 'matched' : ''} ${collected.includes(id) ? 'collected' : ''}" data-card="${i}" ${matched.has(i) || locked ? 'disabled' : ''} aria-label="${opened.includes(i) || matched.has(i) ? exercises[id][0] : 'Закрытая карточка ' + (i + 1)}">${opened.includes(i) || matched.has(i) ? art(id) + `<strong>${exercises[id][0]}</strong>` : cardBack(storyId)}</button>`).join('')}
      </div>
    </section><div class="game-status"><span>Попытки: ${moves}</span><span aria-live="polite">Выполнено: ${completed} из ${selected.size}</span></div>`;
  app.querySelectorAll('[data-card]').forEach(button => button.onclick = () => flip(Number(button.dataset.card)));
  document.querySelector('#back').onclick = () => { if (!locked) confirmAction('Вернуться к упражнениям?', 'Текущая игра начнётся заново.', selection); };
  document.querySelector('#restart').onclick = () => { if (!locked) confirmAction('Начать заново?', 'Карточки перемешаются.', startGame); };
  document.querySelector('#game-story').onclick = () => { if (!locked) showStories('game'); };
  observeBoard();
  if (!locked) {
    const cards = [...app.querySelectorAll('[data-card]:not(:disabled)')];
    const next = cards.find(card => Number(card.dataset.card) === focusedCardIndex)
      || cards.find(card => Number(card.dataset.card) > focusedCardIndex)
      || cards[0];
    next?.focus({ preventScroll: true });
  }
}
function flip(index) {
  if (locked || matched.has(index) || opened.includes(index)) return;
  opened.push(index);
  if (opened.length !== 2) { renderGame(); return; }
  moves++;
  locked = true;
  renderGame();
  if (deck[opened[0]] === deck[opened[1]]) {
    later(() => {
      opened.forEach(card => matched.add(card));
      activeExercise = deck[index];
      opened = [];
      renderGame();
      exerciseDialog();
    }, 450);
  } else {
    later(() => { opened = []; locked = false; renderGame(); }, 1100);
  }
}
function openModal(html, kind = 'message') {
  modal.dataset.kind = kind;
  clearInterval(timer);
  modal.oncancel = null;
  modal.innerHTML = `<button class="close" aria-label="Закрыть">×</button>${html}`;
  if (!modal.open) modal.showModal();
  modal.querySelector('.close').onclick = () => modal.close();
}
function showMessage(title, body) {
  openModal(`<h2>${title}</h2><p>${body}</p><button class="primary" id="ok">Понятно</button>`);
  modal.querySelector('#ok').onclick = () => modal.close();
}
function confirmAction(title, body, action) {
  openModal(`<h2>${title}</h2><p>${body}</p><div class="dialog-actions"><button class="primary" id="yes">Да, продолжить</button><button class="text-btn" id="no">Остаться в игре</button></div>`);
  modal.querySelector('#yes').onclick = () => { modal.close(); action(); };
  modal.querySelector('#no').onclick = () => modal.close();
}
function exerciseDialog() {
  const id = activeExercise;
  const exerciseEpoch = epoch;
  openModal(`${art(id)}<h2>${exercises[id][0]}</h2><div class="timer" aria-live="polite"></div><div class="dialog-actions"><button class="primary" id="done">Выполнили</button></div>`, 'exercise');
  modal.querySelector('.close').remove();
  modal.oncancel = event => event.preventDefault();
  const timerDisplay = modal.querySelector('.timer');
  remaining = seconds;
  const deadline = Date.now() + seconds * 1000;
  timerDisplay.innerHTML = `${remaining}<small style="font-size:14px"> сек</small>`;
  const countdown = setInterval(() => {
    if (epoch !== exerciseEpoch || activeExercise !== id) {
      clearInterval(countdown);
      return;
    }
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (remaining <= 0) finishExercise();
    else timerDisplay.innerHTML = `${remaining}<small style="font-size:14px"> сек</small>`;
  }, 1000);
  timer = countdown;
  function finishExercise() {
    if (epoch !== exerciseEpoch || activeExercise !== id) return;
    clearInterval(countdown);
    if (timer === countdown) timer = null;
    modal.oncancel = null;
    modal.close();
    activeExercise = null;
    deliverReward(id);
  }
  modal.querySelector('#done').onclick = finishExercise;
}
function deliverReward(id) {
  const destination = document.querySelector('#destination');
  const cards = [...app.querySelectorAll('[data-card]')].filter(card => deck[Number(card.dataset.card)] === id);
  const target = destination.getBoundingClientRect();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) cards.forEach((card, index) => {
    const source = card.getBoundingClientRect();
    const token = document.createElement('span');
    token.className = 'delivery-token';
    token.setAttribute('aria-hidden', 'true');
    token.innerHTML = reward(storyId);
    token.style.left = `${source.left + source.width / 2 - 20}px`;
    token.style.top = `${source.top + source.height / 2 - 20}px`;
    token.style.setProperty('--flight-x', `${target.left + target.width / 2 - source.left - source.width / 2}px`);
    token.style.setProperty('--flight-y', `${target.top + target.height * .65 - source.top - source.height / 2}px`);
    token.style.animationDelay = `${index * 90}ms`;
    document.body.appendChild(token);
    later(() => token.remove(), 1000);
  });
  cards.forEach(card => card.classList.add('departing'));
  later(() => {
    collected.push(id);
    completed++;
    locked = false;
    renderGame();
    document.querySelector('#destination').classList.add('received');
    app.querySelector('.collection').classList.add('reward-received');
    if (completed === selected.size) {
      locked = true;
      renderGame();
      later(victory, reduceMotion ? 0 : 1800);
    }
  }, reduceMotion ? 0 : 950);
}
function victory() {
  locked = false;
  const story = stories[storyId];
  const particle = storyId === 'mail' ? '✧' : storyId === 'workshop'
    ? '<svg viewBox="0 0 50 40"><path fill="#d4c6a4" d="M3 27 19 21 15 3 31 18 43 13 48 18 39 22 32 34 16 33Z"/><path fill="#f3e7cc" d="m16 33 8-13 14-15-6 29Z"/><path fill="none" stroke="#ad9c7c" d="m16 33 8-13 8 14"/></svg>'
    : '<svg viewBox="0 0 50 30"><path fill="#9bc5be" d="M3 15Q23-8 39 15 23 38 3 15m33 0 12-11v22Z"/><circle fill="#567f7d" cx="13" cy="13" r="2"/><path fill="#dbe8dd" d="m21 13 8-6-2 12Z"/></svg>';
  const particles = Array.from({ length: 5 }, (_, i) => `<span class="ending-particle particle-${storyId}" style="--i:${i}" aria-hidden="true">${particle}</span>`).join('');
  openModal(`<div class="ending-illustration ending-${storyId}">${endingArt(storyId)}${particles}</div><h2>${story.finish}</h2><p>${story.ending}</p><p><b>${moves}</b> ${plural(moves, 'попытка', 'попытки', 'попыток')} · <b>${completed}</b> ${plural(completed, 'упражнение', 'упражнения', 'упражнений')}</p><div class="dialog-actions"><button class="primary" id="again">Сыграть ещё раз</button><button class="text-btn" id="choose">К упражнениям</button><button class="text-btn" id="new-story">Другой сюжет</button></div>`, 'finish');
  modal.querySelector('.close').onclick = selection;
  modal.oncancel = event => { event.preventDefault(); selection(); };
  modal.querySelector('#again').onclick = startGame;
  modal.querySelector('#choose').onclick = selection;
  modal.querySelector('#new-story').onclick = () => { clearPending(); showStories(); };
}
document.querySelector('.help').onclick = () => {
  if (activeExercise !== null || locked) return;
  showMessage('Как играть', 'Выберите сюжет и от 2 до 16 упражнений.<br><br>Открывайте по две карточки и ищите пары. Нашли пару — выполните упражнение. Таймер включится сам.<br><br>После отсчёта окно закроется, а награда отправится в выбранный сюжет.');
};
document.querySelector('.brand').onclick = event => {
  event.preventDefault();
  if (activeExercise !== null || locked) return;
  if (view === 'game') confirmAction('Вернуться к выбору сюжета?', 'Текущая игра начнётся заново.', () => { clearPending(); showStories(); });
  else showStories();
};
showStories();
