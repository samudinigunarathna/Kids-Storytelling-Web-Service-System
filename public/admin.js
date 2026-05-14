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
    
    if (response.status === 401 || response.status === 403) {
        // Token expired or insufficient permissions
        if (response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = 'index.html?openAuth=login';
        } else {
            alert('Access Denied: You do not have permission for this action.');
        }
        throw new Error('Authorization failed');
    }
    
    return response;
}

// Admin Page Protection
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded, checking auth...');
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
        console.warn('No user found in localStorage, redirecting...');
        window.location.href = 'index.html?openAuth=login';
        return;
    }

    const user = JSON.parse(savedUser);
    console.log('User role:', user.role);
    if (user.role !== 'admin') {
        console.error('Access denied for role:', user.role);
        alert('Access Denied: You do not have magical admin powers! ⛔');
        window.location.href = 'index.html';
        return;
    }

    console.log('Admin confirmed, loading data...');
    // If admin, load data
    loadUsers();
    loadStories();
});

// ── User Management ──────────────────────────────────────────────────────────
async function loadUsers() {
    const tableBody = document.getElementById('userTableBody');
    try {
        const response = await authFetch('/api/user/getAllUsers');
        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--primary);">Failed to fetch users.</td></tr>';
        }
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--primary);">Network error while loading users.</td></tr>';
    }
}

function renderUsers(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No users found in the kingdom yet.</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td style="font-weight: 600;">${user.name}</td>
            <td>${user.email}</td>
            <td>${user.childName}</td>
            <td>
                <span class="role-badge role-${user.role || 'user'}">
                    ${user.role || 'user'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="deleteUser('${user._id}')" title="Remove User">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleRole('${user._id}', '${user.role}')" title="Toggle Admin Role">
                        <i data-lucide="shield" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to banish this user from the kingdom? 🧙‍♂️')) return;

    try {
        const response = await authFetch(`/api/user/delete/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('User removed successfully.');
            loadUsers();
        } else {
            alert('Failed to remove user.');
        }
    } catch (error) {
        console.error('Delete user error:', error);
    }
}

async function toggleRole(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
        const response = await authFetch(`/api/user/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
            alert(`Role updated to ${newRole}!`);
            loadUsers();
        } else {
            alert('Failed to update role.');
        }
    } catch (error) {
        console.error('Toggle role error:', error);
    }
}

// ── Story Management ─────────────────────────────────────────────────────────
async function loadStories() {
    const tableBody = document.getElementById('storyTableBody');
    try {
        const response = await fetch('/api/story/getAllStories');
        if (response.ok) {
            const stories = await response.json();
            renderStories(stories);
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--primary);">Failed to load library archives.</td></tr>';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--primary);">The library is locked behind a network error.</td></tr>';
    }
}

function renderStories(stories) {
    const tableBody = document.getElementById('storyTableBody');
    if (!tableBody) return;
    
    if (stories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">The library is empty. Time to write some magic!</td></tr>';
        return;
    }

    tableBody.innerHTML = stories.map(story => `
        <tr>
            <td style="font-weight: 600;">${story.title}</td>
            <td>${story.author}</td>
            <td><span class="role-badge" style="background: rgba(255, 117, 160, 0.1); color: var(--primary);">${story.category}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editStory('${story._id}')" title="Edit Story">
                        <i data-lucide="edit-3" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteStory('${story._id}')" title="Remove Story">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
}

function openStoryModal(story = null) {
    const modal = document.getElementById('storyModal');
    const modalTitle = document.getElementById('modalTitle');
    const idInput = document.getElementById('storyId');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const categoryInput = document.getElementById('category');
    const contentInput = document.getElementById('content');

    if (story) {
        modalTitle.textContent = 'Rewrite the Tale';
        idInput.value = story._id;
        titleInput.value = story.title;
        authorInput.value = story.author;
        categoryInput.value = story.category;
        contentInput.value = story.content;
    } else {
        modalTitle.textContent = 'Draft a New Story';
        document.getElementById('storyForm').reset();
        idInput.value = '';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeStoryModal() {
    const modal = document.getElementById('storyModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

async function editStory(id) {
    try {
        const response = await fetch(`/api/story/getStoryById/${id}`);
        if (response.ok) {
            const story = await response.json();
            openStoryModal(story);
        }
    } catch (error) {
        alert('Could not retrieve story details.');
    }
}

async function deleteStory(id) {
    if (!confirm('Are you sure you want to delete this magical tale? It will be lost forever! 📖🔥')) return;

    try {
        const response = await authFetch(`/api/story/delete/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert('Story deleted successfully.');
            loadStories();
        } else {
            alert('Failed to delete story.');
        }
    } catch (error) {
        console.error('Delete story error:', error);
    }
}

const storyFormElement = document.getElementById('storyForm');
if (storyFormElement) {
    storyFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('storyId').value;
        const storyData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value,
            content: document.getElementById('content').value
        };

        const url = id ? `/api/story/update/${id}` : '/api/story/create';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method: method,
                body: JSON.stringify(storyData)
            });

            if (response.ok) {
                alert(id ? 'Story updated! ✨' : 'New story added to the library! 📚');
                closeStoryModal();
                loadStories();
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving story.');
            }
        } catch (error) {
            console.error('Save story error:', error);
        }
    });
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

