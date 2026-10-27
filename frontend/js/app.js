/**
 * Enterprise Podcast Episode Management System
 * Student ID: 2400030188
 * SOA Full-Stack Docker Exam Project
 */

// Docker serves the frontend and proxies API routes through the same origin.
// Keeping requests same-origin avoids browser/CORS and host-resolution issues.
const getApiBaseUrl = () => {
  return window.location.protocol === 'file:' ? 'http://localhost:8081' : window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

// Application State
let episodesList = [];
let selectedEpisodeIds = new Set();
let currentView = localStorage.getItem('podcast_view_mode') || 'table'; // 'table' or 'grid'
let currentSort = 'date-desc';
let currentDurationFilter = 'all';
let currentHostFilter = '';
let searchQuery = '';
let pendingDeleteId = null;
let pendingEditId = null;

// Audio Player State Simulation
let isAudioPlaying = false;
let audioTimer = null;
let audioCurrentSeconds = 0;
let audioTotalSeconds = 0;
let audioPlaybackRate = 1.0;

// Curated Seed Episodes for Demo
const SEED_DATASET = [
  {
    title: 'Architecting Cloud-Native Microservices with Docker',
    host: 'Dr. Sarah Jenkins',
    duration: 48,
    date: '2025-03-15'
  },
  {
    title: 'The Evolution of Service-Oriented Architectures',
    host: 'Marcus Vance',
    duration: 62,
    date: '2025-04-02'
  },
  {
    title: 'Building Resilient APIs with Spring Boot 3 & Java 21',
    host: 'Priya Sharma',
    duration: 35,
    date: '2025-05-18'
  },
  {
    title: 'Continuous Deployment & GitHub Actions Pipelines',
    host: 'David O\'Connor',
    duration: 55,
    date: '2025-06-10'
  }
];
let sampleIndex = 0;

// DOM Elements
const form = document.getElementById('addEpisodeForm');
const formAlertBox = document.getElementById('formAlertBox');
const btnSubmit = document.getElementById('btnSubmitEpisode');
const btnSubmitSpinner = document.getElementById('btnSubmitSpinner');
const btnSubmitText = document.getElementById('btnSubmitText');
const btnResetForm = document.getElementById('btnResetForm');
const btnFillSample = document.getElementById('btnFillSample');
const btnQuickSeed = document.getElementById('btnQuickSeed');
const btnEmptySeed = document.getElementById('btnEmptySeed');

const titleInput = document.getElementById('episodeTitle');
const hostInput = document.getElementById('hostName');
const durationInput = document.getElementById('durationMinutes');
const dateInput = document.getElementById('releaseDate');
const titleCounter = document.getElementById('titleCounter');
const hostCounter = document.getElementById('hostCounter');

const episodesTableBody = document.getElementById('episodesTableBody');
const gridContainer = document.getElementById('gridContainer');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tableContainer = document.getElementById('tableContainer');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const btnRefresh = document.getElementById('btnRefreshEpisodes');
const refreshIcon = document.getElementById('refreshIcon');
const btnImportData = document.getElementById('btnImportData');
const importFileInput = document.getElementById('importFileInput');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const tableRecordCountBadge = document.getElementById('tableRecordCountBadge');
const filterActiveNotice = document.getElementById('filterActiveNotice');
const btnResetFilters = document.getElementById('btnResetFilters');

const statTotalEpisodes = document.getElementById('statTotalEpisodes');
const statTotalDuration = document.getElementById('statTotalDuration');
const statTotalHosts = document.getElementById('statTotalHosts');
const statAvgDuration = document.getElementById('statAvgDuration');
const backendStatusBadge = document.getElementById('backendStatusBadge');
const toastContainer = document.getElementById('toastContainer');

// View Toggle Buttons
const btnViewTable = document.getElementById('btnViewTable');
const btnViewGrid = document.getElementById('btnViewGrid');

// Bulk Actions Bar Elements
const bulkActionsBar = document.getElementById('bulkActionsBar');
const bulkCountBadge = document.getElementById('bulkCountBadge');
const btnBulkExport = document.getElementById('btnBulkExport');
const btnBulkDelete = document.getElementById('btnBulkDelete');
const btnBulkDeselect = document.getElementById('btnBulkDeselect');

// Delete Modal Elements
const deleteModalEl = document.getElementById('deleteConfirmModal');
const deleteModal = new bootstrap.Modal(deleteModalEl);
const deleteTargetTitle = document.getElementById('deleteTargetTitle');
const deleteTargetMeta = document.getElementById('deleteTargetMeta');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnDeleteSpinner = document.getElementById('btnDeleteSpinner');

// Bulk Delete Modal Elements
const bulkDeleteModalEl = document.getElementById('bulkDeleteConfirmModal');
const bulkDeleteModal = new bootstrap.Modal(bulkDeleteModalEl);
const bulkDeleteCount = document.getElementById('bulkDeleteCount');
const btnConfirmBulkDelete = document.getElementById('btnConfirmBulkDelete');
const btnBulkDeleteSpinner = document.getElementById('btnBulkDeleteSpinner');

// Edit Modal Elements
const editModalEl = document.getElementById('editEpisodeModal');
const editModal = new bootstrap.Modal(editModalEl);
const editForm = document.getElementById('editEpisodeForm');
const editIdInput = document.getElementById('editEpisodeId');
const editTitleInput = document.getElementById('editEpisodeTitle');
const editHostInput = document.getElementById('editHostName');
const editDurationInput = document.getElementById('editDurationMinutes');
const editDateInput = document.getElementById('editReleaseDate');
const btnSaveEdit = document.getElementById('btnSaveEdit');
const btnEditSpinner = document.getElementById('btnEditSpinner');

// Audio Player Modal Elements
const playerModalEl = document.getElementById('audioPlayerModal');
const playerModal = new bootstrap.Modal(playerModalEl);
const playerEpisodeId = document.getElementById('playerEpisodeId');
const playerEpisodeTitle = document.getElementById('playerEpisodeTitle');
const playerEpisodeHost = document.getElementById('playerEpisodeHost');
const playerEpisodeDate = document.getElementById('playerEpisodeDate');
const playerCurrentTime = document.getElementById('playerCurrentTime');
const playerTotalTime = document.getElementById('playerTotalTime');
const playerProgressBar = document.getElementById('playerProgressBar');
const playerScrubber = document.getElementById('playerScrubber');
const btnPlayerPlayToggle = document.getElementById('btnPlayerPlayToggle');
const playerPlayIcon = document.getElementById('playerPlayIcon');
const audioWaveform = document.getElementById('audioWaveform');
const btnPlayerRewind = document.getElementById('btnPlayerRewind');
const btnPlayerForward = document.getElementById('btnPlayerForward');
const volumeSlider = document.getElementById('volumeSlider');
const playerSynopsis = document.getElementById('playerSynopsis');
const playerTags = document.getElementById('playerTags');

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  setupValidation();
  setupViewMode(currentView);
  setupEventListeners();
  checkBackendHealth();
  fetchEpisodes();
  setDefaultFormDate();
});

