const projectsData = [
    {
        name: "Dashcam Footage Analyzer",
        desc: "A tool that analyzes dashcam footage for safety and insurance purposes.",
        img_name: "dashcam-image.jpg"
    },
    {
        name: "CData",
        desc: "A comprehensive data management and analysis platform.",
        img_name: "cdata-image.jpg"
    },
    {
        name: "Last Stop",
        desc: "An innovative public transportation app for efficient travel planning.",
        img_name: "last-stop-image.jpg"
    },
    {
        name: "GlobeNews",
        desc: "A global news aggregator with personalized content delivery.",
        img_name: "globenews-image.jpg"
    },
    {
        name: "Job Fit",
        desc: "An AI-powered job matching platform for job seekers and employers.",
        img_name: "job-fit-image.jpg"
    }
];

function generateProjectCards() {
    const projectGrid = document.getElementById('projectGrid');
    if (!projectGrid) {
        console.error('Project grid element not found');
        return;
    }

    projectGrid.innerHTML = ''; // Clear existing content

    projectsData.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        card.innerHTML = `
            <img src="${project.img_name}" alt="${project.name}" class="project-image">
            <div class="project-content">
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.desc}</p>
                <a href="${project.link}" class="project-link" target="_blank">View Project</a>
            </div>
        `;

        projectGrid.appendChild(card);
    });
}

function openWindow(windowId) {
    // Hide all windows first
    document.querySelectorAll('.floating-window').forEach(window => {
        window.style.display = 'none';
    });

    // Show the selected window
    const windowToOpen = document.getElementById(windowId);
    if (windowToOpen) {
        windowToOpen.style.display = 'block';
        
        // Generate project cards if opening the projects window
        if (windowId === 'projectsWindow') {
            generateProjectCards();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners for navigation links
    document.getElementById('aboutLink').addEventListener('click', (e) => {
        e.preventDefault();
        openWindow('aboutWindow');
    });

    document.getElementById('contactLink').addEventListener('click', (e) => {
        e.preventDefault();
        openWindow('contactWindow');
    });

    document.getElementById('projectsLink').addEventListener('click', (e) => {
        e.preventDefault();
        openWindow('projectsWindow');
    });

    // Set up event listeners for close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.floating-window').style.display = 'none';
        });
    });

    // Generate cards if the projects window is open on load (unlikely, but just in case)
    const projectsWindow = document.getElementById('projectsWindow');
    if (projectsWindow && window.getComputedStyle(projectsWindow).display !== 'none') {
        generateProjectCards();
    }
});
