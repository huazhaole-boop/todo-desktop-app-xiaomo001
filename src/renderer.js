// 渲染进程逻辑（Electron 版）：增删勾选、时钟、动画，数据走 window.api 存 JSON 文件
const $ = (id) => document.getElementById(id);

// ====== 时钟 ======
function updateClock() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  $('time').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const m = now.getMonth() + 1, d = now.getDate();
  const wk = ['日', '一', '二', '三', '四', '五', '六'];
  $('date').textContent = `${m}月${d}日 · 周${wk[now.getDay()]}`;
}
setInterval(updateClock, 1000);
updateClock();

// ====== 眨眼 ======
function blink() {
  document.querySelectorAll('.eye').forEach(e => e.classList.add('blink'));
  setTimeout(() => document.querySelectorAll('.eye').forEach(e => e.classList.remove('blink')), 130);
  setTimeout(blink, 2500 + Math.random() * 2500);
}
setTimeout(blink, 1500);

// ====== 数据 ======
let todos = [];

async function loadTodos() {
  const data = await window.api.readTodos();
  todos = (data && Array.isArray(data.todos)) ? data.todos : [];
  render();
}
async function saveTodos() {
  await window.api.writeTodos({ todos });
}

function render() {
  const list = $('todo-list');
  list.innerHTML = '';
  if (todos.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '— 还没有待办，写下今天要做的事 —';
    list.appendChild(empty);
  } else {
    todos.forEach((t) => {
      const item = document.createElement('div');
      item.className = 'todo-item' + (t.done ? ' done' : '');

      const check = document.createElement('div');
      check.className = 'todo-check';
      check.addEventListener('click', () => toggle(t.id));

      const text = document.createElement('div');
      text.className = 'todo-text';
      text.textContent = t.text;
      text.addEventListener('dblclick', () => editTodo(t.id, text));

      const del = document.createElement('button');
      del.className = 'todo-del';
      del.textContent = '×';
      del.addEventListener('click', () => remove(t.id));

      item.appendChild(check);
      item.appendChild(text);
      item.appendChild(del);
      list.appendChild(item);
    });
  }
  const done = todos.filter(t => t.done).length;
  $('progress-count').textContent = `${done} / ${todos.length}`;
  const pct = todos.length === 0 ? 0 : (done / todos.length) * 100;
  $('progress-fill').style.width = pct + '%';
}

function add(text) {
  text = (text || '').trim();
  if (!text) return;
  todos.unshift({ id: Date.now() + Math.random(), text, done: false });
  saveTodos();
  render();
}
function toggle(id) {
  const t = todos.find(x => x.id === id);
  if (t) { t.done = !t.done; saveTodos(); render(); }
}
function remove(id) {
  todos = todos.filter(x => x.id !== id);
  saveTodos();
  render();
}
function editTodo(id, el) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = t.text;
  input.style.cssText = 'flex:1;border:none;outline:none;background:transparent;font-size:15px;color:#1e293b;font-family:inherit;';
  el.replaceWith(input);
  input.focus();
  input.select();
  const finish = () => {
    const v = input.value.trim();
    if (v) { t.text = v; saveTodos(); }
    render();
  };
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { render(); }
  });
}

// ====== 常驻底部输入 ======
const quickInput = $('quick-input');
quickInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const v = quickInput.value.trim();
    if (v) {
      add(v);
      quickInput.value = '';
    }
  } else if (e.key === 'Escape') {
    quickInput.value = '';
    quickInput.blur();
  }
});

// N 键聚焦
document.addEventListener('keydown', (e) => {
  if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement !== quickInput) {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    quickInput.focus();
    quickInput.select();
  }
});

// 双击列表/底部 → 聚焦
$('todo-list').addEventListener('dblclick', (e) => {
  if (e.target === $('todo-list') || e.target.classList.contains('empty')) {
    quickInput.focus();
  }
});
document.querySelector('.bottom').addEventListener('dblclick', () => quickInput.focus());

// 关闭 → 隐藏到悬浮球
$('btn-hide').addEventListener('click', () => window.api.hideWindow());

// 最小化到任务栏
$('btn-min').addEventListener('click', () => window.api.minimizeWindow());

// 置顶开关
let isPinned = true;
$('btn-pin').classList.add('pin-on');
$('btn-pin').addEventListener('click', async () => {
  isPinned = await window.api.toggleTop();
  $('btn-pin').classList.toggle('pin-on', isPinned);
  $('btn-pin').title = isPinned ? '取消置顶' : '置顶';
});

// 启动
loadTodos();