// Set default release date to today
function setDefaultFormDate() {
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

// Setup Event Listeners
function setupEventListeners() {
  form.addEventListener('submit', handleFormSubmit);
  editForm.addEventListener('submit', handleEditSubmit);

  // Search input with clear toggle
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (searchQuery) {
      btnClearSearch.classList.remove('d-none');
    } else {
      btnClearSearch.classList.add('d-none');
    }
    applyFiltersAndRender();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('d-none');
    searchInput.focus();
    applyFiltersAndRender();
  });

  // Character counters
  titleInput.addEventListener('input', () => {
    titleCounter.textContent = `${titleInput.value.length}/150`;
  });
  hostInput.addEventListener('input', () => {
    hostCounter.textContent = `${hostInput.value.length}/100`;
  });

  // Refresh records
  btnRefresh.addEventListener('click', () => {
    refreshIcon.classList.add('spin-animation');
    fetchEpisodes().finally(() => {
      setTimeout(() => refreshIcon.classList.remove('spin-animation'), 600);
    });
  });

  // Autofill and Quick Seeds
  btnFillSample.addEventListener('click', fillSingleSample);
  if (btnQuickSeed) btnQuickSeed.addEventListener('click', seedMultipleEpisodes);
  if (btnEmptySeed) btnEmptySeed.addEventListener('click', seedMultipleEpisodes);

  // Sorting links
  document.querySelectorAll('[data-sort]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-sort]').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      currentSort = item.dataset.sort;
      document.getElementById('currentSortLabel').textContent = item.textContent.trim();
      applyFiltersAndRender();
    });
  });

  // Duration Filter Chips
  document.querySelectorAll('[data-duration]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-duration]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDurationFilter = btn.dataset.duration;
      applyFiltersAndRender();
    });
  });

  // Reset Filters
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      btnClearSearch.classList.add('d-none');
      currentDurationFilter = 'all';
      currentHostFilter = '';
      document.querySelectorAll('[data-duration]').forEach(b => {
        b.classList.toggle('active', b.dataset.duration === 'all');
      });
      document.getElementById('currentHostFilterLabel').textContent = 'All Hosts';
      applyFiltersAndRender();
    });
  }

  // View Switchers
  btnViewTable.addEventListener('click', () => setupViewMode('table'));
  btnViewGrid.addEventListener('click', () => setupViewMode('grid'));

  // Table Column Sort Headers
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (col === 'id') currentSort = currentSort === 'id-asc' ? 'id-desc' : 'id-asc';
      else if (col === 'title') currentSort = currentSort === 'title-asc' ? 'title-desc' : 'title-asc';
      else if (col === 'host') currentSort = currentSort === 'host-asc' ? 'host-desc' : 'host-asc';
      else if (col === 'duration') currentSort = currentSort === 'duration-desc' ? 'duration-asc' : 'duration-desc';
      else if (col === 'date') currentSort = currentSort === 'date-desc' ? 'date-asc' : 'date-desc';
      applyFiltersAndRender();
    });
  });

  // Select All Checkbox
  selectAllCheckbox.addEventListener('change', (e) => {
    const visibleEpisodes = getFilteredEpisodes();
    if (e.target.checked) {
      visibleEpisodes.forEach(ep => selectedEpisodeIds.add(ep.id));
    } else {
      visibleEpisodes.forEach(ep => selectedEpisodeIds.delete(ep.id));
    }
    updateSelectionUI();
    renderActiveView(visibleEpisodes);
  });

  // Bulk Actions
  btnBulkDeselect.addEventListener('click', () => {
    selectedEpisodeIds.clear();
    updateSelectionUI();
    renderActiveView(getFilteredEpisodes());
  });

  btnBulkExport.addEventListener('click', () => {
    const selectedList = episodesList.filter(ep => selectedEpisodeIds.has(ep.id));
    exportToCSV(selectedList, 'selected_episodes_2400030188.csv');
  });

  btnBulkDelete.addEventListener('click', () => {
    bulkDeleteCount.textContent = selectedEpisodeIds.size;
    bulkDeleteModal.show();
  });

  btnConfirmBulkDelete.addEventListener('click', executeBulkDelete);
  btnConfirmDelete.addEventListener('click', executeDelete);

  // Export Tools
  document.getElementById('btnExportCSV').addEventListener('click', (e) => {
    e.preventDefault();
    exportToCSV(episodesList, 'podcast_episodes_2400030188.csv');
  });

  document.getElementById('btnExportJSON').addEventListener('click', (e) => {
    e.preventDefault();
    exportToJSON(episodesList, 'podcast_episodes_2400030188.json');
  });

  document.getElementById('btnCopyMarkdown').addEventListener('click', (e) => {
    e.preventDefault();
    copyMarkdownTable(episodesList);
  });

  // Import records produced by the CSV/JSON export tools (or matching files).
  btnImportData.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', handleImportFile);

  // Audio Player Controls
  btnPlayerPlayToggle.addEventListener('click', toggleAudioPlay);
  btnPlayerRewind.addEventListener('click', () => scrubAudioBy(-15));
  btnPlayerForward.addEventListener('click', () => scrubAudioBy(15));
  playerScrubber.addEventListener('click', handleScrubberClick);

  document.querySelectorAll('.player-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.player-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audioPlaybackRate = parseFloat(btn.dataset.speed);
      showToast(`Playback speed set to ${audioPlaybackRate}x`, 'info');
    });
  });

  playerModalEl.addEventListener('hidden.bs.modal', stopAudioSimulation);

  // Global Keyboard Shortcuts (Modern Web Best Practice)
  document.addEventListener('keydown', (e) => {
    // Cmd+K or Ctrl+K or '/' to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

// Switch between Table and Grid View
function setupViewMode(mode) {
  currentView = mode;
  localStorage.setItem('podcast_view_mode', mode);

  if (mode === 'table') {
    btnViewTable.classList.add('active');
    btnViewGrid.classList.remove('active');
    tableContainer.classList.remove('d-none');
    gridContainer.classList.add('d-none');
  } else {
    btnViewGrid.classList.add('active');
    btnViewTable.classList.remove('active');
    tableContainer.classList.add('d-none');
    gridContainer.classList.remove('d-none');
  }

  renderActiveView(getFilteredEpisodes());
}

// Backend Health Check
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/DisplayAll`, { method: 'GET' });
    if (response.ok) {
      backendStatusBadge.className = 'badge-status-pill';
      backendStatusBadge.innerHTML = '<span class="status-dot-green"></span> Connected';
    } else {
      markBackendOffline();
    }
  } catch (err) {
    markBackendOffline();
  }
}

function markBackendOffline() {
  backendStatusBadge.className = 'badge-mono-status';
  backendStatusBadge.style.color = '#f87171';
  backendStatusBadge.style.backgroundColor = '#18181b';
  backendStatusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  backendStatusBadge.innerHTML = '<i class="bi bi-exclamation-circle-fill me-1.5"></i> Offline';
}

// Fetch all episodes from Backend (GET /DisplayAll)
async function fetchEpisodes() {
  showLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/DisplayAll`);
    
    if (response.status === 404) {
      episodesList = [];
      applyFiltersAndRender();
      updateDashboardStats([]);
      showEmptyState(true);
      return;
    }

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    episodesList = Array.isArray(data) ? data : [];
    
    // Clean deleted IDs from selection
    const validIds = new Set(episodesList.map(ep => ep.id));
    selectedEpisodeIds = new Set([...selectedEpisodeIds].filter(id => validIds.has(id)));
    updateSelectionUI();

    updateHostFilterDropdown();
    applyFiltersAndRender();
    updateDashboardStats(episodesList);

    backendStatusBadge.className = 'badge-status-pill';
    backendStatusBadge.innerHTML = '<span class="status-dot-green"></span> Connected';
  } catch (error) {
    console.error('Error fetching episodes:', error);
    showEmptyState(true);
    showToast('Failed to reach the backend service. Check that the API is running.', 'danger');
    markBackendOffline();
  } finally {
    showLoading(false);
  }
}

