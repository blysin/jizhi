// Using the same storage mechanism as the main app
const storager = {
  set: (obj, callback) => {
    const key = Object.keys(obj)[0];
    const value = JSON.stringify(obj);
    localStorage.setItem(key, value);
    if (callback) callback();
  },
  get: (keys, callback) => {
    let resOutput = {};
    keys.forEach((key) => {
      let result = localStorage.getItem(key);
      try {
        result = JSON.parse(result) || {};
      } catch (e) {
        result = {};
      }
      resOutput = { ...resOutput, ...result };
    });
    if (callback) callback(resOutput);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-to-nav-form');
  const titleInput = document.getElementById('link-title');
  const urlInput = document.getElementById('link-url');
  const groupSelect = document.getElementById('group-select');
  const newGroupNameInput = document.getElementById('new-group-name');
  const statusMessage = document.getElementById('status-message');

  // --- Initialization ---

  // 1. Populate group dropdown
  storager.get(['navigationColumns'], (result) => {
    const columns = result.navigationColumns;
    if (columns && Array.isArray(columns) && columns.length > 0) {
      columns.forEach((column, index) => {
        const option = document.createElement('option');
        option.value = index.toString();
        option.textContent = column.title;
        groupSelect.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.textContent = '无可用分组';
      option.disabled = true;
      groupSelect.appendChild(option);
    }
  });

  // 2. Fetch current tab info and populate title/url fields
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      titleInput.value = tab.title || '';
      urlInput.value = tab.url || '';
    }
  });

  // --- Form Submission ---

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const pageTitle = titleInput.value.trim();
    const pageUrl = urlInput.value.trim();

    if (!pageTitle || !pageUrl) {
      statusMessage.textContent = '标题和地址不能为空。';
      setTimeout(() => (statusMessage.textContent = ''), 2000);
      return;
    }

    if (pageUrl.startsWith('chrome://') || pageUrl.startsWith('about:')) {
      statusMessage.textContent = '不能添加浏览器特殊页面。';
      setTimeout(() => (statusMessage.textContent = ''), 2000);
      return;
    }

    storager.get(['navigationColumns'], (result) => {
      let columns = result.navigationColumns;
      if (!columns || !Array.isArray(columns)) {
        columns = [];
      }

      const newLink = { name: pageTitle, url: pageUrl };
      const newGroupName = newGroupNameInput.value.trim();

      if (newGroupName) {
        const newGroup = { title: newGroupName, links: [newLink] };
        columns.push(newGroup);
      } else {
        if (columns.length === 0) {
          columns.push({ title: '默认列', links: [newLink] });
        } else {
          const selectedGroupIndex = parseInt(groupSelect.value, 10);
          if (columns[selectedGroupIndex]) {
            columns[selectedGroupIndex].links.push(newLink);
          } else {
            columns[0].links.push(newLink);
          }
        }
      }

      storager.set({ navigationColumns: columns }, () => {
        statusMessage.textContent = '添加成功！';
        setTimeout(() => window.close(), 1000);
      });
    });
  });
});
