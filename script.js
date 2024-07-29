let scene, camera, renderer, earthMesh;

const countries = [
    { name: 'Bangladesh', lat: 23.685, lon: 90.3563 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { name: 'USA', lat: 37.0902, lon: -95.7129 },
    { name: 'Canada', lat: 56.1304, lon: -106.3468 }
];

let currentCountryIndex = 0;
let minZoom = 1.2;
let maxZoom = 3;
let currentZoom = 1.5;

function init() {
    console.log("Initializing...");

    scene = new THREE.Scene();
    console.log("Scene created:", scene);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, currentZoom);
    console.log("Camera created:", camera);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    console.log("Renderer created:", renderer);
    console.log("Canvas:", renderer.domElement);

    const loader = new THREE.GLTFLoader();
    loader.load(
        './models/scene.gltf',
        function (gltf) {
            earthMesh = gltf.scene;
            earthMesh.scale.set(0.4, 0.4, 0.4);  // Significantly increased scale
            scene.add(earthMesh);
            console.log("Earth model loaded and added to scene:", earthMesh);
            
            positionEarthToCountry(countries[currentCountryIndex], false);
            updateInfoPanel(countries[currentCountryIndex]);
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
    console.log("Lights added to scene");

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onScroll, { passive: false });

    console.log("Initialization complete");
}

function positionEarthToCountry(country, animate = true) {
    if (!earthMesh) return;

    const latitude = country.lat * (Math.PI / 180);
    const longitude = country.lon * (Math.PI / 180);

    const targetRotationY = -longitude;
    const targetRotationX = latitude;

    if (animate) {
        gsap.to(earthMesh.rotation, {
            x: targetRotationX,
            y: targetRotationY,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                console.log(`Arrived at ${country.name}`);
                console.log(`Earth rotation: x: ${earthMesh.rotation.x}, y: ${earthMesh.rotation.y}`);
                updateInfoPanel(country);
            }
        });
    } else {
        earthMesh.rotation.y = targetRotationY;
        earthMesh.rotation.x = targetRotationX;
    }
}

function onScroll(event) {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
        let zoomDelta = event.deltaY * 0.0005;  // Reduced zoom sensitivity
        currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + zoomDelta));
        animateZoom(currentZoom);
    } else {
        if (event.deltaY > 0) {
            currentCountryIndex = (currentCountryIndex + 1) % countries.length;
        } else {
            currentCountryIndex = (currentCountryIndex - 1 + countries.length) % countries.length;
        }
        positionEarthToCountry(countries[currentCountryIndex]);
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
    renderer.render(scene, camera);
}

function updateInfoPanel(country) {
    const infoPanel = document.getElementById('info');
    infoPanel.innerHTML = `
        <h2>${country.name}</h2>
        <p>Latitude: ${country.lat}</p>
        <p>Longitude: ${country.lon}</p>
    `;
}

init();
animate();

console.log("Script execution completed");