// Update Host Filter Dropdown based on active dataset
function updateHostFilterDropdown() {
  const hostMenu = document.getElementById('hostFilterMenu');
  if (!hostMenu) return;

  const uniqueHosts = [...new Set(episodesList.map(ep => (ep.hostName || '').trim()).filter(Boolean))].sort();

  if (currentHostFilter && !uniqueHosts.some(host => host.toLowerCase() === currentHostFilter.toLowerCase())) {
    currentHostFilter = '';
    document.getElementById('currentHostFilterLabel').textContent = 'All Hosts';
  }

  let html = `<li><a class="dropdown-item dropdown-item-shadcn ${currentHostFilter === '' ? 'active' : ''}" href="#" data-host="">All Hosts</a></li>`;
  uniqueHosts.forEach(h => {
    const active = currentHostFilter === h ? 'active' : '';
    html += `<li><a class="dropdown-item dropdown-item-shadcn ${active}" href="#" data-host="${escapeAttribute(h)}">${escapeHtml(h)}</a></li>`;
  });

  hostMenu.innerHTML = html;

  hostMenu.querySelectorAll('[data-host]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      currentHostFilter = item.dataset.host;
      document.getElementById('currentHostFilterLabel').textContent = currentHostFilter ? currentHostFilter : 'All Hosts';
      updateHostFilterDropdown();
      applyFiltersAndRender();
    });
  });
}

// Filter and Sort Data
function getFilteredEpisodes() {
  let list = [...episodesList];

  // 1. Text Search Filter
  if (searchQuery) {
    list = list.filter(ep => 
      (ep.episodeTitle && ep.episodeTitle.toLowerCase().includes(searchQuery)) ||
      (ep.hostName && ep.hostName.toLowerCase().includes(searchQuery)) ||
      (ep.id && String(ep.id).includes(searchQuery)) ||
      (ep.releaseDate && ep.releaseDate.includes(searchQuery))
    );
  }

  // 2. Duration Range Filter
  if (currentDurationFilter === 'short') {
    list = list.filter(ep => Number(ep.durationMinutes) < 30);
  } else if (currentDurationFilter === 'medium') {
    list = list.filter(ep => Number(ep.durationMinutes) >= 30 && Number(ep.durationMinutes) <= 60);
  } else if (currentDurationFilter === 'long') {
    list = list.filter(ep => Number(ep.durationMinutes) > 60);
  }

  // 3. Host Filter
  if (currentHostFilter) {
    list = list.filter(ep => (ep.hostName || '').trim().toLowerCase() === currentHostFilter.toLowerCase());
  }

  // 4. Sorting
  list.sort((a, b) => {
    switch (currentSort) {
      case 'date-desc':
        return new Date(b.releaseDate || '1970-01-01') - new Date(a.releaseDate || '1970-01-01');
      case 'date-asc':
        return new Date(a.releaseDate || '1970-01-01') - new Date(b.releaseDate || '1970-01-01');
      case 'duration-desc':
        return (Number(b.durationMinutes) || 0) - (Number(a.durationMinutes) || 0);
      case 'duration-asc':
        return (Number(a.durationMinutes) || 0) - (Number(b.durationMinutes) || 0);
      case 'title-asc':
        return (a.episodeTitle || '').localeCompare(b.episodeTitle || '');
      case 'title-desc':
        return (b.episodeTitle || '').localeCompare(a.episodeTitle || '');
      case 'host-asc':
        return (a.hostName || '').localeCompare(b.hostName || '');
      case 'host-desc':
        return (b.hostName || '').localeCompare(a.hostName || '');
      case 'id-asc':
        return Number(a.id) - Number(b.id);
      case 'id-desc':
        return Number(b.id) - Number(a.id);
      default:
        return Number(b.id) - Number(a.id);
    }
  });

  return list;
}

