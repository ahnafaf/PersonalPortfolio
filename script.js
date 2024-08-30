let scene, camera, renderer, earthMesh;
let mixer, clock;
let starField;
const starCount = 12000;
const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 2;
const ZOOM_SPEED = 0.1;

let currentEventIndex = 0;
let defaultZoom, zoomedInZoom;
let animationSpeed = 0.25;
let isZoomedIn = false;
let isPanning = false;

const lifeEvents = [
    {
        name: 'Dhaka, Bangladesh',
        lat: 15.0906,
        lon: 192.3428,
        age: '0',
        description: "Born in Dhaka, in the vibrant capital of Bangladesh. I begun my life here, while I did have a very short stay here. I visited family every year after moving to Dubai. Embracing my time with my cousins and reflecting on how different both the countries can be."
    },
    {
        name: 'Dubai, United Arab Emirates',
        lat: 19.4752,
        lon: 140.0686,
        age: '3 months old',
        description: 'Moved to Dubai at just 3 months old. My parents, full of hope and ambition, started our new life in a modest environment. Growing up surrounded by tall sky scrapers juxtaposed by small cornershops, I witnessed its immense growth and development. The blend of traditional Arab culture with international influences shaped my early worldview.'
    },
    {
        name: 'New York, United States',
        lat: 34.9451,
        lon: 12.8719,
        age: '17 years old',
        description: 'At 17, I embarked on a trip to the United States with my family. During my trip here, going across to diners, strip malls and taking in the cultural influence helped me realize that it would ultimately be one of my dream desires to be able to study and gain experience somewhere within North America.'
    },
    {
        name: 'Manitoba, Canada',
        lat: 39.5288,
        lon: -8.9005,
        age: '20 years old',
        description: "I had moved to Canada, to pursue a Computer Science degree at the University of Manitoba. The adjustment from the desert climate of Dubai to the harsh Canadian winters was challenging but exhilarating. Over the past two years, I've immersed myself in a new culture, joined various student groups, and built a diverse network of friends from around the world. The Canadian emphasis on multiculturalism has allowed me to embrace my background while integrating into a new society. My journey so far has been both challenging and rewarding, where I hope that I can continue to work with people from all walks of life."
    }
];

function isMobile() {
    return window.innerWidth <= 768;
}

function calculateZoomLevels() {
    const aspect = window.innerWidth / window.innerHeight;
    const baseZoom = Math.max(2, 3 - aspect);
    defaultZoom = baseZoom;
    zoomedInZoom = baseZoom * 0.6;

    if (isMobile()) {
        defaultZoom *= 1.2;
        zoomedInZoom *= 1.2;
    }
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    calculateZoomLevels();
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, defaultZoom);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    createStarField();
    clock = new THREE.Clock();

    // Create a LoadingManager
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    loadingManager.onLoad = function () {
        console.log('Loading complete!');
        document.getElementById('loadingScreen').style.display = 'none'; // Hide the loading screen when loading is complete
    };

    loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
        const progress = (itemsLoaded / itemsTotal) * 100;
        document.getElementById('loadingBar').style.width = progress + '%';
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    loadingManager.onError = function (url) {
        console.log('There was an error loading ' + url);
    };

    const loader = new THREE.GLTFLoader(loadingManager);
    loader.load(
        './models/scene.gltf',
        function (gltf) {
            earthMesh = gltf.scene;
            earthMesh.scale.set(0.4, 0.4, 0.4);
            scene.add(earthMesh);
            positionEarthToEvent(lifeEvents[currentEventIndex]);
            updateInfoPanel(lifeEvents[currentEventIndex]);

            mixer = new THREE.AnimationMixer(earthMesh);
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.setEffectiveTimeScale(animationSpeed);
                action.play();
            });
        },
        function (xhr) {
            const progress = (xhr.loaded / xhr.total) * 100;
            document.getElementById('loadingBar').style.width = progress + '%';
            console.log(progress);
        },
        function (error) {
            console.error('An error happened', error);
        }
    );

    setupLighting();

    window.addEventListener('resize', onWindowResize, false);
}

