// ==========================
// GLOBAL VARIABLES
// ==========================
let currentSection = 'dashboard';
let topicsData = [];
let currentTopicId = null;
let currentQuiz = null;
let quizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let questionResults = {};
let quizTimer = null;
let timeLeft = 0;
let currentAttemptId = null;
let dashboardData = null;
let currentPDFId = null;
let currentPDFTitle = '';
let currentPDFPages = [];

// PDF.js variables
let pdfCanvas = null;
let pdfCtx = null;
let currentPageText = '';
let pdfDoc = null;
let currentPage = 1;
let pdfScale = 1.2;
let pageHeights = [];
let pageOffsets = [];

// Global variable to store extracted PDF text
let extractedPDFText = '';

// ==========================
// INITIALIZATION
// ==========================
document.addEventListener('DOMContentLoaded', function () {
    addQuizStyles();
    initializeUserSession();
    document.body.classList.add('animate__animated', 'animate__fadeIn');
    loadDashboard();
    showSection('dashboard');
});

function initializeUserSession() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        window.location.href = 'login.html';
        return;
    }

    const roles = user.roles.map(role => role.replace('ROLE_', ''));
    if (!roles.includes('STUDENT') && !roles.includes('ADMIN')) {
        showNotification('Access denied. Student role required.', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    api.setToken(user.token);
    document.getElementById('usernameDisplay').textContent = user.username;
}

// ==========================
// NAVIGATION
// ==========================
function showSection(sectionName) {
    // Hide all sections with fade out
    document.querySelectorAll('.content-section').forEach(section => {
        if (section.style.display !== 'none') {
            section.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                section.style.display = 'none';
                section.classList.remove('animate__fadeOut');
            }, 300);
        }
    });

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section with fade in
    setTimeout(() => {
        const targetSection = document.getElementById(sectionName + 'Section');
        targetSection.style.display = 'block';
        targetSection.classList.add('animate__animated', 'animate__fadeIn');

        document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
        currentSection = sectionName;
        loadSectionData(sectionName);
    }, 350);
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'responses':
            loadResponses();
            break;
        case 'topics':
            loadTopics();
            loadCategories();
            break;
        case 'quizzes':
            if (!api.token) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.token) {
                    api.setToken(user.token);
                } else {
                    showNotification('Please login first', 'error');
                    return;
                }
            }
            loadQuizzes();
            break;
        case 'pdf':
            loadPDFs();
            break;
    }
}

// ==========================
// DASHBOARD FUNCTIONS
// ==========================
async function loadDashboard() {
    try {
        showLoading('studentDashboard', 'Loading your dashboard...');
        const dashboard = await api.get("/student/dashboard");
        renderStudentDashboard(dashboard);
        updateQuickStats(dashboard);
    } catch (err) {
        console.error('Failed to load dashboard:', err);
        document.getElementById("studentDashboard").innerHTML =
            `<div class="alert alert-danger">Failed to load dashboard: ${err.message}</div>`;
    }
}

function renderStudentDashboard(dashboard) {
    dashboardData = dashboard;
    const dashboardContainer = document.getElementById("studentDashboard");
    if (!dashboardContainer) return;

    const totalProjects = dashboard.projects ? dashboard.projects.length : 0;
    const totalResponses = dashboard.responses ? dashboard.responses.length : 0;
    const completedProjects = dashboard.projects ?
        dashboard.projects.filter(p => p.projectStatus === 'COMPLETED').length : 0;

    let dashboardHtml = `
        <div class="row">
            <!-- Student Profile Card -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0"><i class="fas fa-user-graduate me-2"></i>Student Profile</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-sm-4 fw-bold">Name:</div>
                            <div class="col-sm-8">${escapeHtml(dashboard.firstName || '')} ${escapeHtml(dashboard.lastName || '')}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-sm-4 fw-bold">Enrollment:</div>
                            <div class="col-sm-8">${escapeHtml(dashboard.enrollmentNumber || 'N/A')}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-sm-4 fw-bold">Branch:</div>
                            <div class="col-sm-8">${escapeHtml(dashboard.branch || 'N/A')}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-sm-4 fw-bold">Semester:</div>
                            <div class="col-sm-8">${escapeHtml(dashboard.semester || 'N/A')}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-sm-4 fw-bold">Email:</div>
                            <div class="col-sm-8">${escapeHtml(dashboard.email || 'N/A')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Stats Card -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0"><i class="fas fa-chart-line me-2"></i>Performance</h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-6 mb-3">
                                <div class="p-3 bg-light rounded">
                                    <h4 class="text-primary mb-1">${dashboard.overallPerformance || 0}%</h4>
                                    <small class="text-muted">Overall Performance</small>
                                </div>
                            </div>
                            <div class="col-6 mb-3">
                                <div class="p-3 bg-light rounded">
                                    <h4 class="text-info mb-1">${totalProjects}</h4>
                                    <small class="text-muted">Total Projects</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-3 bg-light rounded">
                                    <h4 class="text-warning mb-1">${totalResponses}</h4>
                                    <small class="text-muted">Assessment Responses</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-3 bg-light rounded">
                                    <h4 class="text-success mb-1">${dashboard.difficultyLevel || 'N/A'}</h4>
                                    <small class="text-muted">Difficulty Level</small>
                                </div>
                            </div>
                        </div>
                        ${completedProjects > 0 ? `
                        <div class="mt-3 text-center">
                            <small class="text-muted">${completedProjects} of ${totalProjects} projects completed</small>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Learning Style & Additional Info -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0"><i class="fas fa-brain me-2"></i>Learning Profile</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <strong>Learning Style:</strong>
                                    <span class="badge bg-secondary ms-2">${escapeHtml(dashboard.learningStyle || 'Not specified')}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <strong>Teacher ID:</strong>
                                    <span class="ms-2">${dashboard.teacherId || 'Not assigned'}</span>
                                </div>
                            </div>
                        </div>
                        ${dashboard.username ? `
                        <div class="row">
                            <div class="col-12">
                                <strong>Username:</strong>
                                <span class="ms-2 text-muted">${escapeHtml(dashboard.username)}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = dashboardHtml;
}

function updateQuickStats(dashboard) {
    const projectsCount = dashboard.projects ? dashboard.projects.length : 0;
    const responsesCount = dashboard.responses ? dashboard.responses.length : 0;
    const performanceScore = dashboard.overallPerformance || 0;
    const difficultyLevel = dashboard.difficultyLevel || 'N/A';

    document.getElementById('projectsCount').textContent = projectsCount;
    document.getElementById('responsesCount').textContent = responsesCount;
    document.getElementById('performanceScore').textContent = performanceScore + '%';
    document.getElementById('difficultyLevel').textContent = difficultyLevel;
    document.getElementById('quickStats').style.display = 'flex';
}

function refreshDashboard() {
    loadDashboard();
    showNotification('Dashboard refreshed!', 'success');
}

// ==========================
// PROJECTS FUNCTIONS
// ==========================
async function loadProjects() {
    try {
        showLoading('projectsList', 'Loading projects...');
        const projects = await api.get("/student/projects");
        renderProjects(projects);
    } catch (err) {
        console.error('Failed to load projects:', err);
        document.getElementById("projectsList").innerHTML =
            `<div class="alert alert-danger">Failed to load projects: ${err.message}</div>`;
    }
}

function renderProjects(projects) {
    const projectContainer = document.getElementById("projectsList");
    if (!projectContainer) return;

    if (!projects || projects.length === 0) {
        projectContainer.innerHTML = `
            <div class="text-center py-5 animate__animated animate__fadeIn">
                <i class="fas fa-project-diagram fa-4x text-muted mb-3"></i>
                <h4>No Projects Yet</h4>
                <p class="text-muted mb-4">Start your first project to showcase your work!</p>
                <button class="btn btn-success btn-lg" onclick="showCreateProjectModal()">
                    <i class="fas fa-plus me-2"></i>Create Your First Project
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card glass-effect">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-chart-pie me-2"></i>Projects Overview</h5>
                        <div class="row text-center">
                            <div class="col-md-3">
                                <h3 class="text-primary">${projects.length}</h3>
                                <small class="text-muted">Total Projects</small>
                            </div>
                            <div class="col-md-3">
                                <h3 class="text-success">${projects.filter(p => p.projectStatus === 'COMPLETED').length}</h3>
                                <small class="text-muted">Completed</small>
                            </div>
                            <div class="col-md-3">
                                <h3 class="text-warning">${projects.filter(p => p.projectStatus === 'IN_PROGRESS').length}</h3>
                                <small class="text-muted">In Progress</small>
                            </div>
                            <div class="col-md-3">
                                <h3 class="text-info">${Math.round(projects.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / projects.length)}%</h3>
                                <small class="text-muted">Average Progress</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
    `;

    projects.forEach(project => {
        const statusBadge = getStatusBadge(project.projectStatus);
        const progressBar = getProgressBar(project.progressPercentage);

        html += `
            <div class="col-lg-6 mb-4 animate__animated animate__fadeInUp">
                <div class="card h-100 project-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title fw-bold">${escapeHtml(project.title || "")}</h5>
                            ${statusBadge}
                        </div>
                        
                        <p class="card-text text-muted">${escapeHtml(project.description || "No description")}</p>
                        
                        ${project.technologiesUsed ? `
                        <div class="mb-3">
                            <small class="text-muted fw-bold">Technologies:</small>
                            <div class="mt-1">${escapeHtml(project.technologiesUsed)}</div>
                        </div>
                        ` : ''}
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <small class="text-muted fw-bold">Start Date:</small>
                                <div>${project.startDate ? formatDisplayDate(project.startDate) : "Not set"}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted fw-bold">End Date:</small>
                                <div>${project.endDate ? formatDisplayDate(project.endDate) : "Not set"}</div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <small class="text-muted fw-bold">Progress:</small>
                            <div class="d-flex align-items-center mt-1">
                                ${progressBar}
                                <span class="ms-2 fw-bold ${project.progressPercentage >= 100 ? 'text-success' : 'text-primary'}">
                                    ${project.progressPercentage || 0}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            ${getLinkHtml(project.githubUrl, '<i class="fab fa-github me-1"></i>GitHub', 'btn-outline-dark btn-sm')}
                            ${getLinkHtml(project.documentationUrl, '<i class="fas fa-book me-1"></i>Docs', 'btn-outline-info btn-sm')}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex gap-2">
                            <button class="btn btn-warning btn-sm flex-fill" 
                                    onclick="showUpdateProgressModal(${project.id}, '${escapeHtml(project.title)}', ${project.progressPercentage || 0})">
                                <i class="fas fa-edit me-1"></i>Update Progress
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="viewProjectDetails(${project.id})">
                                <i class="fas fa-eye me-1"></i>View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    projectContainer.innerHTML = html;
}

function showCreateProjectModal() {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    document.getElementById('projectStartDate').value = today;
    document.getElementById('projectEndDate').value = nextMonthStr;
    document.getElementById('createProjectForm').reset();

    const modal = new bootstrap.Modal(document.getElementById('createProjectModal'));
    modal.show();
}

async function createNewProject(projectData) {
    try {
        const formattedData = {
            ...projectData,
            startDate: projectData.startDate,
            endDate: projectData.endDate
        };

        const project = await api.post('/student/projects', formattedData);
        return project;
    } catch (err) {
        console.error('Failed to create project:', err);
        throw err;
    }
}

async function submitProjectForm() {
    const form = document.getElementById('createProjectForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologiesUsed: document.getElementById('projectTechnologies').value,
        startDate: document.getElementById('projectStartDate').value,
        endDate: document.getElementById('projectEndDate').value,
        githubUrl: document.getElementById('projectGithubUrl').value,
        documentationUrl: document.getElementById('projectDocUrl').value
    };

    try {
        showLoadingModal('Creating project...');
        await createNewProject(projectData);

        bootstrap.Modal.getInstance(document.getElementById('createProjectModal')).hide();
        await loadProjects();
        showNotification('Project created successfully!', 'success');
    } catch (err) {
        console.error('Failed to create project:', err);
        showNotification('Failed to create project: ' + err.message, 'error');
    } finally {
        hideLoadingModal();
    }
}

function showUpdateProgressModal(projectId, projectTitle, currentProgress = 0) {
    document.getElementById('progressProjectId').value = projectId;
    document.getElementById('progressProjectTitle').textContent = projectTitle;

    const progress = currentProgress || 0;
    document.getElementById('progressSlider').value = progress;
    updateProgressValue(progress);

    const modal = new bootstrap.Modal(document.getElementById('updateProgressModal'));
    modal.show();
}

function updateProgressValue(value) {
    document.getElementById('progressValue').textContent = value + '%';
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = value + '%';
    progressBar.textContent = value + '%';

    progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    if (value >= 100) {
        progressBar.classList.add('bg-success');
    } else if (value >= 50) {
        progressBar.classList.add('bg-warning');
    } else {
        progressBar.classList.add('bg-info');
    }
}

async function updateProjectProgress(projectId, progress) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            throw new Error('User not authenticated');
        }

        const project = await api.put(`/student/projects/${projectId}/progress?progress=${progress}`);
        return project;
    } catch (err) {
        if (err.message.includes('403')) {
            throw new Error('You do not have permission to update this project. It may not belong to you.');
        } else if (err.message.includes('404')) {
            throw new Error('Project not found.');
        } else {
            throw err;
        }
    }
}

async function submitProgressUpdate() {
    const projectId = document.getElementById('progressProjectId').value;
    const progress = parseInt(document.getElementById('progressSlider').value);

    try {
        showLoadingModal('Updating progress...');
        await updateProjectProgress(projectId, progress);

        bootstrap.Modal.getInstance(document.getElementById('updateProgressModal')).hide();
        await loadProjects();
        showNotification('Project progress updated successfully!', 'success');
    } catch (err) {
        console.error('Failed to update progress:', err);
        showNotification('Failed to update progress: ' + err.message, 'error');
    } finally {
        hideLoadingModal();
    }
}

// ==========================
// RESPONSES FUNCTIONS
// ==========================
async function loadResponses() {
    try {
        showLoading('responsesList', 'Loading responses...');
        const responses = await api.get("/student/responses");
        renderResponses(responses);
    } catch (err) {
        console.error('Failed to load responses:', err);
        document.getElementById("responsesList").innerHTML =
            `<div class="alert alert-danger">Failed to load responses: ${err.message}</div>`;
    }
}