function applyFiltersAndRender() {
  const filtered = getFilteredEpisodes();
  
  // Notice for active filters
  const hasActiveFilter = searchQuery !== '' || currentDurationFilter !== 'all' || currentHostFilter !== '';
  if (filterActiveNotice) {
    filterActiveNotice.classList.toggle('d-none', !hasActiveFilter);
    filterActiveNotice.classList.toggle('d-flex', hasActiveFilter);
  }

  if (tableRecordCountBadge) {
    tableRecordCountBadge.textContent = `${filtered.length} of ${episodesList.length} records`;
  }

  if (episodesList.length === 0) {
    showEmptyState(true);
  } else {
    showEmptyState(false);
    renderActiveView(filtered);
  }

  // Sync Select All Checkbox state
  const allVisibleSelected = filtered.length > 0 && filtered.every(ep => selectedEpisodeIds.has(ep.id));
  selectAllCheckbox.checked = allVisibleSelected;
  selectAllCheckbox.indeterminate = !allVisibleSelected && filtered.some(ep => selectedEpisodeIds.has(ep.id));
}

function renderActiveView(episodes) {
  if (currentView === 'table') {
    renderEpisodesTable(episodes);
  } else {
    renderEpisodesGrid(episodes);
  }
}

// Render Table View
function renderEpisodesTable(episodes) {
  episodesTableBody.innerHTML = '';

  if (!episodes || episodes.length === 0) {
    episodesTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5" style="color: var(--zinc-500);">
          <i class="bi bi-search me-1"></i> No matching episodes found.
        </td>
      </tr>
    `;
    return;
  }

  episodes.forEach(ep => {
    const isSelected = selectedEpisodeIds.has(ep.id);
    const row = document.createElement('tr');
    if (isSelected) row.classList.add('row-selected');

    const durationText = formatDuration(ep.durationMinutes);
    const hostInitials = getInitials(ep.hostName);

    row.innerHTML = `
      <td style="text-align: center;">
        <input 
          type="checkbox" 
          class="form-check-input-shadcn episode-checkbox" 
          data-id="${ep.id}" 
          ${isSelected ? 'checked' : ''} 
          aria-label="Select episode ${escapeAttribute(ep.episodeTitle)}"
        >
      </td>
      <td>
        <span class="badge-mono-id" onclick="copyIdToClipboard(${ep.id})" title="Click to copy ID">#${ep.id}</span>
      </td>
      <td>
        <div class="fw-semibold text-white" style="letter-spacing: -0.01em;">${escapeHtml(ep.episodeTitle)}</div>
        <div class="topic-tag">${deriveTopic(ep.episodeTitle)}</div>
      </td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <span class="host-avatar">${hostInitials}</span>
          <span class="text-white">${escapeHtml(ep.hostName)}</span>
        </div>
      </td>
      <td>
        <span class="badge-mono-duration">
          <i class="bi bi-clock text-muted"></i> ${durationText}
        </span>
      </td>
      <td>
        <span style="color: var(--zinc-400); font-family: 'Geist Mono', monospace; font-size: 0.8rem;">
          ${escapeHtml(ep.releaseDate || 'N/A')}
        </span>
      </td>
      <td class="text-end">
        <div class="d-flex justify-content-end align-items-center gap-1.5">
          <button 
            type="button" 
            class="btn-action-icon" 
            onclick="openAudioPlayer(${ep.id})" 
            title="Preview Audio"
            aria-label="Play ${escapeAttribute(ep.episodeTitle)}"
          >
            <i class="bi bi-play-fill text-white"></i>
          </button>
          <button 
            type="button" 
            class="btn-action-icon" 
            onclick="openEditModal(${ep.id})" 
            title="Edit Episode"
            aria-label="Edit ${escapeAttribute(ep.episodeTitle)}"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button 
            type="button" 
            class="btn-action-icon danger" 
            onclick="openDeleteModal(${ep.id}, '${escapeAttribute(ep.episodeTitle)}', '${escapeAttribute(ep.hostName)}')" 
            title="Delete Record"
            aria-label="Delete ${escapeAttribute(ep.episodeTitle)}"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    // Row selection handler
    const checkbox = row.querySelector('.episode-checkbox');
    checkbox.addEventListener('change', (e) => {
      toggleEpisodeSelection(ep.id, e.target.checked);
    });

    episodesTableBody.appendChild(row);
  });
}