function setupLighting() {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.5);
    scene.add(hemisphereLight);

    const softLight = new THREE.PointLight(0x404040, 0.5);
    softLight.position.set(-5, -3, -5);
    scene.add(softLight);
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < starCount; i++) {
        vertices.push(Math.random() * 2000 - 1000, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 2, sizeAttenuation: true });
    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

function positionEarthToEvent(event) {
    if (!earthMesh) return;
    earthMesh.rotation.x = THREE.MathUtils.degToRad(event.lat);
    earthMesh.rotation.y = -THREE.MathUtils.degToRad(event.lon);

    const aspect = window.innerWidth / window.innerHeight;
    if (aspect < 1) {
        earthMesh.position.y = 0;
    } else {
        earthMesh.position.y = 0;
    }
}


function zoomInAndPan() {
    const aspect = window.innerWidth / window.innerHeight;
    const isMobile = aspect < 1;
    const yOffset = isMobile ? +0.3 : 0;
    const xOffset = isMobile ? 0 : -0.25;
    
    gsap.to(camera.position, { 
        z: zoomedInZoom, 
        duration: 3.3, 
        ease: "power2.inOut" 
    });
    gsap.to(earthMesh.position, {
        x: xOffset,
        y: yOffset,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => { 
            isZoomedIn = true;
            showInfoPanel();
            if (isMobile) {
                moveArrowsUp();
            }
        }
    });
}

function zoomOutAndRotate(direction) {
    currentEventIndex = (currentEventIndex + direction + lifeEvents.length) % lifeEvents.length;
    const nextEvent = lifeEvents[currentEventIndex];
    hideInfoPanel();

    gsap.to(camera.position, { 
        z: defaultZoom, 
        duration: 1.5, 
        ease: "power2.inOut",
        onComplete: () => {
            showSwipeText(); // Show the swipe text when zooming out
        }
    });
    gsap.to(earthMesh.position, { 
        x: 0, 
        y: 0, 
        duration: 1.5, 
        ease: "power2.inOut" 
    });
    gsap.to(earthMesh.rotation, {
        x: THREE.MathUtils.degToRad(nextEvent.lat),
        y: -THREE.MathUtils.degToRad(nextEvent.lon),
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
            isZoomedIn = false;
            // Add a delay before updating the info panel
            gsap.delayedCall(0.5, () => { // Adjust the delay duration as needed
                updateInfoPanel(nextEvent);
            });
            if (isMobile) {
                moveArrowsDown();
            }
        }
    });
}




function updateInfoPanel(event) {
    const textArea = document.getElementById('textArea');
    textArea.innerHTML = `
        <h2>${event.name}</h2>
        <p>Age: ${event.age}</p>
        <p>${event.description}</p>
    `;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    calculateZoomLevels();

    camera.position.z = defaultZoom;

    if (earthMesh) positionEarthToEvent(lifeEvents[currentEventIndex]);
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    if (starField) starField.rotation.y -= 0.00008;
    renderer.render(scene, camera);
}

function setAnimationSpeed(speed) {
    animationSpeed = speed;
    if (mixer) {
        mixer.timeScale = speed;
    }
}

function showInfoPanel() {
    hideDesktopArrow();
 
    const textArea = document.getElementById('textArea');
    if (isMobile()) {
        gsap.to(textArea, { duration: 0.5, y: 0, ease: "power4.out" });
    } else {
        gsap.to(textArea, { duration: 0.5, x: 0, ease: "power4.out" });
    }
    hideSwipeText(); // Hide the swipe text when the info panel is shown
}


function hideInfoPanel() {
    showDesktopArrow();
    const textArea = document.getElementById('textArea');
    if (isMobile()) {
        gsap.to(textArea, { duration: 0.5, y: '100%', ease: "power4.in" });
    } else {
        gsap.to(textArea, { duration: 0.5, x: '100%', ease: "power4.in" });
    }
}





