// ── Auth Guard ─────────────────────────────────────────────────────────────
const savedUser = localStorage.getItem('user');
if (!savedUser) {
    window.location.href = 'index.html?redirect=library';
}
const user = JSON.parse(savedUser || '{}');

// API Helper for Authenticated Requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html?openAuth=login';
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}

// ── Navbar ──────────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

document.getElementById('navWelcome').textContent = `Hi, ${user.name}! 👋`;

// Show Admin link if user is admin
const adminLink = document.getElementById('adminLink');
if (adminLink && user.role === 'admin') {
    adminLink.style.display = 'inline';
}

function goToDashboard(e) {
    e.preventDefault();
    window.location.href = 'index.html#dashboard';
}

function handleHomeClick(e) {
    e.preventDefault();
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html#dashboard';
    } else {
        window.location.href = 'index.html?openAuth=login';
    }
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ── Auth Modal (for toggleFavourite edge case) ───────────────────────────────
const authOverlay = document.getElementById('authOverlay');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function openAuth(mode) { authOverlay.classList.add('active'); toggleAuth(mode); }
function closeAuth() { authOverlay.classList.remove('active'); }
function toggleAuth(mode) {
    const isLogin = mode === 'login';
    if (loginTab) loginTab.classList.toggle('active', isLogin);
    if (registerTab) registerTab.classList.toggle('active', !isLogin);
    if (loginForm) loginForm.style.display = isLogin ? 'flex' : 'none';
    if (registerForm) registerForm.style.display = isLogin ? 'none' : 'flex';
}
if (authOverlay) {
    authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuth(); });
}

// ── Story Data ───────────────────────────────────────────────────────────────
let allStories = [];
let activeCategory = 'All';
let searchQuery = '';

async function loadStories() {
    const grid = document.getElementById('storiesGrid');
    try {
        const res = await fetch('/api/story/getAllStories');
        if (res.ok) {
            allStories = await res.json();
            renderCategories();
            applyFilters();
        } else {
            grid.innerHTML = '<div class="loading-state"><p>No stories found yet. Magical things are coming! ✨</p></div>';
        }
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div class="loading-state"><p>The library is undergoing some magic. Please check back later!</p></div>';
    }
}

// ── Categories ───────────────────────────────────────────────────────────────
function renderCategories() {
    const cats = ['All', ...new Set(allStories.map(s => s.category).filter(Boolean))];
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    container.innerHTML = cats.map(cat => `
        <button class="category-btn ${cat === 'All' ? 'active' : ''}"
                onclick="filterByCategory('${cat}')">${cat === 'All' ? 'All Stories' : cat}</button>
    `).join('');
}

function filterByCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        const label = cat === 'All' ? 'All Stories' : cat;
        btn.classList.toggle('active', btn.textContent.trim() === label);
    });
    applyFilters();
}

// ── Search ───────────────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
    });
}

// ── Filter + Render ──────────────────────────────────────────────────────────
function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = allStories.filter(s => {
        const matchCat = activeCategory === 'All' || s.category === activeCategory;
        const matchSearch = !q
            || (s.title && s.title.toLowerCase().includes(q))
            || (s.author && s.author.toLowerCase().includes(q));
        return matchCat && matchSearch;
    });
    renderStories(filtered);
}