// Render Card Grid View
function renderEpisodesGrid(episodes) {
  gridContainer.innerHTML = '';

  if (!episodes || episodes.length === 0) {
    gridContainer.innerHTML = `
      <div class="col-12 text-center py-5" style="color: var(--zinc-500); grid-column: 1 / -1;">
        <i class="bi bi-search me-1"></i> No matching episodes found.
      </div>
    `;
    return;
  }

  episodes.forEach(ep => {
    const isSelected = selectedEpisodeIds.has(ep.id);
    const card = document.createElement('div');
    card.className = `podcast-card ${isSelected ? 'card-selected' : ''}`;

    const durationText = formatDuration(ep.durationMinutes);
    const hostInitials = getInitials(ep.hostName);

    card.innerHTML = `
      <div>
        <div class="podcast-card-cover">
          <div>
            <span class="badge-mono-id" onclick="copyIdToClipboard(${ep.id})">#${ep.id}</span>
            <div class="topic-tag mt-2">${deriveTopic(ep.episodeTitle)}</div>
          </div>
          <button 
            type="button" 
            class="play-circle-btn" 
            onclick="openAudioPlayer(${ep.id})"
            title="Listen Preview"
          >
            <i class="bi bi-play-fill fs-5"></i>
          </button>
        </div>

        <h3 class="h6 fw-semibold text-white mb-2" style="line-height: 1.4;">${escapeHtml(ep.episodeTitle)}</h3>

        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="host-avatar">${hostInitials}</span>
          <span style="font-size: 0.825rem; color: var(--zinc-300);">${escapeHtml(ep.hostName)}</span>
        </div>
      </div>

      <div class="pt-2 border-top d-flex justify-content-between align-items-center" style="border-color: var(--border-subtle) !important;">
        <div class="d-flex align-items-center gap-2">
          <input 
            type="checkbox" 
            class="form-check-input-shadcn episode-checkbox" 
            data-id="${ep.id}" 
            ${isSelected ? 'checked' : ''}
          >
          <span class="badge-mono-duration">${durationText}</span>
        </div>

        <div class="d-flex gap-1">
          <button type="button" class="btn-action-icon" onclick="openEditModal(${ep.id})" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn-action-icon danger" onclick="openDeleteModal(${ep.id}, '${escapeAttribute(ep.episodeTitle)}', '${escapeAttribute(ep.hostName)}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    const checkbox = card.querySelector('.episode-checkbox');
    checkbox.addEventListener('change', (e) => {
      toggleEpisodeSelection(ep.id, e.target.checked);
    });

    gridContainer.appendChild(card);
  });
}

// Multi-select toggle
function toggleEpisodeSelection(id, isSelected) {
  if (isSelected) {
    selectedEpisodeIds.add(id);
  } else {
    selectedEpisodeIds.delete(id);
  }
  updateSelectionUI();
  applyFiltersAndRender();
}

function updateSelectionUI() {
  const count = selectedEpisodeIds.size;
  if (count > 0) {
    bulkCountBadge.textContent = `${count} selected`;
    bulkActionsBar.classList.add('show');
  } else {
    bulkActionsBar.classList.remove('show');
  }
}

// Update Dashboard Statistics
function updateDashboardStats(episodes) {
  statTotalEpisodes.textContent = episodes.length;

  const totalMinutes = episodes.reduce((acc, ep) => acc + (Number(ep.durationMinutes) || 0), 0);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    statTotalDuration.textContent = `${hours}h ${mins}m`;
  } else {
    statTotalDuration.textContent = `${totalMinutes}m`;
  }

  const uniqueHosts = new Set(episodes.map(ep => (ep.hostName || '').trim().toLowerCase()).filter(Boolean));
  statTotalHosts.textContent = uniqueHosts.size;

  if (episodes.length > 0) {
    const avg = Math.round(totalMinutes / episodes.length);
    statAvgDuration.textContent = `${avg}m`;
  } else {
    statAvgDuration.textContent = '0m';
  }
}

// Form Submission (POST /Add)
async function handleFormSubmit(event) {
  event.preventDefault();
  hideFormAlert();

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    showFormAlert('Please fix the indicated validation errors before submitting.', 'warning');
    return;
  }

  const payload = {
    episodeTitle: titleInput.value.trim(),
    hostName: hostInput.value.trim(),
    durationMinutes: parseInt(durationInput.value, 10),
    releaseDate: dateInput.value
  };

  setSubmitting(true);

  try {
    const response = await fetch(`${API_BASE_URL}/Add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 201) {
      let createdId = 'New';
      try {
        const data = await response.json();
        createdId = data.episode?.id || (typeof data === 'string' && data.match(/\d+/)?.[0]) || 'New';
      } catch (e) {
        // Fallback text parsing
      }

      showToast(`Episode Registered Successfully! Assigned ID: #${createdId}`, 'success');
      form.reset();
      form.classList.remove('was-validated');
      setDefaultFormDate();
      titleCounter.textContent = '0/150';
      hostCounter.textContent = '0/100';

      await fetchEpisodes();
      document.getElementById('episodesSection').scrollIntoView({ behavior: 'smooth' });
    } else if (response.status === 400) {
      const err = await response.json().catch(() => ({ message: 'Validation failure' }));
      showFormAlert(`Validation error: ${err.message || 'Check input constraints'}`, 'danger');
      showToast('Validation failed on server.', 'danger');
    } else {
      const errText = await response.text();
      showFormAlert(`Error: ${errText || response.statusText}`, 'danger');
      showToast('Server error while registering episode.', 'danger');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    showFormAlert('Network error: Could not reach the backend service.', 'danger');
    showToast('Network error while reaching backend.', 'danger');
  } finally {
    setSubmitting(false);
  }
}

// Open Edit Modal
window.openEditModal = function(id) {
  const ep = episodesList.find(e => e.id === id);
  if (!ep) return;

  pendingEditId = id;
  editIdInput.value = `#${ep.id}`;
  editTitleInput.value = ep.episodeTitle;
  editHostInput.value = ep.hostName;
  editDurationInput.value = ep.durationMinutes;
  editDateInput.value = ep.releaseDate || '';

  editForm.classList.remove('was-validated');
  editModal.show();
};

// Handle Edit Submission (PUT /Update/{id})
async function handleEditSubmit(event) {
  event.preventDefault();
  if (!pendingEditId) return;

  if (!editForm.checkValidity()) {
    editForm.classList.add('was-validated');
    return;
  }

  const payload = {
    episodeTitle: editTitleInput.value.trim(),
    hostName: editHostInput.value.trim(),
    durationMinutes: parseInt(editDurationInput.value, 10),
    releaseDate: editDateInput.value
  };

  btnEditSpinner.classList.remove('d-none');
  btnSaveEdit.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/Update/${pendingEditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showToast(`Episode #${pendingEditId} updated successfully!`, 'success');
      editModal.hide();
      await fetchEpisodes();
    } else {
      // Fallback if running against server instance without Update endpoint
      const errText = await response.text();
      showToast(`Update notice: ${errText || 'Saved changes'}`, 'warning');
      editModal.hide();
      await fetchEpisodes();
    }
  } catch (error) {
    console.error('Error updating episode:', error);
    showToast('Failed to update episode on backend.', 'danger');
  } finally {
    btnEditSpinner.classList.add('d-none');
    btnSaveEdit.disabled = false;
    pendingEditId = null;
  }
}

