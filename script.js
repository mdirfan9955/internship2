
/* =========================================
   STUDENT DASHBOARD - MD IRFAN
   JavaScript Functionality
========================================= */


/* =========================================
   1. LOCAL STORAGE FUNCTIONS
========================================= */

function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


/* =========================================
   2. PAGE NAVIGATION
========================================= */

const menuLinks = document.querySelectorAll('.menu-link');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('pageTitle');

const pageNames = {
    dashboard: 'Dashboard',
    profile: 'My Profile',
    attendance: 'Attendance',
    timetable: 'Timetable',
    assignments: 'Assignments',
    results: 'Examination & Results',
    materials: 'Study Materials',
    tasks: 'To-Do List',
    notes: 'My Notes',
    calendar: 'Calendar & Announcements'
};

function openPage(pageId) {

    const targetPage = document.getElementById(pageId);

    if (!targetPage) return;

    // Hide all pages
    pageSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected page
    targetPage.classList.add('active');

    // Update sidebar active button
    menuLinks.forEach(link => {
        link.classList.remove('active');

        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // Update page heading
    pageTitle.textContent = pageNames[pageId] || 'Dashboard';

    // Close mobile sidebar
    document.querySelector('.sidebar').classList.remove('show');

    // Update browser history
    history.replaceState(null, '', '#' + pageId);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// All buttons having data-page
document.querySelectorAll('[data-page]').forEach(button => {

    button.addEventListener('click', () => {
        openPage(button.dataset.page);
    });

});


// Open page from browser URL
const initialPage = location.hash.replace('#', '');

if (pageNames[initialPage]) {
    openPage(initialPage);
}


/* =========================================
   3. MOBILE SIDEBAR
========================================= */

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});


// Close sidebar when clicking outside
document.addEventListener('click', (event) => {

    if (
        window.innerWidth <= 768 &&
        sidebar.classList.contains('show') &&
        !sidebar.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        sidebar.classList.remove('show');
    }

});


/* =========================================
   4. DARK MODE
========================================= */

const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {

    document.body.classList.toggle('dark-mode', theme === 'dark');

    if (theme === 'dark') {

        themeToggle.innerHTML =
            '<i class="fas fa-sun"></i> <span>Light Mode</span>';

    } else {

        themeToggle.innerHTML =
            '<i class="fas fa-moon"></i> <span>Dark Mode</span>';

    }

    localStorage.setItem('studentTheme', theme);
}


// Load saved theme
const savedTheme = localStorage.getItem('studentTheme') || 'light';

applyTheme(savedTheme);


// Change theme on click
themeToggle.addEventListener('click', () => {

    const newTheme = document.body.classList.contains('dark-mode')
        ? 'light'
        : 'dark';

    applyTheme(newTheme);

});


/* =========================================
   5. HELPER FUNCTIONS
========================================= */

// Create safe HTML elements using textContent
function createElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}


// Format date
function formatDate(date) {

    if (!date) return 'No date';

    const parts = date.split('-');

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// Create action button
function createButton(text, className, callback) {

    const button = createElement('button', className, text);

    button.type = 'button';
    button.addEventListener('click', callback);

    return button;
}


/* =========================================
   6. ASSIGNMENTS
========================================= */

const assignmentForm = document.getElementById('assignmentForm');
const assignmentList = document.getElementById('assignmentList');

let assignments = getData('studentAssignments');


function displayAssignments() {

    assignmentList.innerHTML = '';

    if (assignments.length === 0) {

        const row = createElement('tr');
        const cell = createElement('td', '', 'No assignments added.');

        cell.colSpan = 5;
        row.appendChild(cell);
        assignmentList.appendChild(row);

    } else {

        assignments.forEach((assignment, index) => {

            const row = createElement('tr');

            const title = createElement('td', '', assignment.title);
            const subject = createElement('td', '', assignment.subject);
            const date = createElement('td', '', formatDate(assignment.date));
            const status = createElement('td', '', assignment.status);

            const action = createElement('td');

            const deleteBtn = createButton(
                'Delete',
                'delete-btn',
                () => deleteAssignment(index)
            );

            const statusBtn = createButton(
                assignment.status === 'Completed' ? 'Undo' : 'Complete',
                'task-actions',
                () => toggleAssignment(index)
            );

            action.appendChild(statusBtn);
            action.appendChild(deleteBtn);

            row.append(title, subject, date, status, action);

            assignmentList.appendChild(row);

        });

    }

    document.getElementById('assignmentCount').textContent =
        assignments.length;

    saveData('studentAssignments', assignments);

}


assignmentForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const assignment = {

        title: document.getElementById('assignmentTitle').value.trim(),

        subject: document.getElementById('assignmentSubject').value.trim(),

        date: document.getElementById('assignmentDate').value,

        status: document.getElementById('assignmentStatus').value

    };

    if (!assignment.title || !assignment.subject || !assignment.date) {
        alert('Please fill all assignment details.');
        return;
    }

    assignments.push(assignment);

    saveData('studentAssignments', assignments);

    assignmentForm.reset();

    displayAssignments();

    alert('Assignment added successfully!');

});