function renderStories(stories) {
    const grid = document.getElementById('storiesGrid');
    const count = document.getElementById('storiesCount');

    if (count) {
        count.textContent = stories.length
            ? `Showing ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`
            : '';
    }

    if (!stories.length) {
        if (grid) grid.innerHTML = '<div class="loading-state"><p>No stories match your search. Try something else! 🔍</p></div>';
        return;
    }

    if (grid) {
        grid.innerHTML = stories.map(story => `
            <div class="story-card animate-up">
                
                <div class="story-content">
                    <h3>${story.title}</h3>
                    <p class="author">By ${story.author}</p>
                    <p class="story-type"><i data-lucide="tag" style="width:13px;height:13px;vertical-align:middle;margin-right:4px;"></i>${story.category || 'General'}</p>
                    <p class="excerpt">${story.content ? story.content.substring(0, 100) + '...' : 'Once upon a time...'}</p>
                    <div class="story-actions">
                        <button class="btn-read" onclick="readStory('${story._id}')">Read Now</button>
                        <button class="btn-fav" 
                            onclick="toggleFavourite('${story._id}')" 
                            ondblclick="removeFavourite('${story._id}')"
                            title="Click to add, Double-click to remove">
                            <i data-lucide="heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
}

// ── Read Story ───────────────────────────────────────────────────────────────
const storyOverlay = document.getElementById('storyOverlay');
const storyTitle   = document.getElementById('storyTitle');
const storyMeta    = document.getElementById('storyMeta');
const storyBody    = document.getElementById('storyBody');

function readStory(id) {
    const story = allStories.find(s => s._id === id || s.id === id);
    if (!story) {
        console.warn('Story not found in local cache, fetching...');
        fetch(`/api/story/getStoryById/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.title) {
                    displayStory(data);
                }
            })
            .catch(err => console.error('Fetch error:', err));
        return;
    }

    displayStory(story);
}

function displayStory(story) {
    const overlay = document.getElementById('storyOverlay');
    const title = document.getElementById('storyTitle');
    const meta = document.getElementById('storyMeta');
    const body = document.getElementById('storyBody');

    if (!overlay || !title || !body) {
        console.error('Story reader elements not found');
        return;
    }

    title.textContent = story.title || 'Untitled Tale';
    if (meta) meta.textContent = `By ${story.author || 'Unknown'} | ${story.category || 'Story'}`;
    body.textContent = story.content || 'No content available for this magical tale.';

    // Reset TTS button
    const ttsBtn = document.getElementById('ttsBtn');
    if (ttsBtn) {
        const span = ttsBtn.querySelector('span');
        const icon = ttsBtn.querySelector('i');
        if (span) span.textContent = 'Read Aloud';
        if (icon) icon.setAttribute('data-lucide', 'volume-2');
        if (window.lucide) window.lucide.createIcons();
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

let speechInstance = null;

function toggleTTS() {
    const ttsBtn = document.getElementById('ttsBtn');
    const content = document.getElementById('storyBody').textContent;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        ttsBtn.querySelector('span').textContent = 'Read Aloud';
        ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-2');
    } else {
        speechInstance = new SpeechSynthesisUtterance(content);
        speechInstance.rate = 0.9;
        speechInstance.pitch = 1.1;
        
        speechInstance.onend = () => {
            ttsBtn.querySelector('span').textContent = 'Read Aloud';
            ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-2');
            if (window.lucide) window.lucide.createIcons();
        };

        window.speechSynthesis.speak(speechInstance);
        ttsBtn.querySelector('span').textContent = 'Stop Reading';
        ttsBtn.querySelector('i').setAttribute('data-lucide', 'volume-x');
    }
    if (window.lucide) window.lucide.createIcons();
}

function closeStory() {
    window.speechSynthesis.cancel();
    storyOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close story modal on click outside
if (storyOverlay) {
    storyOverlay.addEventListener('click', (e) => {
        if (e.target === storyOverlay) closeStory();
    });
}

// ── Toggle Favourite ─────────────────────────────────────────────────────────
async function toggleFavourite(storyId) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        alert('Please login to save your favourite stories!');
        window.location.href = 'index.html?openAuth=login';
        return;
    }
    const user = JSON.parse(savedUser);

    try {
        const res = await authFetch('/api/favourite/create', {
            method: 'POST',
            body: JSON.stringify({ userID: user._id || user.id, storyID: storyId })
        });
        if (res.ok) {
            alert('Added to your favourites! ✨');
        } else {
            const data = await res.json();
            alert(data.message || 'Already in favourites!');
        }
    } catch (err) {
        alert(err.message || 'Network error. Please try again.');
    }
}

async function removeFavourite(storyId) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const user = JSON.parse(savedUser);

    if (!confirm('Remove this story from your favourites?')) return;

    try {
        const userId = user._id || user.id;
        const response = await authFetch(`/api/favourite/remove/${userId}/${storyId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Removed from your favourites! 💫');
        } else {
            const data = await response.json();
            alert(data.message || 'Could not remove from favourites.');
        }
    } catch (error) {
        alert(error.message || 'Network error. Please try again.');
    }
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadStories);

