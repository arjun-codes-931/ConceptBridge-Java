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
let quizTimer = null;
let timeLeft = 0;
let currentAttemptId = null;

// ==========================
// INITIALIZATION
// ==========================
document.addEventListener('DOMContentLoaded', function() {
    // Add quiz styles
    addQuizStyles();
    
    // Initialize user session
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

    // Set token
    api.setToken(user.token);
    document.getElementById('usernameDisplay').textContent = user.username;

    // Add entrance animation
    document.body.classList.add('animate__animated', 'animate__fadeIn');

    // Initialize dashboard
    loadDashboard();
});

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

        // Load section data
        loadSectionData(sectionName);
    }, 350);
}

function loadSectionData(sectionName) {
    switch(sectionName) {
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

async function createNewProject(projectData) {
    try {
        const formattedData = {
            ...projectData,
            startDate: projectData.startDate,
            endDate: projectData.endDate
        };

        const project = await api.post('/student/projects', formattedData);
        console.log('Project created successfully:', project);
        return project;
    } catch (err) {
        console.error('Failed to create project:', err);
        throw err;
    }
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

async function updateProjectProgress(projectId, progress) {
    try {
        console.log('Updating project:', projectId, 'Progress:', progress);
        
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current user:', user);
        
        if (!user || !user.token) {
            throw new Error('User not authenticated');
        }

        const project = await api.put(`/student/projects/${projectId}/progress?progress=${progress}`);
        console.log('Project progress updated successfully:', project);
        return project;
    } catch (err) {
        console.error('Failed to update project progress:', err);
        
        if (err.message.includes('403')) {
            throw new Error('You do not have permission to update this project. It may not belong to you.');
        } else if (err.message.includes('404')) {
            throw new Error('Project not found.');
        } else {
            throw err;
        }
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
// QUIZ FUNCTIONS WITH RADIO BUTTONS & IMMEDIATE FEEDBACK
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
        console.log("Starting quiz:", quizId);
        
        // Load quiz details
        currentQuiz = await api.get(`/student/quizzes/${quizId}`);
        console.log("Quiz details:", currentQuiz);
        
        // Start quiz attempt
        const attempt = await api.post(`/student/quizzes/${quizId}/start`);
        currentAttemptId = attempt.id;
        console.log("Quiz attempt started:", attempt);
        
        // Get questions for this quiz
        quizQuestions = await getQuizQuestions(quizId);
        
        if (!quizQuestions || quizQuestions.length === 0) {
            showNotification('No questions available for this quiz!', 'error');
            return;
        }
        
        // Initialize quiz state
        currentQuestionIndex = 0;
        userAnswers = {};
        questionResults = {}; // Store results for each question
        timeLeft = currentQuiz.duration ? currentQuiz.duration * 60 : 1800;
        
        // Setup modal
        document.getElementById('quizModalTitle').innerHTML = 
            `<i class="fas fa-question-circle me-2"></i>${escapeHtml(currentQuiz.title)}`;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('quizModal'));
        modal.show();
        
        // Reset modal content
        document.getElementById('quizContent').style.display = 'block';
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizContent').innerHTML = '';
        
        // Start timer
        startQuizTimer();
        
        // Load first question
        loadQuestion(currentQuestionIndex);
        
    } catch (err) {
        console.error('Failed to start quiz:', err);
        showNotification('Failed to start quiz: ' + err.message, 'error');
    }
}

async function getQuizQuestions(quizId) {
    try {
        // Use the correct endpoint that matches your controller
        const questions = await api.get(`/student/quizzes/${quizId}/questions`);
        if (questions && questions.length > 0) {
            console.log(`Got questions:`, questions.length);
            return questions;
        }
        throw new Error('No questions found');
    } catch (err) {
        console.warn(`Failed to get questions:`, err.message);
        // Fallback to mock questions for development
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
        // Open-ended question
        html += `
            <div class="mb-4">
                <label class="form-label fw-bold">Your Answer:</label>
                <textarea class="form-control" id="answerText${question.id}" 
                          rows="4" placeholder="Type your answer here..."
                          oninput="saveOpenEndedAnswer(${question.id}, this.value)">${previousAnswer || ''}</textarea>
            </div>
        `;
    }
    
    // Show result if available
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
    
    // Navigation buttons
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
    
    // Update navigation buttons in footer
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
    // If already checked, don't allow changing
    if (questionResults[questionId]) return;
    
    userAnswers[questionId] = optionId;
    
    // Update UI
    const questionElement = document.querySelector(`[onclick*="selectOption(${questionId}, ${optionId}, ${optionIndex})"]`);
    if (questionElement) {
        // Uncheck all radio buttons in this question
        questionElement.parentElement.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Check the selected one
        const radioInput = questionElement.querySelector('input[type="radio"]');
        if (radioInput) {
            radioInput.checked = true;
        }
        
        // Update visual selection
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
        
        // Check answer locally (for demo - in real app, call API)
        let isCorrect = false;
        let correctAnswer = null;
        let correctAnswerText = '';
        let explanation = '';
        
        if (question.questionType === 'MCQ') {
            // For MCQ, assume first option is correct (in real app, get from backend)
            isCorrect = selectedAnswer == 1; // Assuming option 1 is correct
            correctAnswer = 1;
            const correctOption = question.options.find(opt => opt.id == 1);
            correctAnswerText = correctOption ? correctOption.optionText : 'Option 1';
            explanation = isCorrect ? 'Great job! You selected the correct answer.' : 'Remember to review the material.';
        } else if (question.questionType === 'TRUE_FALSE') {
            // For True/False, assume true is correct
            isCorrect = selectedAnswer === 'true';
            correctAnswer = 'true';
            correctAnswerText = 'True';
            explanation = isCorrect ? 'Correct! The statement is true.' : 'The correct answer is True.';
        }
        
        // Store result
        questionResults[questionId] = {
            isCorrect: isCorrect,
            correctAnswer: correctAnswer,
            correctAnswerText: correctAnswerText,
            explanation: explanation,
            points: isCorrect ? (question.points || 10) : 0
        };
        
        // Show animation based on result
        const questionContainer = document.getElementById('quizContent');
        if (isCorrect) {
            questionContainer.classList.add('animate__animated', 'animate__tada');
            showNotification('🎉 Correct Answer!', 'success');
        } else {
            questionContainer.classList.add('animate__animated', 'animate__headShake');
            showNotification('❌ Incorrect. Check the correct answer below.', 'error');
        }
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            questionContainer.classList.remove('animate__animated', 'animate__tada', 'animate__headShake');
        }, 1000);
        
        // Reload question to show feedback
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
        
        // Calculate score
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
        
        // Show loading
        document.getElementById('quizContent').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h4>Calculating your final score...</h4>
                <p class="text-muted">Please wait while we evaluate your answers.</p>
            </div>
        `;
        
        // Simulate API call delay
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
        // Add confetti for excellent scores
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
    
    // Trigger confetti animation for excellent scores
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
        
        /* Confetti animation */
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
    
    // Create more confetti
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

// ==========================
// UTILITY FUNCTIONS
// ==========================
function refreshDashboard() {
    loadDashboard();
    showNotification('Dashboard refreshed!', 'success');
}

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

// Initialize with dashboard
showSection('dashboard');