const funnyTexts = [
    "Filling up the oceans...",
    "Blowing the clouds...",
    "Sculpting the mountains...",
    "Planting the forests...",
    "Painting the deserts..."
];

function showSwipeText() {
    const swipeText = document.getElementById('swipeText');
    swipeText.style.opacity = '1';
}

function hideSwipeText() {
    const swipeText = document.getElementById('swipeText');
    swipeText.style.opacity = '0';
}


function updateFunnyText() {
    const funnyTextElement = document.getElementById('funnyText');
    const randomIndex = Math.floor(Math.random() * funnyTexts.length);
    funnyTextElement.textContent = funnyTexts[randomIndex];
}


// Function to move arrows up
function moveArrowsUp() {
    gsap.to('.controls', {
        bottom: "70%", // Adjust this value as needed
        duration: 1.5,
        ease: "power2.out"
    });
}

// Function to move arrows down
function moveArrowsDown() {
    gsap.to('.controls', {
        bottom: '1%', // Adjust this value as needed
        duration: 1.5,
        ease: "power2.out"
    });
}

function hideDesktopArrow() {
    if (!isMobile) {
        const rightArrow = document.getElementById('right-arrow');
        swipeText.style.opacity = '0';    
    }
}

function showDesktopArrow() {
    if (!isMobile) {
        const rightArrow = document.getElementById('right-arrow');
        swipeText.style.opacity = '1';    
    }
}

// Event listeners for your navigation buttons and other shit

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-list a');
    const floatingWindows = document.querySelectorAll('.floating-window');
    const closeBtns = document.querySelectorAll('.close-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetWindow = document.getElementById(targetId + 'Page');
            if (targetWindow) {
                targetWindow.style.display = 'block';
                // Removed the generateProjectCards() call from here
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.floating-window').style.display = 'none';
        });
    });
});

function openWindow(windowId) {
    // If there's a window already open, close it
    if (currentOpenWindow) {
        document.getElementById(currentOpenWindow).style.display = 'none';
    }

    // Open the new window
    const windowToOpen = document.getElementById(windowId);
    windowToOpen.style.display = 'block';

    // Update the reference to the currently open window
    currentOpenWindow = windowId;
}

function closeWindow() {
    if (currentOpenWindow) {
        document.getElementById(currentOpenWindow).style.display = 'none';
        currentOpenWindow = null;
    }
}

let currentOpenWindow = null;

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navContainer = document.querySelector('.nav-container');

    mobileMenu.addEventListener('click', function() {
        navContainer.classList.toggle('active');
    });

    // Update funny text every 2 seconds
    setInterval(updateFunnyText, 2000);
});

document.getElementById('left-arrow').addEventListener('click', function() {
    if (isPanning) return;
    isPanning = true;

    if (!isZoomedIn) {
        zoomInAndPan();
    } else {
        zoomOutAndRotate(-1);  // Move backward
    }
    console.log('Left arrow clicked');
    isPanning = false;  // Reset panning status
});

document.getElementById('right-arrow').addEventListener('click', function() {
    if (isPanning) return;
    isPanning = true;

    if (!isZoomedIn) {
        zoomInAndPan();
    } else {
        zoomOutAndRotate(1);  // Move forward
    }
    console.log('Right arrow clicked');
    isPanning = false;  // Reset panning status
});



function openWindow(windowId) {
    // Hide all windows first
    document.querySelectorAll('.floating-window').forEach(window => {
        window.style.display = 'none';
    });

    // Show the selected window
    const windowToOpen = document.getElementById(windowId);
    if (windowToOpen) {
        windowToOpen.style.display = 'block';
    }
}


function closeWindow(windowId) {
    const windowToClose = document.getElementById(windowId);
    if (windowToClose) {
        windowToClose.style.display = 'none';
    }
    currentOpenWindow = null;
}



init();
animate();
