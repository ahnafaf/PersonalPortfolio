

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
        description: "Born in Dhaka, the vibrant capital of Bangladesh. The city's bustling streets, colorful rickshaws, and the aroma of street food would have been my first sensory experiences. Though I was too young to remember, this diverse and lively city set the stage for my multicultural journey."
    },
    {
        name: 'Dubai, United Arab Emirates',
        lat: 19.4752,
        lon: 140.0686,
        age: '3 months old',
        description: 'Moved to Dubai at just 3 months old. My parents, full of hope and ambition, started our new life in a modest 1-bedroom apartment. Growing up in this futuristic city, I witnessed its rapid transformation from desert to a global metropolis. The blend of traditional Arab culture with modern architecture and international influences shaped my early worldview.'
    },
    {
        name: 'New York, United States',
        lat: 34.9451,
        lon: 12.8719,
        age: '17',
        description: 'At 17, I embarked on a life-changing trip to New York City. The energy of the Big Apple was intoxicating - from the towering skyscrapers to the diverse neighborhoods and the melting pot of cultures. This experience opened my eyes to new possibilities and ignited a desire to pursue education in North America. The stark contrast to Dubai made me appreciate both cultures and fueled my curiosity to learn more about Western education and lifestyle.'
    },
    {
        name: 'Manitoba, Canada',
        lat: 39.5288,
        lon: -8.9005,
        age: '20',
        description: "At 20, I made the bold move to Manitoba, Canada, to pursue a Computer Science degree at the University of Manitoba. The adjustment from the desert climate of Dubai to the harsh Canadian winters was challenging but exhilarating. Over the past two years, I've immersed myself in a new culture, joined various student groups, and built a diverse network of friends from around the world. The Canadian emphasis on multiculturalism has allowed me to embrace my background while integrating into a new society. My journey in tech has been both challenging and rewarding, opening doors to innovative projects and potential career paths I never imagined."
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

    if (isMobile()) {
        document.addEventListener('touchstart', onTouchStart, false);
        document.addEventListener('touchmove', onTouchMove, false);
        document.addEventListener('touchend', onTouchEnd, false);
    } else {
        window.addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mouseup', onMouseUp, false);
    }
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


function handleInteraction(direction) {
    if (isPanning) return;
    isPanning = true;

    if (!isZoomedIn) {
        zoomInAndPan();
    } else {
        if (direction === 'right') {
            zoomOutAndRotate(1);  // Move forward
        } else if (direction === 'left') {
            zoomOutAndRotate(-1);  // Move backward
        }
    }

    setTimeout(() => { isPanning = false; }, 1500);
}


function zoomInAndPan() {
    const aspect = window.innerWidth / window.innerHeight;
    const isMobile = aspect < 1;
    const yOffset = isMobile ? -0.5 : 0;
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
        }
    });
}

function zoomOutAndRotate(direction) {
    currentEventIndex = (currentEventIndex + direction + lifeEvents.length) % lifeEvents.length;
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
            hideInfoPanel();
            updateInfoPanel(nextEvent);
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
    const textArea = document.getElementById('textArea');
    if (isMobile()) {
        textArea.style.transform = 'translateY(0)';
    } else {
        textArea.style.transform = 'translateX(0)';
    }
}

function hideInfoPanel() {
    const textArea = document.getElementById('textArea');
    if (isMobile()) {
        textArea.style.transform = 'translateY(100%)';
    } else {
        textArea.style.transform = 'translateX(100%)';
    }
}

let touchStartX;

function onTouchStart(event) {
    touchStartX = event.touches[0].clientX;
}

function onTouchMove(event) {
    if (isPanning) return;
    event.preventDefault();
}

function onTouchEnd(event) {
    if (isPanning) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    if (deltaX > 50) {
        handleInteraction('right');
    }
}

let mouseStartX;
let isMouseDown = false;

function onMouseDown(event) {
    isMouseDown = true;
    mouseStartX = event.clientX;
}

function onMouseMove(event) {
    if (!isMouseDown || isPanning) return;
}

function onMouseUp(event) {
    if (!isMouseDown || isPanning) return;
    
    const mouseEndX = event.clientX;
    const deltaX = mouseEndX - mouseStartX;
    
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            handleInteraction('right');
        } else {
            handleInteraction('left');
        }
    }

    isMouseDown = false;
}

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navContainer = document.querySelector('.nav-container');

    mobileMenu.addEventListener('click', function() {
        navContainer.classList.toggle('active');
    });
});

  
init();
animate();