// Delete Episode Flow (DELETE /Delete/{id})
window.openDeleteModal = function(id, title, host) {
  pendingDeleteId = id;
  deleteTargetTitle.textContent = title;
  deleteTargetMeta.textContent = `ID: #${id} | Host: ${host}`;
  deleteModal.show();
};

async function executeDelete() {
  if (!pendingDeleteId) return;

  btnDeleteSpinner.classList.remove('d-none');
  btnConfirmDelete.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/Delete/${pendingDeleteId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast(`Episode #${pendingDeleteId} deleted successfully.`, 'success');
      selectedEpisodeIds.delete(pendingDeleteId);
      updateSelectionUI();
      deleteModal.hide();
      await fetchEpisodes();
    } else if (response.status === 404) {
      showToast(`Episode #${pendingDeleteId} not found or already deleted.`, 'warning');
      deleteModal.hide();
      await fetchEpisodes();
    } else {
      const err = await response.text();
      showToast(`Error deleting episode: ${err}`, 'danger');
    }
  } catch (error) {
    console.error('Error deleting episode:', error);
    showToast('Failed to communicate with backend to delete episode.', 'danger');
  } finally {
    btnDeleteSpinner.classList.add('d-none');
    btnConfirmDelete.disabled = false;
    pendingDeleteId = null;
  }
}

// Batch Delete Execution
async function executeBulkDelete() {
  if (selectedEpisodeIds.size === 0) return;

  btnBulkDeleteSpinner.classList.remove('d-none');
  btnConfirmBulkDelete.disabled = true;

  const idsToDelete = [...selectedEpisodeIds];
  let successCount = 0;

  for (const id of idsToDelete) {
    try {
      const res = await fetch(`${API_BASE_URL}/Delete/${id}`, { method: 'DELETE' });
      if (res.ok) successCount++;
    } catch (e) {
      console.warn(`Could not delete episode #${id}`, e);
    }
  }

  showToast(`Successfully deleted ${successCount} episode records.`, 'success');
  selectedEpisodeIds.clear();
  updateSelectionUI();
  bulkDeleteModal.hide();

  btnBulkDeleteSpinner.classList.add('d-none');
  btnConfirmBulkDelete.disabled = false;

  await fetchEpisodes();
}

// Interactive Audio Player Simulation
window.openAudioPlayer = function(id) {
  const ep = episodesList.find(e => e.id === id);
  if (!ep) return;

  playerEpisodeId.textContent = `#${ep.id}`;
  playerEpisodeTitle.textContent = ep.episodeTitle;
  playerEpisodeHost.textContent = ep.hostName;
  playerEpisodeDate.textContent = ep.releaseDate || 'N/A';

  audioTotalSeconds = (parseInt(ep.durationMinutes, 10) || 45) * 60;
  audioCurrentSeconds = Math.floor(audioTotalSeconds * 0.28);

  playerTotalTime.textContent = formatTimeSeconds(audioTotalSeconds);
  playerCurrentTime.textContent = formatTimeSeconds(audioCurrentSeconds);
  playerProgressBar.style.width = `${(audioCurrentSeconds / audioTotalSeconds) * 100}%`;

  // Dynamic realistic synopsis
  playerSynopsis.textContent = `In this featured broadcast, host ${ep.hostName} explores critical engineering principles behind "${ep.episodeTitle}". Discussion covers enterprise best practices, microservice decoupling, continuous automation, and high-availability PostgreSQL deployments.`;
  
  const tags = deriveTags(ep.episodeTitle);
  playerTags.innerHTML = tags.map(t => `<span class="topic-tag">#${escapeHtml(t)}</span>`).join(' ');

  isAudioPlaying = false;
  updatePlayButtonIcon();

  playerModal.show();
};

function toggleAudioPlay() {
  isAudioPlaying = !isAudioPlaying;
  updatePlayButtonIcon();

  if (isAudioPlaying) {
    startAudioSimulation();
  } else {
    stopAudioSimulation();
  }
}

function updatePlayButtonIcon() {
  const bars = audioWaveform.querySelectorAll('.audio-bar');
  if (isAudioPlaying) {
    playerPlayIcon.className = 'bi bi-pause-fill fs-5';
    bars.forEach(b => b.classList.add('playing'));
  } else {
    playerPlayIcon.className = 'bi bi-play-fill fs-5';
    bars.forEach(b => b.classList.remove('playing'));
  }
}

function startAudioSimulation() {
  clearInterval(audioTimer);
  audioTimer = setInterval(() => {
    if (!isAudioPlaying) return;
    audioCurrentSeconds += 1 * audioPlaybackRate;
    if (audioCurrentSeconds >= audioTotalSeconds) {
      audioCurrentSeconds = audioTotalSeconds;
      toggleAudioPlay();
    }
    playerCurrentTime.textContent = formatTimeSeconds(Math.floor(audioCurrentSeconds));
    const pct = (audioCurrentSeconds / audioTotalSeconds) * 100;
    playerProgressBar.style.width = `${Math.min(pct, 100)}%`;
  }, 1000);
}

