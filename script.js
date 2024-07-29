let scene, camera, renderer, earthMesh;
let debugMode = true; // Set this to true for coordinate debugging
let mixer;
let clock;
let animationSpeed = 0.2; // 0.5 means half speed, adjust as needed
let starField;
const starCount = 12000;

const lifeEvents = [
    { name: 'Dhaka, Bangladesh', lat: 15.0906, lon: 192.3428, age: '0', description: 'Born in Bangladesh' },
    { name: 'Dubai, United Arab Emirates', lat: 19.4752, lon: 140.0686, age: '3 months old', description: 'Moved to Dubai at 3 months old, parents had started their lives in a small 1 bedroom apartment.' },
    { name: 'New York, United States', lat: 34.9451, lon: 12.8719, age: 'Later', description: 'Flew out on a trip to America, this is when I realized that as much as I loved Dubai. \nI would want to be able to pursue my education in North America and learn more about its culture.' },
    { name: 'Manitoba, Canada', lat: 39.5288, lon: -8.9005, age: 'Later', description: 'Swag' }
];

let currentEventIndex = 0;
let minZoom = 1.2;
let maxZoom = 3;
let currentZoom = 1.5;

let manualRotationX = 0;
let manualRotationY = 0;

let rotationSpeed = 0.001; // Adjust this value to change rotation speed
let isRotating = true;

function init() {
    console.log("Initializing...");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);  // Set background to black
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, currentZoom);

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
            positionEarthToEvent(lifeEvents[currentEventIndex], false);
            updateInfoPanel(lifeEvents[currentEventIndex]);

            // Set up animation
            mixer = new THREE.AnimationMixer(earthMesh);
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.setEffectiveTimeScale(animationSpeed);
                action.play();
            });

            console.log("Animations:", gltf.animations);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
        }
    );

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x333333));

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onScroll, { passive: false });

    if (debugMode) {
        setupDebugControls();
    }

    setupDraggable();

    console.log("Initialization complete");
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 2,
        sizeAttenuation: true
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

function setupDebugControls() {
    window.addEventListener('keydown', onKeyDown);
    updateDebugPanel();
}

function setupDraggable() {
    interact('.draggable').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        autoScroll: true,
        listeners: {
            move: dragMoveListener,
        }
    });
}

function dragMoveListener(event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function onKeyDown(event) {
    const rotationStep = 0.01;
    switch(event.key) {
        case 'ArrowUp':
            manualRotationX -= rotationStep;
            break;
        case 'ArrowDown':
            manualRotationX += rotationStep;
            break;
        case 'ArrowLeft':
            manualRotationY -= rotationStep;
            break;
        case 'ArrowRight':
            manualRotationY += rotationStep;
            break;
        case 's':
            saveCurrentRotation();
            break;
    }
    updateEarthRotation();
    updateDebugPanel();
}

function updateEarthRotation() {
    if (earthMesh) {
        earthMesh.rotation.x = manualRotationX;
        earthMesh.rotation.y = manualRotationY;
    }
}

function saveCurrentRotation() {
    const event = lifeEvents[currentEventIndex];
    event.lat = THREE.MathUtils.radToDeg(manualRotationX);
    event.lon = -THREE.MathUtils.radToDeg(manualRotationY);
    console.log(`Saved coordinates for ${event.name}: lat ${event.lat}, lon ${event.lon}`);
    updateDebugPanel();
}

function updateDebugPanel() {
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel) {
        const currentEvent = lifeEvents[currentEventIndex];
        debugPanel.innerHTML = `
            <h3>Debug Info</h3>
            <p>Current Event: ${currentEvent.name}</p>
            <p>Age: ${currentEvent.age}</p>
            <p>Rotation X: ${manualRotationX.toFixed(4)}</p>
            <p>Rotation Y: ${manualRotationY.toFixed(4)}</p>
            <p>Saved Lat: ${currentEvent.lat.toFixed(4)}</p>
            <p>Saved Lon: ${currentEvent.lon.toFixed(4)}</p>
            <p>Use arrow keys to rotate. Press 'S' to save coordinates.</p>
        `;
    }
}

function positionEarthToEvent(event, animate = true) {
    if (!earthMesh) return;

    isRotating = false; // Stop the rotation

    const targetRotationX = THREE.MathUtils.degToRad(event.lat);
    const targetRotationY = -THREE.MathUtils.degToRad(event.lon);

    if (animate) {
        gsap.to(earthMesh.rotation, {
            x: targetRotationX,
            y: targetRotationY,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                console.log(`Arrived at ${event.name}`);
                updateInfoPanel(event);
                manualRotationX = targetRotationX;
                manualRotationY = targetRotationY;
                updateDebugPanel();
                isRotating = true; // Resume rotation after arriving at the event
            }
        });
    } else {
        earthMesh.rotation.x = targetRotationX;
        earthMesh.rotation.y = targetRotationY;
        manualRotationX = targetRotationX;
        manualRotationY = targetRotationY;
        updateDebugPanel();
        isRotating = true; // Resume rotation immediately for non-animated positioning
    }
}

function onScroll(event) {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
        let zoomDelta = event.deltaY * 0.0005;
        currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + zoomDelta));
        animateZoom(currentZoom);
    } else {
        if (event.deltaY > 0) {
            currentEventIndex = (currentEventIndex + 1) % lifeEvents.length;
        } else {
            currentEventIndex = (currentEventIndex - 1 + lifeEvents.length) % lifeEvents.length;
        }
        positionEarthToEvent(lifeEvents[currentEventIndex]);
    }
}

function animateZoom(targetZoom) {
    gsap.to(camera.position, {
        z: targetZoom,
        duration: 0.5,
        ease: "power2.out"
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }


    if (starField) {
        starField.rotation.y -= 0.00008; // Rotate the starfield
    }

    renderer.render(scene, camera);
}

function updateInfoPanel(event) {
    const infoPanel = document.getElementById('info');
    infoPanel.innerHTML = `
        <h2>${event.name}</h2>
        <p>Age: ${event.age}</p>
        <p>${event.description}</p>
        <p>Latitude: ${event.lat.toFixed(4)}</p>
        <p>Longitude: ${event.lon.toFixed(4)}</p>
    `;
}

function toggleRotation() {
    isRotating = !isRotating;
}

function setAnimationSpeed(speed) {
    animationSpeed = speed;
    if (mixer) {
        mixer.timeScale = speed;
    }
}

init();
animate();

console.log("Script execution completed");
