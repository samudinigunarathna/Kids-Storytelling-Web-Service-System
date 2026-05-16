// API Helper for Authenticated Requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log('authFetch check - Token:', token ? 'Exists' : 'MISSING', 'User:', savedUser ? 'Exists' : 'MISSING');

    // Public routes don't strictly need a token
    const isPublicRoute = url.includes('/api/story/getAllStories') || url.includes('/api/story/getStoryById');

    if (!token && !isPublicRoute) {
        console.warn('Blocking request: No token found for protected route');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html?openAuth=login';
        throw new Error('Please login to continue.');
    }


    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Sending token in header:', `Bearer ${token.substring(0, 10)}...`);
    } else {
        console.warn('No token found in localStorage for authFetch');
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
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
        console.warn('No user or token found in localStorage, redirecting...');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
    loadQuizzes();
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
    const imageInput = document.getElementById('image');
    const contentInput = document.getElementById('content');

    if (story) {
        modalTitle.textContent = 'Rewrite the Tale';
        idInput.value = story._id;
        titleInput.value = story.title;
        authorInput.value = story.author;
        categoryInput.value = story.category;
        imageInput.value = story.image || '';
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
            image: document.getElementById('image').value,
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

// ── Quiz Management ──────────────────────────────────────────────────────────
async function loadQuizzes() {
    const tableBody = document.getElementById('quizTableBody');
    try {
        const storiesRes = await fetch('/api/story/getAllStories');
        const quizzesRes = await authFetch('/api/quiz/getAllQuizzes');
        
        if (storiesRes.ok && quizzesRes.ok) {
            const stories = await storiesRes.json();
            const quizzes = await quizzesRes.json();
            
            const storiesWithQuizzes = stories.map(story => {
                const quiz = quizzes.find(q => q.storyID && q.storyID._id === story._id);
                return {
                    storyId: story._id,
                    storyTitle: story.title,
                    quizId: quiz ? quiz._id : null,
                    questionsCount: quiz ? quiz.questions.length : 0,
                    hasQuiz: !!quiz
                };
            });
            renderQuizzes(storiesWithQuizzes);
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--primary);">Failed to load quizzes.</td></tr>';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--primary);">Network error while loading quizzes.</td></tr>';
    }
}

function renderQuizzes(quizData) {
    const tableBody = document.getElementById('quizTableBody');
    if (!tableBody) return;
    
    if (quizData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No stories available to add quizzes to.</td></tr>';
        return;
    }

    tableBody.innerHTML = quizData.map(data => `
        <tr>
            <td style="font-weight: 600;">${data.storyTitle}</td>
            <td>
                <span class="role-badge" style="background: ${data.hasQuiz ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${data.hasQuiz ? '#16a34a' : '#dc2626'};">
                    ${data.hasQuiz ? 'Exists' : 'Missing'}
                </span>
            </td>
            <td>${data.questionsCount}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="openQuizModal('${data.storyId}', '${data.storyTitle.replace(/'/g, "\\'")}')" title="${data.hasQuiz ? 'Edit Quiz' : 'Add Quiz'}" style="color: var(--accent);">
                        <i data-lucide="${data.hasQuiz ? 'edit' : 'plus-circle'}" style="width: 18px; height: 18px;"></i>
                    </button>
                    ${data.hasQuiz ? `
                    <button class="btn-icon" onclick="deleteAdminQuiz('${data.quizId}')" title="Delete Quiz" style="color: #ef4444;">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
}

async function openQuizModal(storyId, storyTitle) {
    const modal = document.getElementById('quizModal');
    document.getElementById('quizStoryId').value = storyId;
    document.getElementById('quizStoryTitle').textContent = `For: ${storyTitle}`;
    const btnDelete = document.getElementById('btnDeleteQuiz');
    const questionsContainer = document.getElementById('questionsContainer');
    
    questionsContainer.innerHTML = '';
    
    try {
        const response = await authFetch(`/api/quiz/getQuiz/${storyId}`);
        if (response.ok) {
            const quizData = await response.json();
            document.getElementById('quizId').value = quizData._id;
            btnDelete.style.display = 'block';
            
            quizData.questions.forEach((q, index) => {
                addQuestionField(q);
            });
        } else {
            // No quiz exists yet
            document.getElementById('quizId').value = '';
            btnDelete.style.display = 'none';
            addQuestionField(); // Add one empty question to start
        }
    } catch (error) {
        console.error('Error fetching quiz:', error);
        document.getElementById('quizId').value = '';
        btnDelete.style.display = 'none';
        addQuestionField();
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuizModal() {
    const modal = document.getElementById('quizModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

let questionCounter = 0;
function addQuestionField(questionData = null) {
    const container = document.getElementById('questionsContainer');
    const qId = questionCounter++;
    
    const questionText = questionData ? questionData.questionText : '';
    const options = questionData ? questionData.options : ['', '', '', ''];
    const correctIndex = questionData ? questionData.correctOptionIndex : 0;
    
    const questionHTML = `
        <div class="quiz-question-block" style="background: var(--bg); padding: 1.5rem; border-radius: 1rem; position: relative;">
            <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #ef4444; cursor: pointer;">
                <i data-lucide="trash" style="width: 18px; height: 18px;"></i>
            </button>
            <label class="form-label">Question</label>
            <input type="text" class="premium-input question-text" style="padding-left: 1.2rem; margin-bottom: 1rem;" placeholder="Enter question..." value="${questionText}" required>
            
            <label class="form-label">Options (Select the correct one)</label>
            <div style="display: grid; gap: 0.8rem;">
                ${options.map((opt, i) => `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="radio" name="correct-${qId}" value="${i}" ${i === correctIndex ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                        <input type="text" class="premium-input option-text" style="padding-left: 1.2rem; flex: 1;" placeholder="Option ${i + 1}" value="${opt}" required>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
    if (window.lucide) window.lucide.createIcons();
}

const quizFormElement = document.getElementById('quizForm');
if (quizFormElement) {
    quizFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const quizId = document.getElementById('quizId').value;
        const storyId = document.getElementById('quizStoryId').value;
        
        const questionBlocks = document.querySelectorAll('.quiz-question-block');
        if (questionBlocks.length === 0) {
            alert('Please add at least one question.');
            return;
        }
        
        const questions = [];
        let isValid = true;
        
        questionBlocks.forEach(block => {
            const questionText = block.querySelector('.question-text').value.trim();
            const optionInputs = block.querySelectorAll('.option-text');
            const options = Array.from(optionInputs).map(opt => opt.value.trim());
            const correctRadio = block.querySelector('input[type="radio"]:checked');
            
            if (!questionText || options.some(o => !o) || !correctRadio) {
                isValid = false;
            } else {
                questions.push({
                    questionText,
                    options,
                    correctOptionIndex: parseInt(correctRadio.value)
                });
            }
        });
        
        if (!isValid) {
            alert('Please fill out all fields and select a correct answer for each question.');
            return;
        }
        
        const url = quizId ? `/api/quiz/update/${quizId}` : '/api/quiz/create';
        const method = quizId ? 'PUT' : 'POST';
        
        try {
            const response = await authFetch(url, {
                method: method,
                body: JSON.stringify({ storyID: storyId, questions })
            });
            
            if (response.ok) {
                alert(quizId ? 'Quiz updated successfully! ✨' : 'Quiz created successfully! 🧠');
                closeQuizModal();
                loadQuizzes();
            } else {
                const data = await response.json();
                alert(data.message || 'Error saving quiz.');
            }
        } catch (error) {
            console.error('Save quiz error:', error);
        }
    });
}

async function deleteAdminQuiz(overrideId = null) {
    const quizId = overrideId || document.getElementById('quizId').value;
    if (!quizId) return;
    
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
        const response = await authFetch(`/api/quiz/delete/${quizId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Quiz deleted successfully.');
            closeQuizModal();
            loadQuizzes();
        } else {
            alert('Failed to delete quiz.');
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
    }
}