function renderResponses(responses) {
    const responseContainer = document.getElementById("responsesList");
    if (!responseContainer) return;

    if (!responses || responses.length === 0) {
        responseContainer.innerHTML = `<div class="alert alert-info">No responses submitted yet.</div>`;
        return;
    }

    let respHtml = `
        <h3>My Assessment Responses (${responses.length})</h3>
        <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover">
                <thead class="table-primary">
                    <tr>
                        <th>Assessment</th>
                        <th>Question</th>
                        <th>Your Answer</th>
                        <th>Status</th>
                        <th>Points</th>
                        <th>Submitted</th>
                        <th>Time Taken</th>
                        <th>Feedback</th>
                    </tr>
                </thead>
                <tbody>
    `;

    responses.forEach(r => {
        respHtml += `
            <tr>
                <td>
                    <strong>${escapeHtml(r.assessmentTitle || 'Unknown Assessment')}</strong>
                    ${r.assessmentId ? `<br><small class="text-muted">ID: ${r.assessmentId}</small>` : ''}
                </td>
                <td>${r.questionId ? `Question #${r.questionId}` : "N/A"}</td>
                <td class="text-truncate" style="max-width: 200px;" title="${escapeHtml(r.answer || 'No answer')}">
                    ${escapeHtml(r.answer || "<span class='text-muted'>No answer</span>")}
                </td>
                <td>
                    <span class="badge ${r.isCorrect ? 'bg-success' : 'bg-danger'}">
                        ${r.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                </td>
                <td>
                    <strong class="${r.pointsObtained > 0 ? 'text-success' : 'text-danger'}">
                        ${r.pointsObtained || 0}
                    </strong>
                </td>
                <td>
                    ${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "Pending"}
                    ${r.submittedAt ? `<br><small class="text-muted">${new Date(r.submittedAt).toLocaleTimeString()}</small>` : ''}
                </td>
                <td>${r.timeTaken ? r.timeTaken + ' seconds' : "N/A"}</td>
                <td class="text-truncate" style="max-width: 150px;" title="${escapeHtml(r.feedback || 'No feedback')}">
                    ${escapeHtml(r.feedback || "<span class='text-muted'>No feedback</span>")}
                </td>
            </tr>
        `;
    });

    respHtml += "</tbody></table></div>";
    responseContainer.innerHTML = respHtml;
}

// ==========================
// TOPICS FUNCTIONS
// ==========================
async function loadTopics(category = null, complexity = null) {
    try {
        showLoading('topicsList', 'Loading topics...');

        let url = '/student/topics';
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (complexity) params.append('complexityLevel', complexity);

        if (params.toString()) {
            url = `/student/topics/filter?${params.toString()}`;
        }

        const topics = await api.get(url);
        renderTopics(topics);
    } catch (err) {
        console.error('Failed to load topics:', err);
        document.getElementById('topicsList').innerHTML =
            `<div class="alert alert-danger">Failed to load topics: ${err.message}</div>`;
    }
}

async function loadCategories() {
    try {
        const categories = await api.get('/student/topics/categories');
        const categorySelect = document.getElementById('categoryFilter');

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

function renderTopics(topics) {
    const container = document.getElementById('topicsList');

    if (!topics || topics.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 animate__animated animate__fadeIn">
                <i class="fas fa-book-open fa-4x text-muted mb-3"></i>
                <h4>No Topics Found</h4>
                <p class="text-muted">No learning topics match your current filters.</p>
                <button class="btn btn-primary" onclick="clearTopicFilters()">
                    <i class="fas fa-times me-2"></i>Clear Filters
                </button>
            </div>
        `;
        return;
    }

    topicsData = topics;

    let html = `<div class="row">`;

    topics.forEach((topic, index) => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                <div class="card h-100 topic-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title fw-bold">${escapeHtml(topic.title || 'Untitled Topic')}</h5>
                            <span class="badge bg-primary">${topic.complexityLevel || 1}★</span>
                        </div>
                        <p class="card-text text-muted">${escapeHtml(topic.description || 'No description available.')}</p>
                        
                        <div class="mb-3">
                            <span class="badge bg-secondary">${escapeHtml(topic.category || 'Uncategorized')}</span>
                        </div>
                        
                        <div class="topic-stats small text-muted mb-3">
                            <div><i class="fas fa-book me-1"></i> ${topic.explanationCount || 0} explanations</div>
                            <div><i class="fas fa-tasks me-1"></i> ${topic.assessmentCount || 0} assessments</div>
                        </div>
                        
                        <div class="topic-meta small text-muted">
                            <div><i class="fas fa-user me-1"></i> ${escapeHtml(topic.teacherName || 'Unknown Teacher')}</div>
                            <div><i class="fas fa-calendar me-1"></i> ${topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'Unknown'}</div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <button class="btn btn-primary w-100" onclick="viewTopicDetails(${topic.id})">
                            <i class="fas fa-eye me-2"></i>Explore Topic
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function viewTopicDetails(topicId) {
    currentTopicId = topicId;
    const topic = topicsData.find(t => t.id === topicId);

    if (!topic) {
        showNotification('Topic not found!', 'error');
        return;
    }

    document.getElementById('topicModalTitle').textContent = topic.title || 'Untitled Topic';
    document.getElementById('topicModalDescription').textContent = topic.description || 'No description available.';
    document.getElementById('topicModalCategory').textContent = topic.category || 'Uncategorized';
    document.getElementById('topicModalComplexity').textContent = `Level ${topic.complexityLevel || 1}`;
    document.getElementById('topicModalExplanations').textContent = topic.explanationCount || 0;
    document.getElementById('topicModalAssessments').textContent = topic.assessmentCount || 0;
    document.getElementById('topicModalTeacher').textContent = topic.teacherName || 'Unknown Teacher';

    loadTopicExplanation(topicId);
    const modal = new bootstrap.Modal(document.getElementById('topicDetailModal'));
    modal.show();
}

function loadTopicExplanation(topicId) {
    const explanationElement = document.getElementById('topicModalExplanation');
    explanationElement.innerHTML = `
        <p>This is where the detailed explanation for the topic will appear.</p>
        <p>Future implementation will include:</p>
        <ul>
            <li>Rich text explanations</li>
            <li>Code examples</li>
            <li>Interactive diagrams</li>
            <li>Video tutorials</li>
            <li>Practice exercises</li>
        </ul>
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            Explanation feature coming soon!
        </div>
    `;
}

function startLearning() {
    showNotification('Starting learning session for topic ' + currentTopicId, 'info');
}

function takeAssessment() {
    showNotification('Preparing assessment for topic ' + currentTopicId, 'info');
}

function showTopicFilters() {
    const filters = document.getElementById('topicFilters');
    if (filters.style.display === 'none') {
        filters.style.display = 'block';
        filters.classList.add('animate__animated', 'animate__fadeInDown');
    } else {
        filters.classList.add('animate__animated', 'animate__fadeOutUp');
        setTimeout(() => {
            filters.style.display = 'none';
            filters.classList.remove('animate__fadeOutUp');
        }, 300);
    }
}

function applyTopicFilters() {
    const category = document.getElementById('categoryFilter').value;
    const complexity = document.getElementById('complexityFilter').value;
    loadTopics(category, complexity);
}

function clearTopicFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('complexityFilter').value = '';
    document.getElementById('topicSearch').value = '';
    loadTopics();
}

function searchTopics() {
    const searchTerm = document.getElementById('topicSearch').value;
    if (searchTerm.trim()) {
        showNotification(`Searching for: ${searchTerm}`, 'info');
    }
}

// ==========================
// QUIZ FUNCTIONS
// ==========================
async function loadQuizzes() {
    const container = document.getElementById("quizContainer");

    try {
        showLoading('quizContainer', 'Loading quizzes...');
        const quizzes = await api.get("/student/quizzes");

        if (!quizzes || quizzes.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5 animate__animated animate__fadeIn">
                        <i class="fas fa-question-circle fa-4x text-muted mb-3"></i>
                        <h4>No Quizzes Available</h4>
                        <p class="text-muted">Check back later for new quizzes!</p>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        quizzes.forEach((quiz, index) => {
            html += `
                <div class="col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                    <div class="card h-100 quiz-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title fw-bold">${escapeHtml(quiz.title || 'Untitled Quiz')}</h5>
                                <span class="badge bg-primary">Quiz</span>
                            </div>
                            
                            ${quiz.description ? `<p class="text-muted mb-3">${escapeHtml(quiz.description)}</p>` : ''}
                            
                            <div class="quiz-details small mb-3">
                                ${quiz.duration ? `
                                    <div class="mb-1">
                                        <i class="fas fa-clock me-1 text-info"></i>
                                        Duration: ${quiz.duration} minutes
                                    </div>
                                ` : ''}
                                
                                ${quiz.totalQuestions ? `
                                    <div class="mb-1">
                                        <i class="fas fa-question me-1 text-info"></i>
                                        Questions: ${quiz.totalQuestions}
                                    </div>
                                ` : ''}
                                
                                ${quiz.passingScore ? `
                                    <div class="mb-1">
                                        <i class="fas fa-trophy me-1 text-info"></i>
                                        Passing Score: ${quiz.passingScore}%
                                    </div>
                                ` : ''}
                                
                                ${quiz.topicName ? `
                                    <div class="mb-1">
                                        <i class="fas fa-book me-1 text-info"></i>
                                        Topic: ${escapeHtml(quiz.topicName)}
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <small class="text-muted">
                                    By: ${quiz.teacherName || 'Unknown Teacher'}
                                </small>
                                <button class="btn btn-primary btn-sm" onclick="startQuiz(${quiz.id})">
                                    <i class="fas fa-play me-1"></i> Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error('Failed to load quizzes:', err);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load quizzes: ${err.message}
                </div>
            </div>
        `;
    }
}

async function startQuiz(quizId) {
    try {
        currentQuiz = await api.get(`/student/quizzes/${quizId}`);
        const attempt = await api.post(`/student/quizzes/${quizId}/start`);
        currentAttemptId = attempt.id;

        quizQuestions = await getQuizQuestions(quizId);

        if (!quizQuestions || quizQuestions.length === 0) {
            showNotification('No questions available for this quiz!', 'error');
            return;
        }

        currentQuestionIndex = 0;
        userAnswers = {};
        questionResults = {};
        timeLeft = currentQuiz.duration ? currentQuiz.duration * 60 : 1800;

        document.getElementById('quizModalTitle').innerHTML =
            `<i class="fas fa-question-circle me-2"></i>${escapeHtml(currentQuiz.title)}`;

        const modal = new bootstrap.Modal(document.getElementById('quizModal'));
        modal.show();

        document.getElementById('quizContent').style.display = 'block';
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizContent').innerHTML = '';

        startQuizTimer();
        loadQuestion(currentQuestionIndex);

    } catch (err) {
        console.error('Failed to start quiz:', err);
        showNotification('Failed to start quiz: ' + err.message, 'error');
    }
}

async function getQuizQuestions(quizId) {
    try {
        const questions = await api.get(`/student/quizzes/${quizId}/questions`);
        if (questions && questions.length > 0) {
            return questions;
        }
        throw new Error('No questions found');
    } catch (err) {
        console.warn(`Failed to get questions:`, err.message);
        return getMockQuestions();
    }
}

function loadQuestion(index) {
    if (index < 0 || index >= quizQuestions.length) return;

    currentQuestionIndex = index;
    const question = quizQuestions[index];
    const previousAnswer = userAnswers[question.id];
    const result = questionResults[question.id];

    let html = `
        <div class="quiz-question-container">
            <div class="question-meta mb-3">
                <span class="badge bg-info me-2">Question ${index + 1} of ${quizQuestions.length}</span>
                ${question.points ? `<span class="badge bg-warning">${question.points} points</span>` : ''}
            </div>
            
            <h5 class="question-text mb-4">
                ${escapeHtml(question.questionText || 'No question text available.')}
            </h5>
    `;

    if (question.questionType === 'MCQ' && question.options && question.options.length > 0) {
        html += '<div class="options-container mb-4">';

        question.options.forEach((option, optIndex) => {
            const isSelected = previousAnswer === option.id;
            const isCorrect = result && result.correctAnswer === option.id;
            const isWrong = result && !result.isCorrect && previousAnswer === option.id;
            const letters = ['A', 'B', 'C', 'D'];

            let optionClass = 'option-radio';
            if (result) {
                if (isCorrect) optionClass += ' correct-answer';
                if (isWrong) optionClass += ' wrong-answer';
            } else if (isSelected) {
                optionClass += ' selected';
            }

            html += `
                <div class="${optionClass}" onclick="selectOption(${question.id}, ${option.id}, ${optIndex})">
                    <input type="radio" 
                           id="option_${question.id}_${option.id}" 
                           name="question_${question.id}" 
                           value="${option.id}"
                           ${isSelected ? 'checked' : ''}
                           onchange="selectOption(${question.id}, ${option.id}, ${optIndex})">
                    <label for="option_${question.id}_${option.id}">
                        <span class="option-letter">${letters[optIndex] || optIndex + 1}</span>
                        <span class="option-text">${escapeHtml(option.optionText)}</span>
                    </label>
                </div>
            `;
        });

        html += '</div>';
    } else if (question.questionType === 'TRUE_FALSE') {
        html += `
            <div class="options-container mb-4">
                <div class="option-radio ${result ? (previousAnswer === 'true' && result.isCorrect ? 'correct-answer' : previousAnswer === 'true' ? 'wrong-answer' : '') : previousAnswer === 'true' ? 'selected' : ''}" 
                     onclick="selectOption(${question.id}, 'true', 0)">
                    <input type="radio" 
                           id="option_${question.id}_true" 
                           name="question_${question.id}" 
                           value="true"
                           ${previousAnswer === 'true' ? 'checked' : ''}
                           onchange="selectOption(${question.id}, 'true', 0)">
                    <label for="option_${question.id}_true">
                        <span class="option-letter">A</span>
                        <span class="option-text">True</span>
                    </label>
                </div>
                <div class="option-radio ${result ? (previousAnswer === 'false' && result.isCorrect ? 'correct-answer' : previousAnswer === 'false' ? 'wrong-answer' : '') : previousAnswer === 'false' ? 'selected' : ''}" 
                     onclick="selectOption(${question.id}, 'false', 1)">
                    <input type="radio" 
                           id="option_${question.id}_false" 
                           name="question_${question.id}" 
                           value="false"
                           ${previousAnswer === 'false' ? 'checked' : ''}
                           onchange="selectOption(${question.id}, 'false', 1)">
                    <label for="option_${question.id}_false">
                        <span class="option-letter">B</span>
                        <span class="option-text">False</span>
                    </label>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="mb-4">
                <label class="form-label fw-bold">Your Answer:</label>
                <textarea class="form-control" id="answerText${question.id}" 
                          rows="4" placeholder="Type your answer here..."
                          oninput="saveOpenEndedAnswer(${question.id}, this.value)">${previousAnswer || ''}</textarea>
            </div>
        `;
    }

    if (result) {
        html += `
            <div class="result-feedback animate__animated animate__fadeIn ${result.isCorrect ? 'result-correct' : 'result-wrong'}">
                <div class="d-flex align-items-center mb-2">
                    <i class="fas ${result.isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-2 fa-lg"></i>
                    <h5 class="mb-0 ${result.isCorrect ? 'text-success' : 'text-danger'}">
                        ${result.isCorrect ? 'Correct!' : 'Incorrect'}
                    </h5>
                </div>
                
                ${!result.isCorrect && result.correctAnswer ? `
                    <div class="correct-answer-display">
                        <strong>Correct Answer:</strong> 
                        <span class="text-success">${escapeHtml(result.correctAnswerText || result.correctAnswer)}</span>
                    </div>
                ` : ''}
                
                ${result.explanation ? `
                    <div class="explanation mt-2">
                        <strong>Explanation:</strong> ${escapeHtml(result.explanation)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    html += `
        <div class="quiz-navigation d-flex justify-content-between mt-4">
            <div>
                <button class="btn btn-outline-primary ${index === 0 ? 'disabled' : ''}" 
                        onclick="loadQuestion(${index - 1})">
                    <i class="fas fa-arrow-left me-2"></i>Previous
                </button>
            </div>
            <div>
                ${!result ? `
                    <button class="btn btn-success" onclick="checkAnswer(${question.id})">
                        <i class="fas fa-check me-2"></i>Check Answer
                    </button>
                ` : ''}
                <button class="btn btn-primary ${index === quizQuestions.length - 1 ? 'disabled' : ''}" 
                        onclick="loadQuestion(${index + 1})">
                    Next <i class="fas fa-arrow-right ms-2"></i>
                </button>
            </div>
        </div>
    `;

    html += '</div>';
    document.getElementById('quizContent').innerHTML = html;

    const nextBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitQuizBtn');

    if (index === quizQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }

    updateQuizProgress();
}

function selectOption(questionId, optionId, optionIndex) {
    if (questionResults[questionId]) return;

    userAnswers[questionId] = optionId;

    const questionElement = document.querySelector(`[onclick*="selectOption(${questionId}, ${optionId}, ${optionIndex})"]`);
    if (questionElement) {
        questionElement.parentElement.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        const radioInput = questionElement.querySelector('input[type="radio"]');
        if (radioInput) {
            radioInput.checked = true;
        }

        questionElement.parentElement.querySelectorAll('.option-radio').forEach(option => {
            option.classList.remove('selected');
        });
        questionElement.classList.add('selected');
    }

    updateQuizProgress();
}

async function checkAnswer(questionId) {
    try {
        const question = quizQuestions.find(q => q.id === questionId);
        const selectedAnswer = userAnswers[questionId];

        if (!selectedAnswer) {
            showNotification('Please select an answer first!', 'warning');
            return;
        }

        let isCorrect = false;
        let correctAnswer = null;
        let correctAnswerText = '';
        let explanation = '';

        if (question.questionType === 'MCQ') {
            isCorrect = selectedAnswer == 1;
            correctAnswer = 1;
            const correctOption = question.options.find(opt => opt.id == 1);
            correctAnswerText = correctOption ? correctOption.optionText : 'Option 1';
            explanation = isCorrect ? 'Great job! You selected the correct answer.' : 'Remember to review the material.';
        } else if (question.questionType === 'TRUE_FALSE') {
            isCorrect = selectedAnswer === 'true';
            correctAnswer = 'true';
            correctAnswerText = 'True';
            explanation = isCorrect ? 'Correct! The statement is true.' : 'The correct answer is True.';
        }

        questionResults[questionId] = {
            isCorrect: isCorrect,
            correctAnswer: correctAnswer,
            correctAnswerText: correctAnswerText,
            explanation: explanation,
            points: isCorrect ? (question.points || 10) : 0
        };

        const questionContainer = document.getElementById('quizContent');
        if (isCorrect) {
            questionContainer.classList.add('animate__animated', 'animate__tada');
            showNotification('🎉 Correct Answer!', 'success');
        } else {
            questionContainer.classList.add('animate__animated', 'animate__headShake');
            showNotification('❌ Incorrect. Check the correct answer below.', 'error');
        }

        setTimeout(() => {
            questionContainer.classList.remove('animate__animated', 'animate__tada', 'animate__headShake');
        }, 1000);

        setTimeout(() => {
            loadQuestion(currentQuestionIndex);
        }, 500);

    } catch (err) {
        console.error('Failed to check answer:', err);
        showNotification('Failed to check answer: ' + err.message, 'error');
    }
}

function saveOpenEndedAnswer(questionId, answer) {
    userAnswers[questionId] = answer;
    updateQuizProgress();
}

function updateQuizProgress() {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = quizQuestions.length;
    const percentage = (answeredCount / totalQuestions) * 100;

    let progressBar = document.getElementById('quizProgressBar');
    if (!progressBar) {
        const timerElement = document.getElementById('quizTimer');
        progressBar = document.createElement('div');
        progressBar.id = 'quizProgressBar';
        progressBar.className = 'mt-2';
        progressBar.innerHTML = `
            <div class="d-flex justify-content-between small mb-1">
                <span>Progress: ${answeredCount}/${totalQuestions}</span>
                <span>${Math.round(percentage)}%</span>
            </div>
            <div class="progress" style="height: 5px;">
                <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
            </div>
        `;
        timerElement.parentNode.insertBefore(progressBar, timerElement.nextSibling);
    } else {
        progressBar.innerHTML = `
            <div class="d-flex justify-content-between small mb-1">
                <span>Progress: ${answeredCount}/${totalQuestions}</span>
                <span>${Math.round(percentage)}%</span>
            </div>
            <div class="progress" style="height: 5px;">
                <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
            </div>
        `;
    }
}

function startQuizTimer() {
    const timerElement = document.getElementById('quizTimer');

    if (quizTimer) {
        clearInterval(quizTimer);
    }

    quizTimer = setInterval(() => {
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            timeUp();
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        timerElement.className = 'text-white fw-bold';
        if (timeLeft <= 300) {
            timerElement.classList.add('text-danger');
        } else if (timeLeft <= 600) {
            timerElement.classList.add('text-warning');
        } else {
            timerElement.classList.add('text-success');
        }
    }, 1000);
}

function timeUp() {
    showNotification('Time is up! Submitting your quiz...', 'warning');
    submitQuiz();
}

function loadNextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    }
}

async function submitQuiz() {
    try {
        clearInterval(quizTimer);

        const totalQuestions = quizQuestions.length;
        let correctAnswers = 0;
        let totalPoints = 0;

        Object.keys(questionResults).forEach(questionId => {
            if (questionResults[questionId].isCorrect) {
                correctAnswers++;
                totalPoints += questionResults[questionId].points || 0;
            }
        });

        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
        const passingScore = currentQuiz.passingScore || 70;

        document.getElementById('quizContent').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h4>Calculating your final score...</h4>
                <p class="text-muted">Please wait while we evaluate your answers.</p>
            </div>
        `;

        setTimeout(() => {
            showQuizResult({
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                totalPoints: totalPoints,
                scorePercentage: scorePercentage,
                passed: scorePercentage >= passingScore
            });
        }, 1500);

    } catch (err) {
        console.error('Failed to submit quiz:', err);
        showNotification('Failed to submit quiz: ' + err.message, 'error');
    }
}

function showQuizResult(result) {
    const totalQuestions = result.totalQuestions;
    const correctAnswers = result.correctAnswers;
    const scorePercentage = result.scorePercentage;
    const passingScore = currentQuiz.passingScore || 70;

    let resultIcon = 'fa-trophy';
    let resultClass = 'success';
    let resultColor = 'text-success';
    let message = '🎉 Congratulations! You passed the quiz!';
    let confetti = '';

    if (scorePercentage < passingScore) {
        resultIcon = 'fa-times-circle';
        resultClass = 'fail';
        resultColor = 'text-danger';
        message = '😔 You need more practice. Try again!';
    } else if (scorePercentage < 80) {
        resultIcon = 'fa-exclamation-circle';
        resultClass = 'average';
        resultColor = 'text-warning';
        message = '👍 Good job! You passed the quiz.';
    } else {
        confetti = `
            <div class="confetti-container">
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
            </div>
        `;
    }

    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';

    document.getElementById('quizResult').innerHTML = `
        ${confetti}
        <div class="text-center animate__animated animate__fadeIn">
            <div class="${resultColor} mb-4">
                <i class="fas ${resultIcon} fa-5x"></i>
            </div>
            
            <h1 class="display-1 fw-bold mb-4 ${resultColor} animate__animated animate__bounceIn">${scorePercentage}%</h1>
            
            <h3 class="mb-4">${message}</h3>
            
            <div class="row justify-content-center mb-4">
                <div class="col-md-8">
                    <div class="card animate__animated animate__flipInX">
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-4">
                                    <h5 class="text-primary">${totalQuestions}</h5>
                                    <small class="text-muted">Total</small>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-success">${correctAnswers}</h5>
                                    <small class="text-muted">Correct</small>
                                </div>
                                <div class="col-4">
                                    <h5 class="text-danger">${totalQuestions - correctAnswers}</h5>
                                    <small class="text-muted">Wrong</small>
                                </div>
                            </div>
                            <div class="row text-center mt-3">
                                <div class="col-12">
                                    <h5 class="text-info">${result.totalPoints || 0}</h5>
                                    <small class="text-muted">Total Points</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="alert ${resultClass === 'success' ? 'alert-success' : resultClass === 'average' ? 'alert-warning' : 'alert-danger'} animate__animated animate__slideInUp">
                <i class="fas ${resultIcon} me-2"></i>
                ${scorePercentage >= passingScore ?
            `You passed! Score: ${scorePercentage}% (Minimum: ${passingScore}%)` :
            `You need ${passingScore}% to pass. Your score: ${scorePercentage}%`
        }
            </div>
            
            <div class="mt-4">
                <button class="btn btn-primary me-3 animate__animated animate__pulse animate__infinite" onclick="reviewQuiz()">
                    <i class="fas fa-search me-2"></i>Review Answers
                </button>
                <button class="btn btn-success animate__animated animate__pulse" onclick="closeQuizModal()">
                    <i class="fas fa-check me-2"></i>Finish
                </button>
            </div>
        </div>
    `;

    document.getElementById('submitQuizBtn').style.display = 'none';
    document.getElementById('nextQuestionBtn').style.display = 'none';

    if (scorePercentage >= 90) {
        triggerConfetti();
    }
}

function reviewQuiz() {
    currentQuestionIndex = 0;
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    loadQuestion(currentQuestionIndex);
}

function closeQuizModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
    modal.hide();
    resetQuizState();
}

function exitQuiz() {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
        clearInterval(quizTimer);
        resetQuizState();
        const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
        modal.hide();
    }
}

function resetQuizState() {
    currentQuiz = null;
    quizQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
    questionResults = {};
    timeLeft = 0;

    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }

    document.getElementById('quizContent').innerHTML = '';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';

    document.getElementById('submitQuizBtn').style.display = 'none';
    document.getElementById('nextQuestionBtn').style.display = 'none';
}

// ==========================
// PDF FUNCTIONS
// ==========================
async function loadPDFs(category = '', search = '') {
    try {
        showLoading('pdfList', 'Loading PDF documents...');

        let url = '/student/pdfs';
        const params = new URLSearchParams();

        if (category) params.append('category', category);
        if (search) params.append('search', search);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);

        let pdfs = [];
        if (response && response.data && Array.isArray(response.data)) {
            pdfs = response.data;
        } else if (response && Array.isArray(response)) {
            pdfs = response;
        } else if (response && response.success !== false && response.data) {
            pdfs = Array.isArray(response.data) ? response.data : [response.data];
        }

        renderPDFs(pdfs);

    } catch (err) {
        console.error('Failed to load PDFs:', err);
        document.getElementById('pdfList').innerHTML =
            `<div class="alert alert-danger">Failed to load PDFs: ${err.message}</div>`;
    }
}

function renderPDFs(pdfs) {
    const container = document.getElementById('pdfList');

    if (!pdfs || pdfs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 animate__animated animate__fadeIn">
                <i class="fas fa-file-pdf fa-4x text-muted mb-3"></i>
                <h4>No PDFs Available</h4>
                <p class="text-muted">No PDFs have been uploaded by teachers yet.</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-0"><i class="fas fa-file-pdf me-2"></i>Study Materials</h5>
                                <p class="text-muted mb-0">Total: ${pdfs.length} PDFs from teachers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
    `;

    pdfs.forEach((pdf, index) => {
        const sizeMB = pdf.fileSize ? (pdf.fileSize / 1024 / 1024).toFixed(2) : 'N/A';
        const views = pdf.viewCount || 0;
        const downloads = pdf.downloadCount || 0;
        const uploadDate = pdf.uploadDate ? new Date(pdf.uploadDate).toLocaleDateString() : 'N/A';
        const uploader = pdf.uploaderName || 'Teacher';

        html += `
            <div class="col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp" 
                 style="animation-delay: ${index * 0.1}s">
                <div class="card h-100 pdf-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold text-truncate" style="max-width: 200px;" 
                                title="${escapeHtml(pdf.title)}">
                                ${escapeHtml(pdf.title)}
                            </h5>
                            <span class="badge bg-danger">PDF</span>
                        </div>
                        
                        ${pdf.description ? `
                        <p class="card-text text-muted mb-2" style="font-size: 0.9rem; height: 40px; overflow: hidden;">
                            ${escapeHtml(pdf.description)}
                        </p>
                        ` : ''}
                        
                        <div class="pdf-meta mb-3">
                            <div class="small text-muted mb-1">
                                <i class="fas fa-folder me-1"></i> ${pdf.category || 'Uncategorized'}
                            </div>
                            <div class="small text-muted mb-1">
                                <i class="fas fa-user-tie me-1"></i> ${uploader}
                            </div>
                            <div class="small text-muted mb-1">
                                <i class="fas fa-hdd me-1"></i> ${sizeMB} MB
                            </div>
                            <div class="small text-muted mb-1">
                                <i class="fas fa-eye me-1"></i> ${views} views
                            </div>
                            <div class="small text-muted mb-1">
                                <i class="fas fa-download me-1"></i> ${downloads} downloads
                            </div>
                            <div class="small text-muted">
                                <i class="fas fa-calendar me-1"></i> ${uploadDate}
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm flex-fill" 
                                    onclick="openPDFViewer(${pdf.id}, '${escapeHtml(pdf.title)}')">
                                <i class="fas fa-eye me-1"></i>View PDF
                            </button>
                            <button class="btn btn-outline-success btn-sm" 
                                    onclick="downloadPDF(${pdf.id})">
                                <i class="fas fa-download me-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

async function downloadPDF(pdfId) {
    try {
        showNotification('Downloading PDF...', 'info');

        const token = api.token;
        const response = await fetch(`/api/student/pdfs/${pdfId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${pdfId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification('PDF download started!', 'success');

    } catch (err) {
        console.error('Failed to download PDF:', err);
        showNotification('Failed to download PDF: ' + err.message, 'error');
    }
}

function openPDFViewer(pdfId, title) {
    currentPDFId = pdfId;
    currentPDFTitle = title;

    if (!document.getElementById('pdfViewerModal')) {
        createPDFViewerModal();
    }

    const modal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
    modal.show();

    setTimeout(() => {
        loadStudentInfo();
    }, 100);

    loadPDFForViewer(pdfId, title);
}

// ==========================
// PDF VIEWER FUNCTIONS
// ==========================
function createPDFViewerModal() {
    const modalHTML = `
        <div class="modal fade" id="pdfViewerModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content animate__animated animate__fadeIn">
                    <div class="modal-header bg-primary text-white">
                        <div class="d-flex align-items-center w-100">
                            <div class="flex-grow-1">
                                <h5 class="modal-title mb-0">
                                    <i class="fas fa-file-pdf me-2"></i>
                                    <span id="pdfViewerTitle">PDF Viewer</span>
                                </h5>
                                <small class="text-light">Viewing PDF in browser</small>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-light btn-sm" onclick="askQuestionAboutPDF()" 
                                        title="Ask a question about this PDF">
                                    <i class="fas fa-question me-1"></i>Ask
                                </button>
                                <button type="button" class="btn btn-warning btn-sm" onclick="explainCurrentPDF()"
                                        title="Get AI explanation">
                                    <i class="fas fa-robot me-1"></i>Explain
                                </button>
                                <button type="button" class="btn btn-success btn-sm" onclick="downloadCurrentPDF()"
                                        title="Download PDF">
                                    <i class="fas fa-download me-1"></i>
                                </button>
                                <button type="button" class="btn btn-light btn-sm" onclick="openInNewTab()"
                                        title="Open in new tab">
                                    <i class="fas fa-external-link-alt me-1"></i>
                                </button>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-body p-0" style="background: #2c3e50;">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-8 p-0" style="background: #34495e;">
                                    <div id="pdfDisplay" class="p-3" style="min-height: 600px;">
                                        <div class="text-center text-light py-5">
                                            <div class="loader" style="width: 60px; height: 60px; border-width: 5px;"></div>
                                            <h4 class="mt-3">Loading PDF Viewer...</h4>
                                            <p class="text-muted">Please wait</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-4 p-0" style="background: #ecf0f1;">
                                    <div class="h-100 d-flex flex-column">
                                        <div class="p-3 border-bottom">
                                            <h6><i class="fas fa-info-circle me-2 text-primary"></i>PDF Information</h6>
                                            <div id="pdfInfoContent" class="small">
                                                <div class="mb-2">
                                                    <strong>Title:</strong> <span id="pdfInfoTitle">Loading...</span>
                                                </div>
                                                <div class="mb-2">
                                                    <strong>Category:</strong> <span id="pdfInfoCategory">Loading...</span>
                                                </div>
                                                <div class="mb-2">
                                                    <strong>Size:</strong> <span id="pdfInfoSize">Loading...</span>
                                                </div>
                                                <div class="mb-2">
                                                    <strong>Upload Date:</strong> <span id="pdfInfoDate">Loading...</span>
                                                </div>
                                                <div>
                                                    <strong>Views:</strong> <span id="pdfInfoViews">0</span> | 
                                                    <strong>Downloads:</strong> <span id="pdfInfoDownloads">0</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 border-bottom">
                                            <h6><i class="fas fa-user-graduate me-2 text-success"></i>Student Information</h6>
                                            <div id="studentInfoContent" class="small">
                                                <div class="mb-2">
                                                    <strong>Name:</strong> <span id="studentName">Loading...</span>
                                                </div>
                                                <div class="mb-2">
                                                    <strong>Branch:</strong> <span id="studentBranch">Loading...</span>
                                                </div>
                                                <div>
                                                    <strong>Access Time:</strong> <span id="accessTime">${new Date().toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="p-3 border-bottom">
                                            <h6><i class="fas fa-bolt me-2 text-warning"></i>Quick Actions</h6>
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-outline-primary btn-sm" onclick="sharePDF()">
                                                    <i class="fas fa-share-alt me-2"></i>Share PDF
                                                </button>
                                                <button class="btn btn-outline-info btn-sm" onclick="searchInPDF()">
                                                    <i class="fas fa-search me-2"></i>Search PDF
                                                </button>
                                                <button class="btn btn-outline-success btn-sm" onclick="printCurrentPDF()">
                                                    <i class="fas fa-print me-2"></i>Print PDF
                                                </button>
                                                <button class="btn btn-outline-warning btn-sm" onclick="addBookmark()">
                                                    <i class="fas fa-bookmark me-2"></i>Bookmark
                                                </button>
                                            </div>
                                        </div>

                                        <div class="p-3">
                                            <div class="alert alert-info mb-0">
                                                <h6><i class="fas fa-external-link-alt me-2"></i>Need Full Features?</h6>
                                                <p class="small mb-2">Some PDF features work better in a dedicated tab.</p>
                                                <button class="btn btn-outline-primary btn-sm w-100" onclick="openInNewTab()">
                                                    <i class="fas fa-external-link-alt me-2"></i>Open in New Tab
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer" style="background: #2c3e50; border-color: #34495e;">
                        <div class="d-flex justify-content-between w-100 align-items-center">
                            <div class="text-light">
                                <i class="fas fa-file-pdf me-2"></i>
                                <span id="currentPDFStatus">Viewing in modal</span>
                            </div>
                            <div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="rotatePDF()"
                                        title="Rotate PDF (if supported)">
                                    <i class="fas fa-sync-alt"></i> Rotate
                                </button>
                                <button type="button" class="btn btn-light btn-sm ms-3" data-bs-dismiss="modal">
                                    Close Viewer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            #pdfViewerModal .modal-xl {
                max-width: 95%;
                max-height: 90vh;
            }
            
            .loader {
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    const existingModal = document.getElementById('pdfViewerModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function loadPDFForViewer(pdfId, title) {
    try {
        document.getElementById('pdfViewerTitle').textContent = title;
        document.getElementById('pdfInfoTitle').textContent = title;

        document.getElementById('pdfDisplay').innerHTML = `
            <div class="text-center text-light animate__animated animate__fadeIn">
                <div class="loader" style="width: 60px; height: 60px; border-width: 5px;"></div>
                <h4 class="mt-3">Loading PDF...</h4>
                <p class="text-muted">Preparing PDF viewer</p>
            </div>
        `;

        const response = await api.get('/student/pdfs');
        console.log('PDF API response:', response);

        let pdfs = [];
        if (response && response.data && Array.isArray(response.data)) {
            pdfs = response.data;
        } else if (response && Array.isArray(response)) {
            pdfs = response;
        }

        const pdf = pdfs.find(p => p.id === pdfId);

        if (pdf) {
            document.getElementById('pdfInfoCategory').textContent = pdf.category || 'Uncategorized';
            document.getElementById('pdfInfoSize').textContent = pdf.fileSize ?
                (pdf.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
            document.getElementById('pdfInfoDate').textContent = pdf.uploadDate ?
                new Date(pdf.uploadDate).toLocaleDateString() : 'N/A';
            document.getElementById('pdfInfoViews').textContent = pdf.viewCount || 0;
            document.getElementById('pdfInfoDownloads').textContent = pdf.downloadCount || 0;
        }

        await loadPDFWithPDFJS(pdfId, title);

    } catch (err) {
        console.error('Failed to load PDF for viewer:', err);
        document.getElementById('pdfDisplay').innerHTML = `
            <div class="text-center text-light">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Failed to load PDF</h4>
                <p class="text-muted">${err.message}</p>
                <button class="btn btn-primary mt-3" onclick="loadPDFForViewer(${pdfId}, '${title}')">
                    <i class="fas fa-redo me-2"></i>Retry
                </button>
                <button class="btn btn-secondary mt-3 ms-2" onclick="showMockPDF(${pdfId}, '${title}')">
                    <i class="fas fa-eye me-2"></i>Show Mock Preview
                </button>
            </div>
        `;
    }
}

async function loadPDFWithPDFJS(pdfId, title) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const TOKEN = user?.token;
        
        if (!TOKEN) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch(`http://localhost:8080/api/student/pdfs/${pdfId}/preview`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('Download successful, blob size:', blob.size);
        
        return await processPDFBlob(blob, pdfId, title, TOKEN);
        
    } catch (err) {
        console.error('PDF loading failed:', err);
        
        if (err.message.includes('403') || err.message.includes('Access')) {
            throw new Error('You can only access PDFs that you have uploaded.');
        }
        throw err;
    }
}

// Update the processPDFBlob function to include text extraction
async function processPDFBlob(blob, pdfId, pdfTitle) {
    try {
        const pdfUrl = URL.createObjectURL(blob);
        window.currentPDFBlobUrl = pdfUrl;
        const pdfDisplay = document.getElementById('pdfDisplay');
        
        // Clear and set up the display
        pdfDisplay.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'pdf-container h-100';
        
        // Create iframe container
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'pdf-iframe-container';
        iframeContainer.style.cssText = 'width: 100%; height: 70vh;';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'pdfIframe';
        iframe.src = pdfUrl;
        iframe.title = pdfTitle;
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        iframe.allow = 'fullscreen';
        
        iframeContainer.appendChild(iframe);
        container.appendChild(iframeContainer);
        
        // Create SIMPLIFIED controls (no extract button, no text extraction status)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'pdf-controls mt-3 p-3 bg-dark rounded';
        controlsContainer.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-6 mb-2 mb-md-0">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-light me-2" onclick="downloadCurrentPDF()">
                            <i class="fas fa-download me-1"></i> Download
                        </button>
                        <button class="btn btn-sm btn-light me-2" onclick="printCurrentPDF()">
                            <i class="fas fa-print me-1"></i> Print
                        </button>
                        <button class="btn btn-sm btn-light" onclick="openInNewTab()">
                            <i class="fas fa-external-link-alt me-1"></i> New Tab
                        </button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex align-items-center justify-content-md-end">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="fullscreenSwitch" 
                                   onchange="toggleFullscreenIframe()">
                            <label class="form-check-label text-light" for="fullscreenSwitch">
                                Fullscreen
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(controlsContainer);
        pdfDisplay.appendChild(container);
        
        // Initialize PDF.js for text extraction (silently, for explainSimply to use later)
        try {
            const arrayBuffer = await blob.arrayBuffer();
            pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log(`PDF loaded with ${pdfDoc.numPages} pages`);
            
            // Extract text from first page to have something ready
            if (pdfDoc.numPages > 0) {
                await extractTextFromPDFPage(1);
            }
        } catch (err) {
            console.log('PDF.js initialization for text extraction:', err.message);
            // Not critical - we'll handle it in explainSimply
        }
        
        // Update PDF info
        await updatePDFInfo(pdfId);
        
        console.log('PDF loaded successfully');
        return true;
        
    } catch (error) {
        console.error('Error processing PDF blob:', error);
        
        const pdfDisplay = document.getElementById('pdfDisplay');
        pdfDisplay.innerHTML = `
            <div class="text-center text-light animate__animated animate__fadeIn">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>PDF Preview Unavailable</h4>
                <p class="text-muted">${error.message || 'The PDF could not be displayed.'}</p>
                <div class="mt-4">
                    <button class="btn btn-success me-2" onclick="downloadCurrentPDF()">
                        <i class="fas fa-download me-2"></i> Download PDF
                    </button>
                    <button class="btn btn-primary" onclick="openInNewTab()">
                        <i class="fas fa-external-link-alt me-2"></i> Open in New Tab
                    </button>
                </div>
            </div>
        `;
        
        throw error;
    }
}

// ==========================
// PDF FUNCTIONS - FIXED VERSION
// ==========================

async function initializePDFJSForTextExtraction(blob) {
    try {
        // Initialize PDF.js for text extraction
        const arrayBuffer = await blob.arrayBuffer();
        pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        console.log(`PDF loaded with ${pdfDoc.numPages} pages for text extraction`);
        
        // Extract text from first few pages
        await extractTextFromPDFPage(1);
        
        // Safely update text extraction status
        updateTextExtractionStatus('success');
        
    } catch (err) {
        console.error('PDF.js initialization failed:', err);
        updateTextExtractionStatus('failed');
    }
}

function updateTextExtractionStatus(status) {
    // Create or update the status element
    let statusElement = document.getElementById('textExtractionStatus');
    
    if (!statusElement) {
        // Create the status element if it doesn't exist
        const pdfDisplay = document.getElementById('pdfDisplay');
        if (pdfDisplay) {
            statusElement = document.createElement('div');
            statusElement.id = 'textExtractionStatus';
            statusElement.className = 'text-extraction-status';
            statusElement.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
            `;
            pdfDisplay.appendChild(statusElement);
        }
    }
    
    if (statusElement) {
        switch(status) {
            case 'success':
                statusElement.textContent = extractedPDFText && extractedPDFText.length > 100 
                    ? 'Ready for AI' 
                    : 'Limited text';
                statusElement.style.backgroundColor = extractedPDFText && extractedPDFText.length > 100 
                    ? 'rgba(40, 167, 69, 0.8)' 
                    : 'rgba(255, 193, 7, 0.8)';
                break;
            case 'failed':
                statusElement.textContent = 'Text extraction failed';
                statusElement.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
                break;
            case 'extracting':
                statusElement.textContent = 'Extracting text...';
                statusElement.style.backgroundColor = 'rgba(0, 123, 255, 0.8)';
                break;
            default:
                statusElement.textContent = 'Ready';
                statusElement.style.backgroundColor = 'rgba(40, 167, 69, 0.8)';
        }
    }
}

async function processPDFBlob(blob, pdfId, pdfTitle) {
    try {
        const pdfUrl = URL.createObjectURL(blob);
        window.currentPDFBlobUrl = pdfUrl;
        const pdfDisplay = document.getElementById('pdfDisplay');
        
        // Clear previous content
        pdfDisplay.innerHTML = '';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'pdf-container h-100';
        
        // Create iframe container
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'pdf-iframe-container';
        iframeContainer.style.cssText = 'width: 100%; height: 70vh;';
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'pdfIframe';
        iframe.src = pdfUrl;
        iframe.title = pdfTitle;
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        iframe.allow = 'fullscreen';
        
        iframeContainer.appendChild(iframe);
        container.appendChild(iframeContainer);
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'pdf-controls mt-3 p-3 bg-dark rounded';
        
        // Create controls HTML
        controlsContainer.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-6 mb-2 mb-md-0">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-light me-2" onclick="downloadCurrentPDF()">
                            <i class="fas fa-download me-1"></i> Download
                        </button>
                        <button class="btn btn-sm btn-light me-2" onclick="printCurrentPDF()">
                            <i class="fas fa-print me-1"></i> Print
                        </button>
                        <button class="btn btn-sm btn-light me-2" onclick="openInNewTab()">
                            <i class="fas fa-external-link-alt me-1"></i> New Tab
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="extractAllPDFText()" 
                                title="Extract all text for AI analysis">
                            <i class="fas fa-robot me-1"></i> Extract Text
                        </button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex align-items-center justify-content-md-end">
                        <small class="text-light me-3">Text extraction: <span id="textExtractionStatus">Initializing...</span></small>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="fullscreenSwitch" 
                                   onchange="toggleFullscreenIframe()">
                            <label class="form-check-label text-light" for="fullscreenSwitch">
                                Fullscreen
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(controlsContainer);
        pdfDisplay.appendChild(container);
        
        // Initialize PDF.js for text extraction
        updateTextExtractionStatus('extracting');
        await initializePDFJSForTextExtraction(blob);
        
        // Update PDF info
        await updatePDFInfo(pdfId);
        
        console.log('PDF loaded successfully');
        return true;
        
    } catch (error) {
        console.error('Error processing PDF blob:', error);
        
        const pdfDisplay = document.getElementById('pdfDisplay');
        pdfDisplay.innerHTML = `
            <div class="text-center text-light animate__animated animate__fadeIn">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4>PDF Preview Unavailable</h4>
                <p class="text-muted">${error.message || 'The PDF could not be displayed.'}</p>
                <div class="mt-4">
                    <button class="btn btn-success me-2" onclick="downloadCurrentPDF()">
                        <i class="fas fa-download me-2"></i> Download PDF
                    </button>
                    <button class="btn btn-primary" onclick="openInNewTab()">
                        <i class="fas fa-external-link-alt me-2"></i> Open in New Tab
                    </button>
                </div>
            </div>
        `;
        
        throw error;
    }
}

async function extractAllPDFText() {
    try {
        showNotification('Extracting text from all PDF pages...', 'info');
        
        if (!pdfDoc) {
            throw new Error('PDF document not loaded');
        }
        
        updateTextExtractionStatus('extracting');
        
        let allText = '';
        const totalPages = pdfDoc.numPages;
        
        // Limit to first 10 pages to avoid performance issues
        const maxPages = Math.min(totalPages, 10);
        
        for (let i = 1; i <= maxPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                
                if (textContent && textContent.items) {
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    allText += pageText + '\n\n';
                    
                    // Update progress
                    const progress = Math.round((i / maxPages) * 100);
                    updateTextExtractionStatus(`Extracting... ${progress}% (${i}/${maxPages})`);
                }
            } catch (pageErr) {
                console.error(`Error extracting text from page ${i}:`, pageErr);
            }
        }
        
        extractedPDFText = allText;
        
        if (extractedPDFText && extractedPDFText.trim().length > 100) {
            updateTextExtractionStatus('success');
            showNotification(`Extracted ${extractedPDFText.length} characters from PDF`, 'success');
            
            // Show preview
            const preview = extractedPDFText.substring(0, 300) + '...';
            Swal.fire({
                title: 'Text Extraction Complete',
                html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
                       <h6>Extracted ${extractedPDFText.length} characters</h6>
                       <p><strong>Preview:</strong></p>
                       <pre style="white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                       ${escapeHtml(preview)}
                       </pre>
                       </div>`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Use for AI Explanation',
                cancelButtonText: 'Close'
            }).then((result) => {
                if (result.isConfirmed) {
                    explainCurrentPDF();
                }
            });
        } else {
            showNotification('Could not extract meaningful text from PDF', 'warning');
            updateTextExtractionStatus('failed');
        }
        
    } catch (err) {
        console.error('Failed to extract all PDF text:', err);
        showNotification('Failed to extract text: ' + err.message, 'error');
        updateTextExtractionStatus('failed');
    }
}

// Simplified version of loadPDFForViewer to avoid recursion
async function loadPDFForViewer(pdfId, title) {
    try {
        currentPDFId = pdfId;
        currentPDFTitle = title;

        // Show modal first
        const modal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
        modal.show();
        
        // Load student info
        setTimeout(() => {
            loadStudentInfo();
        }, 100);

        // Clear previous text
        extractedPDFText = '';
        
        // Update UI
        document.getElementById('pdfViewerTitle').textContent = title;
        document.getElementById('pdfInfoTitle').textContent = title;

        // Show loading state
        document.getElementById('pdfDisplay').innerHTML = `
            <div class="text-center text-light animate__animated animate__fadeIn">
                <div class="loader" style="width: 60px; height: 60px; border-width: 5px;"></div>
                <h4 class="mt-3">Loading PDF...</h4>
                <p class="text-muted">Preparing PDF viewer</p>
            </div>
        `;

        // Get PDF metadata
        const response = await api.get('/student/pdfs');
        
        // Extract PDFs array
        let pdfs = [];
        if (response && response.data && Array.isArray(response.data)) {
            pdfs = response.data;
        } else if (response && Array.isArray(response)) {
            pdfs = response;
        }

        // Find the specific PDF
        const pdf = pdfs.find(p => p.id == pdfId); // Use loose comparison for safety

        if (pdf) {
            document.getElementById('pdfInfoCategory').textContent = pdf.category || 'Uncategorized';
            document.getElementById('pdfInfoSize').textContent = pdf.fileSize ?
                (pdf.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
            document.getElementById('pdfInfoDate').textContent = pdf.uploadDate ?
                new Date(pdf.uploadDate).toLocaleDateString() : 'N/A';
            document.getElementById('pdfInfoViews').textContent = pdf.viewCount || 0;
            document.getElementById('pdfInfoDownloads').textContent = pdf.downloadCount || 0;
        }

        // Load actual PDF
        const user = JSON.parse(localStorage.getItem('user'));
        const TOKEN = user?.token;
        
        if (!TOKEN) {
            throw new Error('No authentication token');
        }
        
        const responseBlob = await fetch(`http://localhost:8080/api/student/pdfs/${pdfId}/preview`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        if (!responseBlob.ok) {
            throw new Error(`Download failed: ${responseBlob.status} ${responseBlob.statusText}`);
        }
        
        const blob = await responseBlob.blob();
        
        // Process and display the PDF
        await processPDFBlob(blob, pdfId, title, TOKEN);

    } catch (err) {
        console.error('Failed to load PDF for viewer:', err);
        
        // User-friendly error message
        let errorMessage = err.message;
        if (err.message.includes('403') || err.message.includes('Access')) {
            errorMessage = 'You do not have permission to access this PDF.';
        } else if (err.message.includes('404')) {
            errorMessage = 'PDF not found.';
        } else if (err.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
        }
        
        document.getElementById('pdfDisplay').innerHTML = `
            <div class="text-center text-light">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>Failed to load PDF</h4>
                <p class="text-muted">${errorMessage}</p>
                <button class="btn btn-primary mt-3" onclick="retryPDFLoad(${pdfId}, '${title}')">
                    <i class="fas fa-redo me-2"></i>Retry
                </button>
                <button class="btn btn-secondary mt-3 ms-2" onclick="closePDFViewer()">
                    <i class="fas fa-times me-2"></i>Close
                </button>
            </div>
        `;
    }
}

// Helper function for retry
function retryPDFLoad(pdfId, title) {
    loadPDFForViewer(pdfId, title);
}

// Helper function to close PDF viewer
function closePDFViewer() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('pdfViewerModal'));
    modal.hide();
}

// Also add this utility function to your student.js file if not already present:
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function extractAllPDFText() {
    try {
        showNotification('Extracting text from all PDF pages...', 'info');
        
        if (!pdfDoc) {
            throw new Error('PDF document not loaded');
        }
        
        let allText = '';
        const totalPages = pdfDoc.numPages;
        
        // Limit to first 20 pages to avoid performance issues
        const maxPages = Math.min(totalPages, 20);
        
        for (let i = 1; i <= maxPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                
                if (textContent && textContent.items) {
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    allText += pageText + '\n\n';
                    
                    // Update progress
                    const progress = Math.round((i / maxPages) * 100);
                    document.getElementById('textExtractionStatus').textContent = 
                        `Extracting... ${progress}% (${i}/${maxPages})`;
                }
            } catch (pageErr) {
                console.error(`Error extracting text from page ${i}:`, pageErr);
            }
        }
        
        extractedPDFText = allText;
        
        if (extractedPDFText && extractedPDFText.trim().length > 100) {
            document.getElementById('textExtractionStatus').textContent = 
                `${extractedPDFText.length} chars ready`;
            showNotification(`Extracted ${extractedPDFText.length} characters from PDF`, 'success');
            
            // Show preview
            const preview = extractedPDFText.substring(0, 300) + '...';
            Swal.fire({
                title: 'Text Extraction Complete',
                html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
                       <h6>Extracted ${extractedPDFText.length} characters</h6>
                       <p><strong>Preview:</strong></p>
                       <pre style="white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                       ${escapeHtml(preview)}
                       </pre>
                       </div>`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Use for AI Explanation',
                cancelButtonText: 'Close'
            }).then((result) => {
                if (result.isConfirmed) {
                    explainCurrentPDF();
                }
            });
        } else {
            showNotification('Could not extract meaningful text from PDF', 'warning');
            document.getElementById('textExtractionStatus').textContent = 'No text found';
        }
        
    } catch (err) {
        console.error('Failed to extract all PDF text:', err);
        showNotification('Failed to extract text: ' + err.message, 'error');
    }
}

// ==========================
// PDF VIEWER HELPER FUNCTIONS
// ==========================
function openInNewTab() {
    if (window.currentPDFBlobUrl) {
        window.open(window.currentPDFBlobUrl, '_blank');
        showNotification('Opening PDF in new tab...', 'info');
    }
}

function downloadCurrentPDF() {
    if (window.currentPDFBlobUrl) {
        const pdfTitle = document.getElementById('pdfViewerTitle').textContent;
        const a = document.createElement('a');
        a.href = window.currentPDFBlobUrl;
        a.download = pdfTitle + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('PDF download started!', 'success');
    }
}

function printCurrentPDF() {
    const pdfIframe = document.getElementById('pdfIframe');
    if (pdfIframe && pdfIframe.contentWindow) {
        pdfIframe.contentWindow.print();
    } else {
        showNotification('Printing not available for this PDF', 'warning');
    }
}

function toggleFullscreenIframe() {
    const pdfIframe = document.getElementById('pdfIframe');
    const container = document.querySelector('.pdf-iframe-container');
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
        document.getElementById('fullscreenSwitch').checked = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        document.getElementById('fullscreenSwitch').checked = false;
    }
}

async function updatePDFInfo(pdfId) {
    try {
        const response = await api.get('/student/pdfs');
        const pdfs = response.data || response;
        
        if (Array.isArray(pdfs)) {
            const pdf = pdfs.find(p => p.id === pdfId);
            if (pdf) {
                document.getElementById('pdfInfoTitle').textContent = pdf.title;
                document.getElementById('pdfInfoCategory').textContent = pdf.category || 'Uncategorized';
                document.getElementById('pdfInfoSize').textContent = pdf.fileSize ? 
                    (pdf.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A';
                document.getElementById('pdfInfoDate').textContent = pdf.uploadDate ? 
                    new Date(pdf.uploadDate).toLocaleDateString() : 'N/A';
                document.getElementById('pdfInfoViews').textContent = pdf.viewCount || 0;
                document.getElementById('pdfInfoDownloads').textContent = pdf.downloadCount || 0;
            }
        }
    } catch (error) {
        console.error('Error updating PDF info:', error);
    }
}

async function loadStudentInfo() {
    try {
        if (dashboardData) {
            document.getElementById('studentName').textContent = 
                (dashboardData.firstName || '') + ' ' + (dashboardData.lastName || '') || dashboardData.username || 'Student';
            document.getElementById('studentBranch').textContent = 
                dashboardData.branch || 'Not specified';
        } else {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                document.getElementById('studentName').textContent = 
                    user.firstName + ' ' + user.lastName || user.username;
                document.getElementById('studentBranch').textContent = 
                    user.branch || 'Not specified';
            } else {
                document.getElementById('studentName').textContent = 'Student';
                document.getElementById('studentBranch').textContent = 'Not specified';
            }
        }
    } catch (error) {
        console.error('Error loading student info:', error);
    }
}

function askQuestionAboutPDF() {
    const question = prompt('What would you like to ask about this PDF?');
    if (question) {
        showNotification('Question submitted: ' + question, 'info');
    }
}

function sharePDF() {
    if (window.currentPDFBlobUrl) {
        navigator.clipboard.writeText('PDF shared from ConceptBridge');
        showNotification('Share link copied to clipboard!', 'success');
    }
}

function searchInPDF() {
    showNotification('Use Ctrl+F in the PDF viewer to search', 'info');
}

function addBookmark() {
    const pageTitle = document.getElementById('pdfViewerTitle').textContent;
    showNotification(`Bookmarked: ${pageTitle}`, 'success');
}

function rotatePDF() {
    showNotification('PDF rotation depends on browser PDF viewer', 'info');
}

async function explainCurrentPDF() {
    try {
        showNotification('Extracting content from PDF for AI explanation...', 'info');
        
        // First, try to extract text from the current PDF
        await extractCurrentPDFContent();
        
        if (!extractedPDFText || extractedPDFText.trim().length < 50) {
            showNotification('Could not extract enough text from PDF. Using PDF title for explanation.', 'warning');
            extractedPDFText = `Explain the PDF titled "${currentPDFTitle}" in simple terms for a student.`;
        }
        
        // Call the AI explanation
        await callAIExplanation({
            content: extractedPDFText,
            pdfId: currentPDFId,
            title: currentPDFTitle,
            language: 'English',
            complexity: 'simple'
        });
        
    } catch (err) {
        console.error('Failed to explain PDF:', err);
        showNotification('Failed to generate explanation: ' + err.message, 'error');
    }
}



// Function to extract text from current PDF page
async function extractTextFromPDFPage(pageNumber) {
    if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        console.warn(`Invalid page number or PDF not loaded: page ${pageNumber}`);
        return '';
    }
    
    try {
        console.log(`Extracting text from page ${pageNumber}...`);
        
        const page = await pdfDoc.getPage(pageNumber);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items) {
            extractedPDFText = textContent.items
                .map(item => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log(`Extracted ${extractedPDFText.length} characters from page ${pageNumber}`);
            currentPageText = extractedPDFText; // Store for current page
            
            // Update UI to show current page extraction
            updateTextExtractionStatus(`Page ${pageNumber}: ${extractedPDFText.length} chars`);
            
            return extractedPDFText;
        }
    } catch (err) {
        console.error(`Error extracting text from page ${pageNumber}:`, err);
        throw err;
    }
    
    return '';
}

// Function to extract text from PDF iframe
async function extractTextFromPDFIframe() {
    try {
        const pdfIframe = document.getElementById('pdfIframe');
        if (pdfIframe && pdfIframe.contentWindow) {
            console.log('Attempting to extract text from iframe...');
            
            // This is a synchronous attempt - may not work due to CORS
            const iframeDoc = pdfIframe.contentDocument || pdfIframe.contentWindow.document;
            if (iframeDoc) {
                const iframeText = iframeDoc.body.innerText || iframeDoc.body.textContent;
                if (iframeText && iframeText.trim().length > 50) {
                    console.log('Extracted text from iframe:', iframeText.substring(0, 200) + '...');
                    return iframeText;
                }
            }
        }
    } catch (err) {
        console.log('Could not access iframe content due to security restrictions:', err);
    }
    return '';
}

// Function to get selected text
function getSelectedText() {
    let selectedText = '';
    
    // Try to get text from iframe selection
    try {
        const pdfIframe = document.getElementById('pdfIframe');
        if (pdfIframe && pdfIframe.contentWindow) {
            const iframeWindow = pdfIframe.contentWindow;
            if (iframeWindow.getSelection) {
                selectedText = iframeWindow.getSelection().toString();
            }
        }
    } catch (err) {
        console.log('Cannot access iframe selection:', err);
    }
    
    // Fallback to main window selection
    if (!selectedText && window.getSelection) {
        selectedText = window.getSelection().toString();
    }
    
    if (selectedText && selectedText.trim().length > 50) {
        console.log(`Got selected text: ${selectedText.substring(0, 200)}...`);
        return selectedText;
    }
    
    return '';
}

// Function to extract content from current page
function extractCurrentPageContent() {
    let content = '';
    
    // Get content from current active section
    const activeSection = document.querySelector('.content-section[style*="block"]');
    if (activeSection) {
        // Extract text content, remove scripts and styles
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = activeSection.innerHTML;

        // Remove unwanted elements
        tempDiv.querySelectorAll('script, style, button, nav, .modal, .alert, .btn').forEach(el => el.remove());

        // Get clean text
        content = tempDiv.textContent
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000); // Limit content length
    }

    return content || document.body.textContent.substring(0, 3000);
}

// Enhanced AI explanation function with page context
async function callAIExplanation(request) {
    try {
        // Show modal with loading state
        const modal = new bootstrap.Modal(document.getElementById('explainModal'));
        modal.show();
        
        // Update loading message with page context
        let loadingMessage = 'Generating Simplified Explanation...';
        if (request.pageNumber) {
            loadingMessage = `Generating explanation for Page ${request.pageNumber}...`;
        }
        
        document.getElementById('explainContent').innerHTML = `
            <div class="text-center py-4">
                <div class="loader" style="margin: 0 auto; width: 50px; height: 50px; border-width: 4px;"></div>
                <h5 class="mt-3">${loadingMessage}</h5>
                <p class="text-muted">Processing: ${request.title || 'Content'}</p>
                <div class="progress mt-3" style="height: 5px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                </div>
            </div>
        `;
        
        // Prepare enhanced prompt with page context
        const enhancedPrompt = prepareAIPrompt(request);
        
        // Call backend AI API
        const response = await api.post('/api/student/ai/explain', {
            ...request,
            content: enhancedPrompt,
            source: 'pdf_page',
            pageNumber: request.pageNumber
        });
        
        // Display result
        showExplanationResult(response.explanation || response.text || 'No explanation available.', request);
        
    } catch (err) {
        console.error('AI call failed:', err);
        
        // Fallback to mock explanation with page context
        const mockExplanation = generateMockExplanation(request);
        showExplanationResult(mockExplanation, request);
        
        // Show error notification
        showNotification('Using offline explanation. AI service unavailable.', 'warning');
    }
}

// Prepare AI prompt with page context
function prepareAIPrompt(request) {
    const { content, pageNumber, title } = request;
    
    let prompt = `Explain the following content in simple terms for a student.\n`;
    
    if (title) {
        prompt += `Document Title: ${title}\n`;
    }
    
    if (pageNumber) {
        prompt += `Page Number: ${pageNumber}\n`;
    }
    
    prompt += `\nContent to explain:\n${content.substring(0, 4000)}\n\n`;
    
    prompt += `Provide a clear, structured explanation with:
1. Main concepts from this specific page
2. Key terms and definitions found here
3. Practical examples if applicable
4. Study tips for this material
5. How this page connects to the overall topic`;

    return prompt;
}

// Enhanced mock explanation with page context
function generateMockExplanation(request) {
    const { content, pageNumber, title } = request;
    const truncatedContent = content.substring(0, 500);
    
    return `
        <h5>AI Explanation ${pageNumber ? `for Page ${pageNumber}` : ''}</h5>
        <p class="text-muted mb-4">${title ? `Document: ${escapeHtml(title)}` : 'Content Explanation'}</p>
        
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> This is a demonstration of AI-powered explanation. In production, this would be generated by an AI service.
        </div>
        
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0"><i class="fas fa-file-alt me-2"></i>Page ${pageNumber || 'Content'} Summary</h6>
            </div>
            <div class="card-body">
                <p>Based on the extracted content (${content.length} characters), this page appears to contain educational material.</p>
                
                <h6 class="mt-3">Key Concepts on This Page:</h6>
                <ul>
                    <li>Important concepts specific to this page</li>
                    <li>Key definitions and terminology</li>
                    <li>Visual elements or diagrams (if any)</li>
                    <li>Learning objectives covered</li>
                </ul>
                
                <h6 class="mt-3">Study Strategy for This Page:</h6>
                <ol>
                    <li>Read through the page carefully</li>
                    <li>Highlight key terms and concepts</li>
                    <li>Create notes in your own words</li>
                    <li>Connect this page's content to previous material</li>
                </ol>
                
                <div class="alert alert-warning mt-3">
                    <h6><i class="fas fa-lightbulb me-2"></i>Learning Tip</h6>
                    <p class="mb-0">To better understand this page, try explaining the concepts to someone else in simple terms.</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0"><i class="fas fa-eye me-2"></i>Content Preview</h6>
            </div>
            <div class="card-body">
                <pre class="bg-light p-3 rounded" style="max-height: 200px; overflow: auto;">${escapeHtml(truncatedContent)}</pre>
            </div>
        </div>
    `;
}

// Enhanced show explanation result with page context
function showExplanationResult(explanation, request) {
    const contentDiv = document.getElementById('explainContent');
    const { pageNumber, title } = request || {};
    
    contentDiv.innerHTML = `
        <div class="animate__animated animate__fadeIn">
            <div class="explanation-header mb-4">
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-robot fa-2x text-primary me-3"></i>
                    <div>
                        <h4 class="mb-0">AI Simplified Explanation</h4>
                        <small class="text-muted">${pageNumber ? `Page ${pageNumber} of ${title || 'Document'}` : 'Content Explanation'}</small>
                    </div>
                </div>
            </div>
            
            <div class="explanation-body">
                <div class="card bg-light border-0 mb-3 animate__animated animate__slideInLeft">
                    <div class="card-body">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-lightbulb text-warning fa-lg me-3"></i>
                            </div>
                            <div class="flex-grow-1">
                                ${formatMarkdown(explanation)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-light border">
                    <h6><i class="fas fa-chart-bar me-2"></i>Explanation Details</h6>
                    <div class="row">
                        ${pageNumber ? `
                        <div class="col-md-4">
                            <small class="text-muted">Page:</small>
                            <div class="fw-bold">${pageNumber}</div>
                        </div>
                        ` : ''}
                        <div class="col-md-4">
                            <small class="text-muted">Source:</small>
                            <div class="fw-bold">${escapeHtml(title || 'Current Content')}</div>
                        </div>
                        <div class="col-md-4">
                            <small class="text-muted">Content Analyzed:</small>
                            <div class="fw-bold">${extractedPDFText ? extractedPDFText.length + ' characters' : 'Current page'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Also update the extractAllPDFText function to track current page
async function extractAllPDFText() {
    try {
        showNotification('Extracting text from all PDF pages...', 'info');
        
        if (!pdfDoc) {
            throw new Error('PDF document not loaded');
        }
        
        updateTextExtractionStatus('extracting');
        
        let allText = '';
        const totalPages = pdfDoc.numPages;
        
        // Limit to first 10 pages to avoid performance issues
        const maxPages = Math.min(totalPages, 10);
        
        for (let i = 1; i <= maxPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                
                if (textContent && textContent.items) {
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    allText += pageText + '\n\n';
                    
                    // Update progress
                    const progress = Math.round((i / maxPages) * 100);
                    updateTextExtractionStatus(`Extracting... ${progress}% (${i}/${maxPages})`);
                    
                    // If this is the current page, store it separately
                    if (i === currentPage) {
                        currentPageText = pageText;
                    }
                }
            } catch (pageErr) {
                console.error(`Error extracting text from page ${i}:`, pageErr);
            }
        }
        
        extractedPDFText = allText;
        
        if (extractedPDFText && extractedPDFText.trim().length > 100) {
            updateTextExtractionStatus('success');
            showNotification(`Extracted ${extractedPDFText.length} characters from PDF`, 'success');
            
            // Store current page text if we have it
            if (currentPage >= 1 && currentPage <= maxPages) {
                // Extract current page separately if not already done
                if (!currentPageText) {
                    await extractTextFromPDFPage(currentPage);
                }
            }
            
            // Show preview
            const preview = extractedPDFText.substring(0, 300) + '...';
            Swal.fire({
                title: 'Text Extraction Complete',
                html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
                       <h6>Extracted ${extractedPDFText.length} characters from ${maxPages} pages</h6>
                       ${currentPageText ? `<p><strong>Current Page (${currentPage}) Preview:</strong></p>
                       <pre style="white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                       ${escapeHtml(currentPageText.substring(0, 200) + '...')}
                       </pre>` : ''}
                       <p><strong>Full Document Preview:</strong></p>
                       <pre style="white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                       ${escapeHtml(preview)}
                       </pre>
                       </div>`,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Explain Current Page',
                cancelButtonText: 'Explain Full Document',
                showDenyButton: true,
                denyButtonText: 'Close'
            }).then((result) => {
                if (result.isConfirmed && currentPageText) {
                    // Explain current page
                    extractedPDFText = currentPageText;
                    explainSimply();
                } else if (result.isDismissed) {
                    // Explain full document
                    explainSimply();
                }
            });
        } else {
            showNotification('Could not extract meaningful text from PDF', 'warning');
            updateTextExtractionStatus('failed');
        }
        
    } catch (err) {
        console.error('Failed to extract all PDF text:', err);
        showNotification('Failed to extract text: ' + err.message, 'error');
        updateTextExtractionStatus('failed');
    }
}

// Also update the renderPDFPage function to track current page text
async function renderPDFPage(pageNum) {
    if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;

    currentPage = pageNum;

    // Update UI
    const pageInput = document.getElementById('pageInput');
    if (pageInput) pageInput.value = pageNum;
    
    const currentPageInfo = document.getElementById('currentPageInfo');
    if (currentPageInfo) currentPageInfo.textContent = `Page: ${pageNum} of ${pdfDoc.numPages}`;
    
    const pdfProgress = document.getElementById('pdfProgress');
    if (pdfProgress) pdfProgress.textContent = `Progress: ${pageNum}/${pdfDoc.numPages}`;

    // Extract and store text from this page
    try {
        await extractTextFromPDFPage(pageNum);
        
        // Update button text to show page context
        const explainBtn = document.querySelector('[onclick="explainCurrentPDF()"]');
        if (explainBtn) {
            explainBtn.innerHTML = `<i class="fas fa-robot me-1"></i>Explain Page ${pageNum}`;
            explainBtn.title = `Get AI explanation for page ${pageNum}`;
        }
        
    } catch (err) {
        console.error('Failed to extract text from current page:', err);
    }

    // Get the page and render it
    const page = await pdfDoc.getPage(pageNum);

    // Set canvas dimensions
    const viewport = page.getViewport({ scale: pdfScale });
    if (pdfCanvas) {
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        // Render the page
        const renderContext = {
            canvasContext: pdfCtx,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // Update TOC active state
        updateTOCActive(pageNum);

        // Update thumbnail active state
        updateThumbnailActive(pageNum);
    }
}

// Add this helper function to update text extraction status
function updateTextExtractionStatus(message) {
    const statusElement = document.getElementById('textExtractionStatus');
    if (statusElement) {
        statusElement.textContent = message;
        
        // Color coding
        if (message.includes('Ready') || message.includes('success')) {
            statusElement.style.color = '#28a745';
        } else if (message.includes('failed') || message.includes('Failed')) {
            statusElement.style.color = '#dc3545';
        } else if (message.includes('Extracting')) {
            statusElement.style.color = '#007bff';
        }
    }
    
    // Also update the explain button if we're on a specific page
    if (currentPage >= 1) {
        const explainBtn = document.querySelector('[onclick="explainSimply()"]');
        if (explainBtn) {
            explainBtn.innerHTML = `<i class="fas fa-robot me-1"></i>Explain Page ${currentPage}`;
            explainBtn.title = `Get AI explanation for page ${currentPage}`;
        }
    }
}

// Enhanced AI explanation function
async function callAIExplanation(request) {
    try {
        // Show modal with loading state
        const modal = new bootstrap.Modal(document.getElementById('explainModal'));
        modal.show();
        
        // Update loading message
        document.getElementById('explainContent').innerHTML = `
            <div class="text-center py-4">
                <div class="loader" style="margin: 0 auto; width: 50px; height: 50px; border-width: 4px;"></div>
                <h5 class="mt-3">Generating Simplified Explanation...</h5>
                <p class="text-muted">Processing: ${request.title || 'PDF Document'}</p>
                <div class="progress mt-3" style="height: 5px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                </div>
            </div>
        `;
        
        // Call backend AI API
        const response = await api.post('/api/student/ai/explain', {
            content: request.content,
            pdfId: request.pdfId,
            title: request.title,
            language: request.language || 'English',
            complexity: request.complexity || 'simple',
            maxLength: 1000  // Limit response length
        });
        
        // Display result
        showExplanationResult(response.explanation || response.text || 'No explanation available.');
        
    } catch (err) {
        console.error('AI call failed:', err);
        
        let errorMessage = 'Failed to generate explanation. ';
        
        if (err.message.includes('limit')) {
            errorMessage += 'Daily limit reached.';
        } else if (err.message.includes('network')) {
            errorMessage += 'Network error. Please check your connection.';
        } else {
            errorMessage += 'Please try again later.';
        }
        
        // Fallback to mock explanation
        const mockExplanation = generateMockExplanation(request.content, request.title);
        showExplanationResult(mockExplanation);
        
        // Still show error notification
        showNotification(errorMessage, 'warning');
    }
}

function generateMockExplanation(content, title) {
    // Create a mock explanation for development/testing
    const truncatedContent = content.substring(0, 500);
    
    return `
        <h5>AI Explanation for: ${escapeHtml(title || 'PDF Document')}</h5>
        <p class="text-muted mb-4">This is a demonstration of AI-powered explanation. In production, this would be generated by an AI service.</p>
        
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Note:</strong> This is a mock explanation. Real AI service would provide detailed analysis.
        </div>
        
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0"><i class="fas fa-file-alt me-2"></i>Document Summary</h6>
            </div>
            <div class="card-body">
                <p>Based on the extracted content (${content.length} characters), this document appears to be educational material.</p>
                
                <h6 class="mt-3">Key Points:</h6>
                <ul>
                    <li>The document discusses important concepts related to the topic</li>
                    <li>It contains educational content suitable for students</li>
                    <li>The material is presented in a structured format</li>
                    <li>Key terms and definitions are likely included</li>
                </ul>
                
                <h6 class="mt-3">Study Tips:</h6>
                <ol>
                    <li>Read through the document carefully, highlighting key terms</li>
                    <li>Make notes of important concepts and definitions</li>
                    <li>Create flashcards for difficult terms</li>
                    <li>Discuss the material with classmates or teachers</li>
                </ol>
            </div>
        </div>
        
        <div class="alert alert-success">
            <h6><i class="fas fa-lightbulb me-2"></i>Learning Strategy</h6>
            <p class="mb-0">To better understand this material, try breaking it down into smaller sections and studying each part separately. Relate the concepts to real-world examples for better retention.</p>
        </div>
    `;
}

function showExplanationResult(explanation) {
    const contentDiv = document.getElementById('explainContent');
    
    contentDiv.innerHTML = `
        <div class="animate__animated animate__fadeIn">
            <div class="explanation-header mb-4">
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-robot fa-2x text-primary me-3"></i>
                    <div>
                        <h4 class="mb-0">AI Simplified Explanation</h4>
                        <small class="text-muted">Generated based on PDF content</small>
                    </div>
                </div>
            </div>
            
            <div class="explanation-body">
                <div class="card bg-light border-0 mb-3 animate__animated animate__slideInLeft">
                    <div class="card-body">
                        <div class="d-flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-lightbulb text-warning fa-lg me-3"></i>
                            </div>
                            <div class="flex-grow-1">
                                ${formatMarkdown(explanation)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-light border">
                    <h6><i class="fas fa-chart-bar me-2"></i>Explanation Details</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">Source:</small>
                            <div class="fw-bold">${escapeHtml(currentPDFTitle || 'PDF Document')}</div>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">Text Analyzed:</small>
                            <div class="fw-bold">${extractedPDFText ? extractedPDFText.length + ' characters' : 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatMarkdown(text) {
    // Simple markdown to HTML converter
    return text
        .replace(/^## (.*$)/gim, '<h5 class="mt-3 mb-2">$1</h5>')
        .replace(/^### (.*$)/gim, '<h6 class="mt-2 mb-2">$1</h6>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/(\*\*|__)(.*?)\1/gim, '<strong>$2</strong>')
        .replace(/(\*|_)(.*?)\1/gim, '<em>$2</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/<li><br>/g, '<li>')
        .replace(/<\/li><br>/g, '</li>')
        .replace(/<p>(.*?)<li>/g, '<p><ul>$1<li>')
        .replace(/<\/li>(.*?)<\/p>/g, '</li></ul>$1</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '');
}

function copyExplanation() {
    const explanationElement = document.querySelector('.explanation-body');
    if (explanationElement) {
        const explanationText = explanationElement.innerText;
        navigator.clipboard.writeText(explanationText)
            .then(() => {
                showNotification('Explanation copied to clipboard!', 'success');
                
                // Visual feedback
                const copyBtn = document.querySelector('[onclick="copyExplanation()"]');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
                copyBtn.classList.add('btn-success');
                copyBtn.classList.remove('btn-gradient');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-gradient');
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                showNotification('Failed to copy text to clipboard', 'error');
            });
    } else {
        showNotification('No explanation text to copy', 'warning');
    }
}

async function extractCurrentPDFContent() {
    try {
        // Clear previous text
        extractedPDFText = '';
        
        // Try different methods to extract text from PDF
        
        // Method 1: Try to get text from iframe (if using browser's PDF viewer)
        const pdfIframe = document.getElementById('pdfIframe');
        if (pdfIframe && pdfIframe.contentWindow) {
            console.log('Attempting to extract text from iframe...');
            
            // This method works if the PDF is being displayed in an iframe
            // Note: Cross-origin restrictions may apply
            try {
                const iframeDoc = pdfIframe.contentDocument || pdfIframe.contentWindow.document;
                if (iframeDoc) {
                    // Try to get text from the iframe body
                    extractedPDFText = iframeDoc.body.innerText || iframeDoc.body.textContent;
                    
                    if (extractedPDFText && extractedPDFText.trim().length > 100) {
                        console.log('Extracted text from iframe:', extractedPDFText.substring(0, 200) + '...');
                        return;
                    }
                }
            } catch (iframeErr) {
                console.log('Could not access iframe content due to security restrictions:', iframeErr);
            }
        }
        
        // Method 2: Use PDF.js text extraction (if implemented)
        if (pdfDoc && currentPage >= 1) {
            console.log('Extracting text from PDF.js document...');
            await extractTextFromPDFPage(currentPage);
            if (extractedPDFText && extractedPDFText.trim().length > 100) {
                return;
            }
        }
        
        // Method 3: Fallback - Get PDF content from API
        console.log('Fetching PDF content from server...');
        await fetchPDFContentFromAPI();
        
    } catch (err) {
        console.error('Error extracting PDF content:', err);
        throw new Error('Could not extract text from PDF. Please ensure the PDF contains selectable text.');
    }
}

async function fetchPDFContentFromAPI() {
    try {
        // Call your backend API to get PDF content
        const response = await api.get(`/student/pdfs/${currentPDFId}/content`);
        
        if (response && response.content) {
            extractedPDFText = response.content;
            console.log('Fetched PDF content from API:', extractedPDFText.substring(0, 200) + '...');
        } else {
            // Fallback: Use PDF metadata
            extractedPDFText = `PDF Title: ${currentPDFTitle}\n`;
            
            // Get PDF info from DOM
            const pdfInfo = document.getElementById('pdfInfoContent');
            if (pdfInfo) {
                extractedPDFText += `Category: ${document.getElementById('pdfInfoCategory')?.textContent || 'N/A'}\n`;
                extractedPDFText += `Description: ${document.getElementById('pdfInfoDescription')?.textContent || 'No description'}\n`;
            }
            
            extractedPDFText += '\nPlease explain this document in simple terms.';
        }
    } catch (err) {
        console.error('Failed to fetch PDF content from API:', err);
        throw err;
    }
}

async function extractTextFromPDFPage(pageNumber) {
    if (!pdfDoc || pageNumber < 1 || pageNumber > pdfDoc.numPages) return;
    
    try {
        const page = await pdfDoc.getPage(pageNumber);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items) {
            extractedPDFText = textContent.items
                .map(item => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log(`Extracted ${extractedPDFText.length} characters from page ${pageNumber}`);
            
            // If the current page has little text, try to get more pages
            if (extractedPDFText.length < 200 && pageNumber < pdfDoc.numPages) {
                console.log('Text too short, trying next page...');
                await extractTextFromPDFPage(pageNumber + 1);
            }
        }
    } catch (err) {
        console.error('Error extracting text from PDF page:', err);
    }
}

// ==========================
// ULTRA SIMPLE - EXTRACT & CONSOLE.LOG ONLY
// ==========================
// First, let's add debugging to see what's happening
function debugPageNavigation() {
    console.log("=== PAGE NAVIGATION DEBUG ===");
    console.log("currentPage variable:", currentPage);
    console.log("pdfDoc exists:", !!pdfDoc);
    console.log("pdfDoc.numPages:", pdfDoc?.numPages);
    
    // Check if we're in PDF viewer
    const modal = document.getElementById('pdfViewerModal');
    console.log("PDF Modal open:", modal?.classList.contains('show'));
    
    // Check page input value
    const pageInput = document.getElementById('pageInput');
    console.log("Page input value:", pageInput?.value);
    
    // Check current page display
    const pageDisplay = document.getElementById('currentPageInfo');
    console.log("Page display text:", pageDisplay?.textContent);
    console.log("==============================");
}

// Update explainSimply to include debugging
async function explainSimply() {
    try {
        console.clear();
        console.log("🚀 ===== EXPLAIN SIMPLY CLICKED =====");
        
        // Run debug first
        debugPageNavigation();
        detectCurrentPageFromUI();
        
        let extractedText = '';
        let pageNumber = currentPage || 1;
        let title = currentPDFTitle || 'PDF Document';
        
        // Check if we're in PDF viewer
        const isInPDFViewer = document.getElementById('pdfViewerModal')?.classList.contains('show');
        
        if (isInPDFViewer && currentPDFId) {
            console.log(`📄 PDF Viewer Active:`);
            console.log(`   📖 Document: "${title}"`);
            console.log(`   📃 Current Page: ${pageNumber}`);
            console.log(`   🔗 PDF ID: ${currentPDFId}`);
            
            // Debug: Show what PDF.js sees
            if (pdfDoc) {
                console.log(`   📚 Total Pages in PDF.js: ${pdfDoc.numPages}`);
            } else {
                console.log(`   ⚠️ PDF.js not loaded`);
            }
            
            // METHOD 1: Use PDF.js to extract text from current page
            if (pdfDoc && pageNumber >= 1 && pageNumber <= pdfDoc.numPages) {
                console.log(`\n🔍 Extracting text from page ${pageNumber} using PDF.js...`);
                
                try {
                    const page = await pdfDoc.getPage(pageNumber);
                    const textContent = await page.getTextContent();
                    
                    if (textContent?.items && textContent.items.length > 0) {
                        extractedText = textContent.items
                            .map(item => item.str)
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        console.log(`✅ SUCCESS: Extracted ${extractedText.length} characters`);
                        
                        // Show text statistics
                        const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
                        const lineCount = extractedText.split('\n').length;
                        console.log(`   📊 Words: ${wordCount}, Lines: ${lineCount}`);
                        
                    } else {
                        console.log(`⚠️  No text content found on page ${pageNumber}`);
                        extractedText = `[NO TEXT FOUND ON PAGE ${pageNumber}]`;
                    }
                    
                } catch (pdfErr) {
                    console.error(`❌ PDF.js extraction failed:`, pdfErr.message);
                    extractedText = `[EXTRACTION ERROR: ${pdfErr.message}]`;
                }
                
            } else {
                console.log(`⚠️  Cannot extract - PDF.js issue:`);
                console.log(`   pdfDoc exists: ${!!pdfDoc}`);
                console.log(`   Current page: ${pageNumber}`);
                console.log(`   Valid page range: ${pdfDoc ? `1-${pdfDoc.numPages}` : 'unknown'}`);
                extractedText = `[CANNOT EXTRACT - CHECK CONSOLE FOR DETAILS]`;
            }
            
        } else {
            // Not in PDF viewer
            console.log(`🌐 Not in PDF viewer - extracting webpage content`);
            title = document.title || 'Current Webpage';
            extractedText = document.body.textContent.substring(0, 3000);
            console.log(`✅ Extracted ${extractedText.length} characters from webpage`);
        }
        
        // ============================================
        // CREATE AND PRINT THE PROMPT
        // ============================================
        
        const prompt = `📝 **AI EXPLANATION PROMPT**
        
📄 **DOCUMENT:** ${title}
📃 **PAGE:** ${pageNumber}
📅 **TIMESTAMP:** ${new Date().toISOString()}

📋 **INSTRUCTION TO AI:**
You are a helpful tutor. Please explain the following content in simple, easy-to-understand terms for a student.

🔍 **CONTENT TO EXPLAIN (${extractedText.length} characters):**
${extractedText.substring(0, 4000)}${extractedText.length > 4000 ? '... [CONTENT TRUNCATED]' : ''}

🎯 **EXPLANATION REQUIREMENTS:**
1. Explain key concepts in simple language
2. Break down complex ideas
3. Use analogies or real-world examples
4. Highlight important terms and definitions
5. Provide study tips for this material
6. Keep it concise and focused

💡 **ADDITIONAL CONTEXT:**
- Student level: Undergraduate
- Learning style: Visual and practical examples preferred
- Prior knowledge: Basic understanding assumed`;

        // ============================================
        // PRINT TO CONSOLE WITH FORMATTING
        // ============================================
        
        console.log("\n" + "=".repeat(80));
        console.log("🤖 FINAL AI PROMPT READY");
        console.log("=".repeat(80));
        
        // Print prompt in a readable format
        console.log(prompt);
        
        console.log("\n" + "=".repeat(80));
        console.log("📋 PROMPT METADATA");
        console.log("=".repeat(80));
        console.log(`Total characters: ${prompt.length}`);
        console.log(`Content characters: ${extractedText.length}`);
        console.log(`Page number: ${pageNumber}`);
        console.log(`Document: ${title}`);
        console.log(`Extraction source: ${isInPDFViewer ? 'PDF.js' : 'Webpage'}`);
        
        // Show first 500 chars of extracted text in console
        console.log("\n" + "=".repeat(80));
        console.log("👁️  EXTRACTED TEXT PREVIEW (first 500 chars)");
        console.log("=".repeat(80));
        console.log(extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''));
        
        // Also copy to clipboard automatically for convenience
        try {
            await navigator.clipboard.writeText(prompt);
            console.log("\n📋 Prompt copied to clipboard!");
        } catch (clipboardErr) {
            console.log("\n⚠️  Could not copy to clipboard:", clipboardErr.message);
        }
        
        console.log("\n" + "=".repeat(80));
        console.log("✅ EXTRACTION COMPLETE - PROMPT READY IN CONSOLE");
        console.log("=".repeat(80));
        
        // Simple notification
        showNotification(`Extracted ${extractedText.length} chars from page ${pageNumber}. Check console!`, 'success');
        
    } catch (err) {
        console.error("❌ ERROR in explainSimply:", err);
        console.error("Stack trace:", err.stack);
        showNotification('Failed: ' + err.message, 'error');
    }
}

// Function to detect current page from UI
function detectCurrentPageFromUI() {
    console.log("🔍 Detecting current page from UI...");
    
    // Method 1: Check if we have a current page variable from PDF.js
    if (currentPage && currentPage > 0) {
        console.log(`   ✅ Using global currentPage: ${currentPage}`);
        return;
    }
    
    // Method 2: Look for ANY element that might contain page info
    const possibleSelectors = [
        '#pageInput', '.page-input', '[id*="page"] input',
        '#currentPage', '.current-page', '#pageNumber',
        '#pageCount', '.page-count', '[class*="page"] strong',
        '.modal-body strong', '.modal-body span', '.modal-body div'
    ];
    
    for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            const text = element.textContent || element.value || '';
            const match = text.match(/\b(\d+)\b/);
            if (match) {
                const pageNum = parseInt(match[1]);
                if (pageNum > 0 && pageNum < 1000) { // Reasonable page number
                    console.log(`   📄 Found in ${selector}: ${pageNum}`);
                    currentPage = pageNum;
                    return;
                }
            }
        }
    }
    
    console.log(`   ⚠️  Could not detect page from UI, using default: 1`);
    currentPage = 1;
}

// Function to update current page when navigating
function goToPageDirect(page) {
    console.log(`🔄 Navigating to page ${page}`);
    currentPage = page;
    
    if (window.currentPDF && window.currentPDF.pdf) {
        renderPDFPage(page);
    } else {
        loadPDFPage(page); // Fallback to mock
    }
}

async function renderAllPages() {
    const container = document.getElementById('pdfDisplay');
    container.innerHTML = '';

    pageHeights = [];
    pageOffsets = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: pdfScale });

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page';
        pageWrapper.dataset.page = pageNum;
        pageWrapper.style.marginBottom = '20px';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);

        await page.render({
            canvasContext: ctx,
            viewport
        }).promise;

        pageHeights.push(viewport.height);
    }

    calculatePageOffsets();
    attachScrollListener();
}

function calculatePageOffsets() {
    const pages = document.querySelectorAll('.pdf-page');
    let offset = 0;

    pageOffsets = [];

    pages.forEach((page, index) => {
        pageOffsets.push({
            page: index + 1,
            start: offset,
            end: offset + pageHeights[index]
        });
        offset += pageHeights[index] + 20;
    });
}
function attachScrollListener() {
    const container = document.getElementById('pdfDisplay');

    container.addEventListener('scroll', () => {
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const center = scrollTop + containerHeight / 2;

        for (const p of pageOffsets) {
            if (center >= p.start && center <= p.end) {
                if (currentPage !== p.page) {
                    currentPage = p.page;
                    console.log('Current page updated:', currentPage);
                    updatePageUI();
                }
                break;
            }
        }
    });
}


// Also update navigation functions to track current page
function goToFirstPage() {
    goToPageDirect(1);
}

function goToPrevPage() {
    if (currentPage > 1) {
        goToPageDirect(currentPage - 1);
    }
}

function goToNextPage() {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
        goToPageDirect(currentPage + 1);
    }
}

function goToLastPage() {
    if (pdfDoc && pdfDoc.numPages) {
        goToPageDirect(pdfDoc.numPages);
    }
}

function goToPage() {
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        const page = parseInt(pageInput.value);
        if (page >= 1 && page <= (pdfDoc?.numPages || 999)) {
            goToPageDirect(page);
        }
    }
}

// Also simplify the explainCurrentPDF function
function explainCurrentPDF() {
    explainSimply();
}

// Add this to initialize when PDF loads
async function initializePDFJSForTextExtraction(blob) {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        console.log(`📚 PDF loaded with ${pdfDoc.numPages} pages`);
        console.log(`📖 Initial current page set to: ${currentPage}`);
        
    } catch (err) {
        console.error('PDF.js initialization failed:', err);
    }
}

function observeVisiblePDFPage() {
    const pages = document.querySelectorAll('.pdf-page');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.page);
                if (pageNum && pageNum !== currentPage) {
                    currentPage = pageNum;
                    console.log(`👀 Visible page detected: ${currentPage}`);
                }
            }
        });
    }, {
        root: document.getElementById('pdfDisplay'),
        threshold: 0.6 // 60% visible = active page
    });

    pages.forEach(p => observer.observe(p));
}
observeVisiblePDFPage();
console.log(currentPage)

// ==========================
// UTILITY FUNCTIONS
// ==========================
function logout() {
    showNotification('Logging out...', 'info');
    setTimeout(() => {
        localStorage.removeItem('user');
        api.setToken(null);
        window.location.href = 'index.html';
    }, 1000);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">${message}</p>
            </div>
        `;
    }
}

function showLoadingModal(message = 'Loading...') {
    console.log(message);
}

function hideLoadingModal() {
    console.log('Loading complete');
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getStatusBadge(status) {
    const statusMap = {
        'COMPLETED': 'bg-success',
        'IN_PROGRESS': 'bg-warning',
        'NOT_STARTED': 'bg-secondary',
        'ON_HOLD': 'bg-danger'
    };
    const badgeClass = statusMap[status] || 'bg-secondary';
    return `<span class="badge ${badgeClass}">${status || 'Unknown'}</span>`;
}

function getProgressBar(percentage) {
    const percent = percentage || 0;
    const width = Math.min(percent, 100);
    const barClass = percent === 100 ? 'bg-success' : (percent >= 50 ? 'bg-warning' : 'bg-info');
    return `
        <div class="progress" style="height: 10px; width: 100%;">
            <div class="progress-bar ${barClass}" 
                 style="width: ${width}%"></div>
        </div>
    `;
}

function getLinkHtml(url, text, className = '') {
    if (!url) return '';
    return `<a href="${url}" target="_blank" class="btn ${className}">${text}</a>`;
}

function formatDisplayDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}

function viewProjectDetails(projectId) {
    showNotification(`Viewing project details for ID: ${projectId}`, 'info');
}

function debugToken() {
    console.log("=== Token Debug ===");
    console.log("api.token:", api.token ? api.token.substring(0, 30) + "..." : "null");
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("localStorage user:", user);
    console.log("localStorage token:", user ? user.token.substring(0, 30) + "..." : "null");
    console.log("===================");
}

// ==========================
// ANIMATIONS & STYLES
// ==========================
function addQuizStyles() {
    const quizStyles = `
        .quiz-card {
            transition: all 0.3s ease;
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .quiz-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .option-radio {
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 12px 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            background: white;
        }
        
        .option-radio:hover {
            border-color: #667eea;
            background-color: rgba(102, 126, 234, 0.05);
            transform: translateX(5px);
        }
        
        .option-radio.selected {
            border-color: #667eea;
            background-color: rgba(102, 126, 234, 0.1);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        
        .option-radio.correct-answer {
            border-color: #28a745;
            background-color: rgba(40, 167, 69, 0.1);
            box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
            animation: pulseCorrect 1s infinite;
        }
        
        .option-radio.wrong-answer {
            border-color: #dc3545;
            background-color: rgba(220, 53, 69, 0.1);
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
            animation: pulseWrong 1s infinite;
        }
        
        .option-radio input[type="radio"] {
            margin-right: 15px;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .option-radio label {
            display: flex;
            align-items: center;
            width: 100%;
            cursor: pointer;
            margin: 0;
        }
        
        .option-letter {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #667eea;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: bold;
        }
        
        .option-radio.correct-answer .option-letter {
            background-color: #28a745;
        }
        
        .option-radio.wrong-answer .option-letter {
            background-color: #dc3545;
        }
        
        .option-text {
            flex: 1;
            font-weight: 500;
        }
        
        .question-text {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #333;
        }
        
        .result-feedback {
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .result-correct {
            background-color: rgba(40, 167, 69, 0.1);
            border-left: 5px solid #28a745;
        }
        
        .result-wrong {
            background-color: rgba(220, 53, 69, 0.1);
            border-left: 5px solid #dc3545;
        }
        
        .correct-answer-display {
            background-color: rgba(40, 167, 69, 0.15);
            border-radius: 8px;
            padding: 10px 15px;
            margin: 10px 0;
        }
        
        .explanation {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }
        
        .quiz-navigation .btn {
            min-width: 120px;
        }
        
        #quizModal .modal-dialog {
            max-width: 800px;
        }
        
        #quizModal .modal-body {
            min-height: 400px;
        }
        
        @keyframes pulseCorrect {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
        
        @keyframes pulseWrong {
            0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        
        .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            pointer-events: none;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f0f;
            top: -10px;
            animation: confetti-fall 5s linear infinite;
        }
        
        .confetti:nth-child(1) {
            left: 10%;
            background-color: #ff0000;
            animation-delay: 0s;
        }
        
        .confetti:nth-child(2) {
            left: 20%;
            background-color: #00ff00;
            animation-delay: 0.5s;
        }
        
        .confetti:nth-child(3) {
            left: 30%;
            background-color: #0000ff;
            animation-delay: 1s;
        }
        
        .confetti:nth-child(4) {
            left: 40%;
            background-color: #ffff00;
            animation-delay: 1.5s;
        }
        
        .confetti:nth-child(5) {
            left: 50%;
            background-color: #ff00ff;
            animation-delay: 2s;
        }
        
        .confetti:nth-child(6) {
            left: 60%;
            background-color: #00ffff;
            animation-delay: 2.5s;
        }
        
        .confetti:nth-child(7) {
            left: 70%;
            background-color: #ff8800;
            animation-delay: 3s;
        }
        
        .confetti:nth-child(8) {
            left: 80%;
            background-color: #8800ff;
            animation-delay: 3.5s;
        }
        
        @keyframes confetti-fall {
            0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(1000px) rotate(720deg);
                opacity: 0;
            }
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = quizStyles;
    document.head.appendChild(styleSheet);
}

function triggerConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) return;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confettiContainer.appendChild(confetti);
    }
}

function getRandomColor() {
    const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00',
        '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
        '#ff0088', '#00ff88', '#8888ff', '#ff8888'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to print current page number in console
function printCurrentPage() {
    console.log("🔍 DEBUG: PRINTING CURRENT PAGE NUMBER");
    console.log("=".repeat(50));
    
    // 1. Check the global currentPage variable
    console.log(`1. Global currentPage variable: ${currentPage}`);
    
    // 2. Check if PDF document exists
    console.log(`2. PDF Document loaded: ${!!pdfDoc}`);
    if (pdfDoc) {
        console.log(`   Total pages: ${pdfDoc.numPages}`);
    }
    
    // 3. Look for page input field
    const pageInput = document.getElementById('pageInput');
    console.log(`3. Page input field exists: ${!!pageInput}`);
    if (pageInput) {
        console.log(`   Input value: "${pageInput.value}"`);
        console.log(`   Input ID: "${pageInput.id}"`);
        console.log(`   Input class: "${pageInput.className}"`);
    }
    
    // 4. Look for any input fields with "page" in ID or class
    const allInputs = document.querySelectorAll('input');
    let pageInputs = [];
    allInputs.forEach(input => {
        if (input.id?.toLowerCase().includes('page') || 
            input.className?.toLowerCase().includes('page') ||
            input.name?.toLowerCase().includes('page')) {
            pageInputs.push({
                id: input.id,
                value: input.value,
                type: input.type,
                className: input.className
            });
        }
    });
    console.log(`4. All page-related inputs (${pageInputs.length} found):`);
    pageInputs.forEach(input => {
        console.log(`   - ${input.id || 'no-id'} = "${input.value}" (type: ${input.type})`);
    });
    
    // 5. Look for page display elements
    console.log(`5. Searching for page display elements...`);
    const possibleSelectors = [
        '#currentPageInfo', '#pageInfo', '#currentPage', '#pageDisplay',
        '.page-info', '.current-page', '.page-display',
        '[id*="page"]', '[class*="page"]'
    ];
    
    let foundElements = [];
    possibleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.textContent && el.textContent.trim()) {
                foundElements.push({
                    selector: selector,
                    text: el.textContent.trim(),
                    id: el.id,
                    className: el.className
                });
            }
        });
    });
    
    console.log(`   Found ${foundElements.length} elements with page info:`);
    foundElements.forEach(el => {
        console.log(`   - ${el.selector}: "${el.text}" ${el.id ? `(id: ${el.id})` : ''}`);
    });
    
    // 6. Look for any text containing "Page" or "page"
    console.log(`6. Searching for text containing "Page" or numbers...`);
    const allTextElements = document.querySelectorAll('body *');
    let pageTexts = [];
    
    allTextElements.forEach(el => {
        const text = el.textContent || '';
        if (text.trim() && (text.includes('Page') || text.includes('page') || /\d+\s*\/\s*\d+/.test(text))) {
            // Clean up the text
            const cleanText = text.replace(/\s+/g, ' ').trim().substring(0, 100);
            if (!pageTexts.find(t => t.text === cleanText)) {
                pageTexts.push({
                    element: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: cleanText
                });
            }
        }
    });
    
    console.log(`   Found ${pageTexts.length} elements with page-related text:`);
    pageTexts.forEach(item => {
        console.log(`   - <${item.element}> ${item.id ? `#${item.id}` : ''} ${item.className ? `.${item.className.split(' ')[0]}` : ''}: "${item.text}"`);
    });
    
    // 7. Check PDF viewer modal specifically
    console.log(`7. Checking PDF viewer modal...`);
    const pdfModal = document.getElementById('pdfViewerModal');
    console.log(`   Modal exists: ${!!pdfModal}`);
    console.log(`   Modal is open: ${pdfModal?.classList.contains('show')}`);
    
    if (pdfModal && pdfModal.classList.contains('show')) {
        console.log(`   Searching inside modal for page info...`);
        const modalElements = pdfModal.querySelectorAll('*');
        modalElements.forEach(el => {
            const text = el.textContent || '';
            if (text.includes('/') && /\d/.test(text)) {
                console.log(`   - Found: "${text.trim().substring(0, 50)}"`);
            }
        });
    }
    
    // 8. Try to extract page number from text patterns
    console.log(`8. Attempting to parse page numbers from text...`);
    const allVisibleText = document.body.textContent;
    const patterns = [
        /Page[:\s]*(\d+)\s*of\s*(\d+)/i,
        /Page[:\s]*(\d+)\s*\/\s*(\d+)/i,
        /Page[:\s]*(\d+)/i,
        /(\d+)\s*of\s*(\d+)/i,
        /(\d+)\s*\/\s*(\d+)/,
        /Current.*[Pp]age.*(\d+)/i,
        /[Pp]age.*(\d+).*of.*(\d+)/i
    ];
    
    patterns.forEach((pattern, index) => {
        const match = allVisibleText.match(pattern);
        if (match) {
            console.log(`   Pattern ${index + 1} matched: "${match[0]}"`);
            console.log(`     Page: ${match[1]}, Total: ${match[2] || 'unknown'}`);
        }
    });
    
    // 9. Check URL for page parameter
    console.log(`9. Checking URL for page parameter...`);
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = urlParams.get('page');
    console.log(`   URL page parameter: ${urlPage || 'none'}`);
    
    const hash = window.location.hash;
    console.log(`   URL hash: ${hash || 'none'}`);
    
    // 10. Summary
    console.log("=".repeat(50));
    console.log("📊 SUMMARY:");
    console.log(`   Current page (global variable): ${currentPage}`);
    console.log(`   Most likely actual page: ${guessActualPage()}`);
    console.log("=".repeat(50));
    
    return currentPage;
}

// Helper function to guess the actual page
function guessActualPage() {
    // Try multiple methods to guess the page
    
    // Method 1: Check input field
    const pageInput = document.getElementById('pageInput');
    if (pageInput && pageInput.value) {
        const inputPage = parseInt(pageInput.value);
        if (!isNaN(inputPage) && inputPage > 0) {
            return inputPage;
        }
    }
    
    // Method 2: Search text for "Page X of Y" pattern
    const allText = document.body.textContent;
    const patterns = [
        /Page[:\s]*(\d+)\s*of\s*\d+/i,
        /Page[:\s]*(\d+)\s*\/\s*\d+/i,
        /(\d+)\s*of\s*\d+/i,
        /(\d+)\s*\/\s*\d+/
    ];
    
    for (const pattern of patterns) {
        const match = allText.match(pattern);
        if (match && match[1]) {
            const pageNum = parseInt(match[1]);
            if (!isNaN(pageNum) && pageNum > 0) {
                return pageNum;
            }
        }
    }
    
    // Method 3: Look for any number that could be a page
    const numberMatches = allText.match(/\b(\d{1,3})\b/g) || [];
    const possiblePages = numberMatches
        .map(num => parseInt(num))
        .filter(num => num > 0 && num < 1000);
    
    if (possiblePages.length > 0) {
        // Return the most common number (likely the page)
        const counts = {};
        possiblePages.forEach(num => counts[num] = (counts[num] || 0) + 1);
        const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        return parseInt(mostCommon);
    }
    
    return currentPage; // Fallback to global variable
}

// Function to test page detection quickly
function testPageDetection() {
    console.clear();
    console.log("🧪 TESTING PAGE DETECTION");
    console.log("=".repeat(40));
    
    const actualPage = guessActualPage();
    console.log(`Guessed actual page: ${actualPage}`);
    console.log(`Global currentPage: ${currentPage}`);
    
    if (actualPage !== currentPage) {
        console.warn(`⚠️  MISMATCH: Global variable says ${currentPage}, but UI suggests ${actualPage}`);
        console.log("Updating global variable to match UI...");
        currentPage = actualPage;
    } else {
        console.log("✅ Page numbers match!");
    }
    
    console.log("=".repeat(40));
    return actualPage;
}

// Quick function to see what page you're on
function whatPageAmIOn() {
    console.log("🤔 WHAT PAGE AM I ON?");
    
    // Quick check of common patterns
    const quickChecks = [
        () => document.getElementById('pageInput')?.value,
        () => document.getElementById('currentPageInfo')?.textContent,
        () => document.querySelector('[id*="page"]')?.textContent,
        () => document.querySelector('[class*="page"]')?.textContent
    ];
    
    let foundPage = null;
    
    for (const check of quickChecks) {
        try {
            const result = check();
            if (result) {
                console.log(`Found: "${result}"`);
                
                // Try to extract number
                const match = result.toString().match(/\d+/);
                if (match) {
                    foundPage = parseInt(match[0]);
                    break;
                }
            }
        } catch (e) {
            // Continue to next check
        }
    }
    
    if (foundPage) {
        console.log(`🎯 You are on page: ${foundPage}`);
        console.log(`📝 Global currentPage variable: ${currentPage}`);
        
        if (foundPage !== currentPage) {
            console.warn(`⚠️  WARNING: currentPage variable (${currentPage}) doesn't match actual page (${foundPage})!`);
            console.log("💡 Suggestion: Run fixPageNumber() to correct this.");
        }
    } else {
        console.log("❌ Could not determine page number automatically");
        console.log("💡 Try running printCurrentPage() for detailed analysis");
    }
    
    return foundPage;
}

//*************************** */
//*************************** */
//*************************** */

// Function to fix the page number mismatch
function fixPageNumber() {
    console.log("🔧 FIXING PAGE NUMBER...");
    const actualPage = whatPageAmIOn();
    
    if (actualPage && actualPage !== currentPage) {
        console.log(`Updating currentPage from ${currentPage} to ${actualPage}`);
        currentPage = actualPage;
        console.log("✅ Fixed! currentPage is now:", currentPage);
        
        // Update the fixed explain button if it exists
        updateFixedExplainButton();
        
        return true;
    } else {
        console.log("✅ No fix needed - page numbers already match");
        return false;
    }
}

// Update the fixed explain button text
function updateFixedExplainButton() {
    const button = document.getElementById('fixedExplainButton');
    if (button) {
        const textSpan = button.querySelector('.button-text');
        if (textSpan) {
            textSpan.textContent = `Explain Page ${currentPage}`;
        }
        button.title = `Get AI explanation for page ${currentPage}`;
        console.log(`📝 Updated button to: Explain Page ${currentPage}`);
    }
}

// Mock questions for development
function getMockQuestions() {
    return [
        {
            id: 1,
            questionText: "What is the capital of France?",
            questionType: "MCQ",
            points: 10,
            options: [
                { id: 1, optionText: "London" },
                { id: 2, optionText: "Berlin" },
                { id: 3, optionText: "Paris" },
                { id: 4, optionText: "Madrid" }
            ]
        },
        {
            id: 2,
            questionText: "JavaScript is a case-sensitive language.",
            questionType: "TRUE_FALSE",
            points: 5
        },
        {
            id: 3,
            questionText: "What does HTML stand for?",
            questionType: "MCQ",
            points: 10,
            options: [
                { id: 1, optionText: "Hyper Text Markup Language" },
                { id: 2, optionText: "High Tech Modern Language" },
                { id: 3, optionText: "Hyper Transfer Markup Language" },
                { id: 4, optionText: "Home Tool Markup Language" }
            ]
        },
        {
            id: 4,
            questionText: "Which programming language is known as the 'language of the web'?",
            questionType: "MCQ",
            points: 10,
            options: [
                { id: 1, optionText: "Python" },
                { id: 2, optionText: "Java" },
                { id: 3, optionText: "JavaScript" },
                { id: 4, optionText: "C++" }
            ]
        }
    ];
}

// Cleanup when modal closes
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('pdfViewerModal');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            if (window.currentPDFBlobUrl) {
                URL.revokeObjectURL(window.currentPDFBlobUrl);
                window.currentPDFBlobUrl = null;
            }
            
            const pdfDisplay = document.getElementById('pdfDisplay');
            if (pdfDisplay) {
                pdfDisplay.innerHTML = `
                    <div class="text-center text-light py-5">
                        <div class="loader" style="width: 60px; height: 60px; border-width: 5px;"></div>
                        <h4 class="mt-3">Loading PDF Viewer...</h4>
                        <p class="text-muted">Please wait</p>
                    </div>
                `;
            }
        });
    }
});