function stopAudioSimulation() {
  clearInterval(audioTimer);
  isAudioPlaying = false;
  updatePlayButtonIcon();
}

function scrubAudioBy(deltaSeconds) {
  audioCurrentSeconds = Math.max(0, Math.min(audioTotalSeconds, audioCurrentSeconds + deltaSeconds));
  playerCurrentTime.textContent = formatTimeSeconds(Math.floor(audioCurrentSeconds));
  playerProgressBar.style.width = `${(audioCurrentSeconds / audioTotalSeconds) * 100}%`;
}

function handleScrubberClick(e) {
  const rect = playerScrubber.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  audioCurrentSeconds = Math.floor(pct * audioTotalSeconds);
  playerCurrentTime.textContent = formatTimeSeconds(audioCurrentSeconds);
  playerProgressBar.style.width = `${pct * 100}%`;
}

// Seed Multiple Episodes for Exam Demo
async function seedMultipleEpisodes() {
  showToast('Seeding 4 demonstration episodes into PostgreSQL database...', 'info');

  let createdCount = 0;
  for (const sample of SEED_DATASET) {
    try {
      const response = await fetch(`${API_BASE_URL}/Add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeTitle: sample.title,
          hostName: sample.host,
          durationMinutes: sample.duration,
          releaseDate: sample.date
        })
      });
      if (response.ok) createdCount++;
    } catch (e) {
      console.warn('Seed error:', e);
    }
  }

  showToast(
    createdCount === SEED_DATASET.length
      ? 'Demonstration episodes seeded successfully!'
      : `Seeded ${createdCount} of ${SEED_DATASET.length} demonstration episodes.`,
    createdCount === SEED_DATASET.length ? 'success' : 'warning'
  );
  await fetchEpisodes();
}

// Single Form Autofill
function fillSingleSample() {
  const sample = SEED_DATASET[sampleIndex % SEED_DATASET.length];
  sampleIndex++;

  titleInput.value = sample.title;
  hostInput.value = sample.host;
  durationInput.value = sample.duration;
  dateInput.value = sample.date;

  titleCounter.textContent = `${titleInput.value.length}/150`;
  hostCounter.textContent = `${hostInput.value.length}/100`;

  hideFormAlert();
  form.classList.remove('was-validated');
  showToast(`Sample episode "${sample.title}" filled into form.`, 'info');
}

// Export utilities
function exportToCSV(episodes, filename = 'episodes.csv') {
  if (!episodes || episodes.length === 0) {
    showToast('No records available to export.', 'warning');
    return;
  }

  const headers = ['ID', 'Episode Title', 'Host Name', 'Duration (Minutes)', 'Release Date'];
  const rows = episodes.map(ep => [
    ep.id,
    `"${(ep.episodeTitle || '').replace(/"/g, '""')}"`,
    `"${(ep.hostName || '').replace(/"/g, '""')}"`,
    ep.durationMinutes,
    ep.releaseDate || ''
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
  showToast(`Exported ${episodes.length} episodes to ${filename}`, 'success');
}

function exportToJSON(episodes, filename = 'episodes.json') {
  if (!episodes || episodes.length === 0) {
    showToast('No records available to export.', 'warning');
    return;
  }

  const jsonContent = JSON.stringify(episodes, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, filename);
  showToast(`Exported ${episodes.length} records to JSON`, 'success');
}

// Import utilities ---------------------------------------------------------
// The import accepts the app's exports and conventional column names. IDs are
// deliberately ignored: the backend remains the sole authority for IDs.
async function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    if (file.size > 1024 * 1024) {
      throw new Error('Choose a file smaller than 1 MB.');
    }

    btnImportData.disabled = true;
    btnImportData.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Importing';

    const records = await parseImportFile(file);
    const { valid, skipped } = normaliseImportedEpisodes(records);

    if (valid.length === 0) {
      throw new Error('No valid, new episode records were found in this file.');
    }
    if (valid.length > 100) {
      throw new Error('Import is limited to 100 records at a time.');
    }

    let imported = 0;
    let failed = 0;
    for (const episode of valid) {
      try {
        const response = await fetch(`${API_BASE_URL}/Add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(episode)
        });
        if (response.status === 201) imported++;
        else failed++;
      } catch (error) {
        failed++;
      }
    }

    await fetchEpisodes();
    const details = [
      `${imported} ${imported === 1 ? 'episode' : 'episodes'} imported`,
      skipped ? `${skipped} skipped` : '',
      failed ? `${failed} failed` : ''
    ].filter(Boolean).join(' · ');
    showToast(details, failed ? 'warning' : 'success');
  } catch (error) {
    showToast(error.message || 'Unable to import this file.', 'danger');
  } finally {
    btnImportData.disabled = false;
    btnImportData.innerHTML = '<i class="bi bi-upload me-1"></i> Import';
    event.target.value = '';
  }
}

async function parseImportFile(file) {
  const text = (await file.text()).replace(/^\uFEFF/, '');
  const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';

  if (isJson) {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('JSON imports must contain an array of episodes.');
    return data;
  }

  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('The CSV file needs a header row and at least one episode.');

  const header = rows[0].map(value => value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const indexFor = (...names) => header.findIndex(column => names.includes(column));
  const titleIndex = indexFor('episodetitle', 'title');
  const hostIndex = indexFor('hostname', 'host');
  const durationIndex = indexFor('durationminutes', 'duration');
  const dateIndex = indexFor('releasedate', 'date');
  if ([titleIndex, hostIndex, durationIndex, dateIndex].some(index => index < 0)) {
    throw new Error('CSV must include Episode Title, Host Name, Duration (Minutes), and Release Date columns.');
  }

  return rows.slice(1)
    .filter(row => row.some(value => value.trim() !== ''))
    .map(row => ({
      episodeTitle: row[titleIndex],
      hostName: row[hostIndex],
      durationMinutes: row[durationIndex],
      releaseDate: row[dateIndex]
    }));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  if (quoted) throw new Error('The CSV file has an unclosed quoted value.');
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

function normaliseImportedEpisodes(records) {
  const existing = new Set(episodesList.map(episodeKey));
  const batch = new Set();
  const valid = [];
  let skipped = 0;

  records.forEach(record => {
    const title = String(record?.episodeTitle ?? '').trim();
    const host = String(record?.hostName ?? '').trim();
    const duration = Number(record?.durationMinutes);
    const releaseDate = String(record?.releaseDate ?? '').trim();
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(releaseDate)
      && new Date(`${releaseDate}T00:00:00Z`).toISOString().slice(0, 10) === releaseDate;
    const episode = { episodeTitle: title, hostName: host, durationMinutes: duration, releaseDate };
    const key = episodeKey(episode);

    if (title.length < 2 || title.length > 150 || host.length < 2 || host.length > 100
      || !Number.isInteger(duration) || duration < 1 || duration > 600 || !isDate
      || existing.has(key) || batch.has(key)) {
      skipped++;
      return;
    }
    batch.add(key);
    valid.push(episode);
  });

  return { valid, skipped };
}

function episodeKey(episode) {
  return `${episode.episodeTitle || ''}\u0000${episode.hostName || ''}\u0000${episode.releaseDate || ''}`.toLocaleLowerCase();
}

function copyMarkdownTable(episodes) {
  if (!episodes || episodes.length === 0) {
    showToast('No records available to copy.', 'warning');
    return;
  }

  let md = '| ID | Episode Title | Host Name | Duration | Release Date |\n';
  md += '|---|---|---|---|---|\n';
  episodes.forEach(ep => {
    md += `| #${ep.id} | ${ep.episodeTitle} | ${ep.hostName} | ${ep.durationMinutes}m | ${ep.releaseDate || 'N/A'} |\n`;
  });

  navigator.clipboard.writeText(md).then(() => {
    showToast('Markdown table copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Clipboard access denied.', 'warning');
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.copyIdToClipboard = function(id) {
  navigator.clipboard.writeText(String(id)).then(() => {
    showToast(`Copied ID #${id} to clipboard`, 'info');
  });
};

// Helpers
function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h} hrs`;
  }
  return `${m} mins`;
}

function formatTimeSeconds(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getInitials(name) {
  if (!name) return 'EP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveTopic(title) {
  if (!title) return 'Podcast';
  const t = title.toLowerCase();
  if (t.includes('docker') || t.includes('container')) return 'DevOps & Docker';
  if (t.includes('spring') || t.includes('java')) return 'Java & Spring';
  if (t.includes('cloud') || t.includes('microservice')) return 'Architecture';
  if (t.includes('pipeline') || t.includes('github') || t.includes('ci')) return 'CI/CD Automation';
  if (t.includes('postgres') || t.includes('sql') || t.includes('database')) return 'Databases';
  return 'Engineering';
}

function deriveTags(title) {
  const base = ['Engineering', 'Software'];
  if (!title) return base;
  const t = title.toLowerCase();
  if (t.includes('docker')) base.push('Docker', 'Containers');
  if (t.includes('spring')) base.push('SpringBoot', 'Java21');
  if (t.includes('microservice')) base.push('Microservices', 'SOA');
  if (t.includes('cloud')) base.push('CloudNative');
  if (t.includes('postgres')) base.push('PostgreSQL');
  return [...new Set(base)];
}

// Modern Web Guidance: Validation & ARIA Sync
function setupValidation() {
  const syncAria = (el) => {
    if (el && el.matches) {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    }
  };

  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target);
    }
  });
}

// UI State Helpers
function showLoading(show) {
  if (show) {
    loadingState.classList.remove('d-none');
    emptyState.classList.add('d-none');
  } else {
    loadingState.classList.add('d-none');
  }
}

function showEmptyState(show) {
  if (show) {
    emptyState.classList.remove('d-none');
    tableContainer.classList.add('d-none');
    gridContainer.classList.add('d-none');
  } else {
    emptyState.classList.add('d-none');
    if (currentView === 'table') {
      tableContainer.classList.remove('d-none');
      gridContainer.classList.add('d-none');
    } else {
      tableContainer.classList.add('d-none');
      gridContainer.classList.remove('d-none');
    }
  }
}

function setSubmitting(isSubmitting) {
  if (isSubmitting) {
    btnSubmitSpinner.classList.remove('d-none');
    if (btnSubmitText) btnSubmitText.textContent = 'Saving...';
    btnSubmit.disabled = true;
  } else {
    btnSubmitSpinner.classList.add('d-none');
    if (btnSubmitText) btnSubmitText.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Save Episode';
    btnSubmit.disabled = false;
  }
}

function showFormAlert(message, type = 'danger') {
  formAlertBox.className = `alert alert-${type} alert-dismissible fade show`;
  formAlertBox.innerHTML = `
    <i class="bi ${type === 'danger' ? 'bi-exclamation-octagon' : 'bi-info-circle'} me-2"></i>
    <span>${escapeHtml(message)}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  formAlertBox.classList.remove('d-none');
}

function hideFormAlert() {
  formAlertBox.classList.add('d-none');
  formAlertBox.innerHTML = '';
}

function showToast(message, type = 'info') {
  const toastId = 'toast_' + Date.now();
  const iconColor = type === 'success' ? '#34d399' :
                    type === 'danger' ? '#fb7185' :
                    type === 'warning' ? '#fbbf24' : '#818cf8';

  const iconClass = type === 'success' ? 'bi-check-circle-fill' :
                    type === 'danger' ? 'bi-x-circle-fill' :
                    type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

  const toastEl = document.createElement('div');
  toastEl.className = 'toast toast-shadcn align-items-center border-0 shadow-lg mb-2';
  toastEl.id = toastId;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex p-1">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${iconClass} fs-5" style="color: ${iconColor};"></i>
        <div class="text-white">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4200 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
