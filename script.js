let scene, camera, renderer, earthMesh;
let mixer, clock;
let starField;
const starCount = 12000;
const MIN_ZOOM_FACTOR = 0.5;  // Minimum zoom (furthest out)
const MAX_ZOOM_FACTOR = 2;    // Maximum zoom (closest in)
const ZOOM_SPEED = 0.1;       // How fast we zoom

const lifeEvents = [
    { name: 'Dhaka, Bangladesh', lat: 15.0906, lon: 192.3428, age: '0', description: 'Born in Bangladesh' },
    { name: 'Dubai, United Arab Emirates', lat: 19.4752, lon: 140.0686, age: '3 months old', description: 'Moved to Dubai at 3 months old, parents had started their lives in a small 1 bedroom apartment.' },
    { name: 'New York, United States', lat: 34.9451, lon: 12.8719, age: 'Later', description: 'Flew out on a trip to America, this is when I realized that as much as I loved Dubai. \nI would want to be able to pursue my education in North America and learn more about its culture.' },
    { name: 'Manitoba, Canada', lat: 39.5288, lon: -8.9005, age: 'Later', description: 'Swag' }
];

let currentEventIndex = 0;
let defaultZoom, zoomedInZoom;
let animationSpeed = 0.25; // Default speed, adjust as needed
let isZoomedIn = false;
let isPanning = false;

function isMobile() {
    return window.innerWidth <= 768; // You can adjust this breakpoint as needed
}

function calculateZoomLevels() {
    const aspect = window.innerWidth / window.innerHeight;
    const baseZoom = Math.max(2, 3 - aspect);
    defaultZoom = baseZoom;
    zoomedInZoom = baseZoom * 0.6;  // Closer zoom

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

    const loader = new THREE.GLTFLoader();
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
        undefined,
        function (error) {
            console.error('An error happened', error);
        }
    );

    setupLighting();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onScroll, { passive: false });
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
    if (aspect < 1) {  // For portrait and square-ish windows
        earthMesh.position.y = 0; // Start centered vertically
    } else {
        earthMesh.position.y = 0;
    }
}

function onScroll(event) {
    event.preventDefault();
    if (isPanning) return;
    isPanning = true;

    if (!isZoomedIn) {
        zoomInAndPan();
    } else {
        zoomOutAndRotate();
    }

    setTimeout(() => { isPanning = false; }, 1500);
}

function zoomInAndPan() {
    const aspect = window.innerWidth / window.innerHeight;
    const isMobile = aspect < 1;
    const yOffset = isMobile ? -0.5 : 0; // Vertical offset for mobile
    const xOffset = isMobile ? 0 : -0.25; // Horizontal offset for desktop
    
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
        onComplete: () => { isZoomedIn = true; }
    });
}

function zoomOutAndRotate() {
    currentEventIndex = (currentEventIndex + 1) % lifeEvents.length;
    const nextEvent = lifeEvents[currentEventIndex];

    gsap.to(camera.position, { 
        z: defaultZoom, 
        duration: 1.5, 
        ease: "power2.inOut" 
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
            updateInfoPanel(nextEvent);
        }
    });
}


function updateInfoPanel(event) {
    const infoPanel = document.getElementById('info');
    infoPanel.innerHTML = `
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

    // Reset to current event position
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

init();
animate();