function deleteAssignment(index) {

    if (confirm('Are you sure you want to delete this assignment?')) {

        assignments.splice(index, 1);

        displayAssignments();

    }

}


function toggleAssignment(index) {

    assignments[index].status =
        assignments[index].status === 'Completed'
            ? 'Pending'
            : 'Completed';

    displayAssignments();

}


/* =========================================
   7. TO-DO LIST
========================================= */

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

let tasks = getData('studentTasks');


function displayTasks() {

    taskList.innerHTML = '';

    if (tasks.length === 0) {

        taskList.appendChild(
            createElement('p', 'empty-message', 'No tasks added yet.')
        );

    }

    tasks.forEach((task, index) => {

        const item = createElement('div', 'task-item');

        if (task.completed) {
            item.classList.add('completed');
        }

        const details = createElement('div');

        details.appendChild(
            createElement('h4', '', task.title)
        );

        details.appendChild(
            createElement('p', '', 'Due: ' + formatDate(task.date))
        );

        const actions = createElement('div', 'task-actions');

        const completeBtn = createButton(
            task.completed ? 'Undo' : 'Complete',
            '',
            () => completeTask(index)
        );

        const deleteBtn = createButton(
            'Delete',
            'delete-btn',
            () => deleteTask(index)
        );

        actions.append(completeBtn, deleteBtn);

        item.append(details, actions);

        taskList.appendChild(item);

    });

    const pendingTasks = tasks.filter(task => !task.completed).length;

    document.getElementById('taskCount').textContent = pendingTasks;

    saveData('studentTasks', tasks);

}


taskForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const title = document.getElementById('taskInput').value.trim();

    const date = document.getElementById('taskDate').value;

    if (!title) return;

    tasks.push({
        title,
        date,
        completed: false
    });

    taskForm.reset();

    displayTasks();

});


function completeTask(index) {

    tasks[index].completed = !tasks[index].completed;

    displayTasks();

}


function deleteTask(index) {

    if (confirm('Delete this task?')) {

        tasks.splice(index, 1);

        displayTasks();

    }

}


/* =========================================
   8. MY NOTES
========================================= */

const noteForm = document.getElementById('noteForm');
const noteList = document.getElementById('noteList');

let notes = getData('studentNotes');


function displayNotes() {

    noteList.innerHTML = '';

    if (notes.length === 0) {

        noteList.appendChild(
            createElement('p', 'empty-message', 'No notes saved yet.')
        );

    }

    notes.forEach((note, index) => {

        const card = createElement('div', 'note-card');

        card.appendChild(
            createElement('h4', '', note.title)
        );

        card.appendChild(
            createElement('p', '', note.content)
        );

        const deleteBtn = createButton(
            'Delete Note',
            'delete-btn',
            () => deleteNote(index)
        );

        card.appendChild(deleteBtn);

        noteList.appendChild(card);

    });

    document.getElementById('noteCount').textContent = notes.length;

    saveData('studentNotes', notes);

}


noteForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const title = document.getElementById('noteTitle').value.trim();

    const content = document.getElementById('noteContent').value.trim();

    if (!title || !content) return;

    notes.push({
        title,
        content
    });

    noteForm.reset();

    displayNotes();

    alert('Note saved successfully!');

});


function deleteNote(index) {

    if (confirm('Are you sure you want to delete this note?')) {

        notes.splice(index, 1);

        displayNotes();

    }

}


/* =========================================
   9. STUDY MATERIALS
========================================= */

const materialForm = document.getElementById('materialForm');
const materialList = document.getElementById('materialList');

let materials = getData('studentMaterials');


function displayMaterials() {

    materialList.innerHTML = '';

    if (materials.length === 0) {

        materialList.appendChild(
            createElement('p', 'empty-message', 'No study materials added.')
        );

    }

    materials.forEach((material, index) => {

        const item = createElement('div', 'material-item');

        item.appendChild(
            createElement('h4', '', material.name)
        );

        item.appendChild(
            createElement('p', '', 'Subject: ' + material.subject)
        );

        const link = createElement('a', '', 'Open Study Material');

        link.href = material.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const deleteBtn = createButton(
            'Delete',
            'delete-btn',
            () => deleteMaterial(index)
        );

        item.append(link, deleteBtn);

        materialList.appendChild(item);

    });

    saveData('studentMaterials', materials);

}


materialForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const name = document.getElementById('materialName').value.trim();

    const subject = document.getElementById('materialSubject').value.trim();

    const link = document.getElementById('materialLink').value.trim();

    try {

        const url = new URL(link);

        if (!['http:', 'https:'].includes(url.protocol)) {
            alert('Please enter a valid HTTP or HTTPS link.');
            return;
        }

    } catch (error) {

        alert('Please enter a valid material URL.');
        return;

    }

    materials.push({
        name,
        subject,
        link
    });

    materialForm.reset();

    displayMaterials();

    alert('Study material added successfully!');

});


function deleteMaterial(index) {

    if (confirm('Delete this study material?')) {

        materials.splice(index, 1);

        displayMaterials();

    }

}


/* =========================================
   10. CALENDAR AND EVENTS
========================================= */

const eventForm = document.getElementById('eventForm');
const eventList = document.getElementById('eventList');

let events = getData('studentEvents');


function displayEvents() {

    eventList.innerHTML = '';

    if (events.length === 0) {

        eventList.appendChild(
            createElement('p', 'empty-message', 'No events added yet.')
        );

    }

    events.forEach((event, index) => {

        const item = createElement('div', 'event-item');

        const details = createElement('div');

        details.appendChild(
            createElement('h4', '', event.title)
        );

        details.appendChild(
            createElement('p', '', formatDate(event.date))
        );

        details.appendChild(
            createElement('p', '', event.description || 'No description')
        );

        const deleteBtn = createButton(
            'Delete',
            'delete-btn',
            () => deleteEvent(index)
        );

        item.append(details, deleteBtn);

        eventList.appendChild(item);

    });

    saveData('studentEvents', events);

}


eventForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();

    const date = document.getElementById('eventDate').value;

    const description =
        document.getElementById('eventDescription').value.trim();

    if (!title || !date) return;

    events.push({
        title,
        date,
        description
    });

    eventForm.reset();

    displayEvents();

    displayDashboard();

    alert('Event added successfully!');

});


function deleteEvent(index) {

    if (confirm('Delete this event?')) {

        events.splice(index, 1);

        displayEvents();

        displayDashboard();

    }

}


/* =========================================
   11. ANNOUNCEMENTS
========================================= */

const announcementForm =
    document.getElementById('announcementForm');

const announcementList =
    document.getElementById('announcementList');

let announcements = getData('studentAnnouncements');


function displayAnnouncements() {

    announcementList.innerHTML = '';

    if (announcements.length === 0) {

        announcementList.appendChild(
            createElement('p', 'empty-message', 'No announcements yet.')
        );

    }

    announcements.forEach((announcement, index) => {

        const item = createElement('div', 'announcement-item');

        const details = createElement('div');

        details.appendChild(
            createElement('h4', '', announcement.title)
        );

        details.appendChild(
            createElement('p', '', announcement.message)
        );

        const deleteBtn = createButton(
            'Delete',
            'delete-btn',
            () => deleteAnnouncement(index)
        );

        item.append(details, deleteBtn);

        announcementList.appendChild(item);

    });

    saveData('studentAnnouncements', announcements);

}


announcementForm.addEventListener('submit', (event) => {

    event.preventDefault();

    const title =
        document.getElementById('announcementTitle').value.trim();

    const message =
        document.getElementById('announcementMessage').value.trim();

    if (!title || !message) return;

    announcements.unshift({
        title,
        message
    });

    announcementForm.reset();

    displayAnnouncements();

    displayDashboard();

    alert('Announcement added successfully!');

});


function deleteAnnouncement(index) {

    if (confirm('Delete this announcement?')) {

        announcements.splice(index, 1);

        displayAnnouncements();

        displayDashboard();

    }

}


/* =========================================
   12. DASHBOARD ACTIVITIES
========================================= */

function displayDashboard() {

    const activityBox =
        document.getElementById('dashboardActivities');

    const announcementBox =
        document.getElementById('dashboardAnnouncements');

    activityBox.innerHTML = '';
    announcementBox.innerHTML = '';

    // Upcoming events
    const upcomingEvents = [...events]
        .filter(event => event.date >= new Date().toLocaleDateString('en-CA'))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4);

    if (upcomingEvents.length === 0) {

        activityBox.appendChild(
            createElement('p', 'empty-message', 'No upcoming activities yet.')
        );

    } else {

        upcomingEvents.forEach(event => {

            const item = createElement('div', 'event-item');

            item.appendChild(
                createElement('h4', '', event.title)
            );

            item.appendChild(
                createElement('p', '', formatDate(event.date))
            );

            activityBox.appendChild(item);

        });

    }


    // Recent announcements
    const recentAnnouncements = announcements.slice(0, 4);

    if (recentAnnouncements.length === 0) {

        announcementBox.appendChild(
            createElement('p', 'empty-message', 'No announcements available.')
        );

    } else {

        recentAnnouncements.forEach(announcement => {

            const item = createElement('div', 'announcement-item');

            item.appendChild(
                createElement('h4', '', announcement.title)
            );

            item.appendChild(
                createElement('p', '', announcement.message)
            );

            announcementBox.appendChild(item);

        });

    }

}


/* =========================================
   13. LOAD ALL SAVED DATA
========================================= */

function loadDashboard() {

    displayAssignments();

    displayTasks();

    displayNotes();

    displayMaterials();

    displayEvents();

    displayAnnouncements();

    displayDashboard();

}


// Start dashboard
loadDashboard();


/* =========================================
   PROJECT COMPLETED
========================================= */

console.log('Md Irfan Student Dashboard Loaded Successfully!');
