let camera, scene, renderer;
let container;
let uniforms;
// let starGeo, stars;

let loader = new THREE.TextureLoader();
let texture, bg;
loader.setCrossOrigin("anonymous");
loader.load(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
    (tex) => {
        texture = tex;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        loader.load(
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/clouds-1-tile.jpg',
            (tex) => {
                bg = tex;
                bg.wrapS = THREE.RepeatWrapping;
                bg.wrapT = THREE.RepeatWrapping;
                bg.minFilter = THREE.LinearFilter;
                init();
                animate();
                // animate1();
            }
        );
    }
);

function init() {
    container = document.getElementById('container');
    scene = new THREE.Scene();

    camera = new THREE.Camera();
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;


    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_noise: { type: "t", value: texture },
        u_bg: { type: "t", value: bg },
        u_mouse: { type: "v2", value: new THREE.Vector2() },
        u_scroll: { type: 'f', value: 0 }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    material.extensions.derivatives = true;

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    console.log(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);


    //   /////////////////////////////

    // starGeo = new THREE.Geometry();
    // for (let i = 0; i < 6000; i++) {
    //     star = new THREE.Vector3(
    //         Math.random() * 600 - 300,
    //         Math.random() * 600 - 300,
    //         Math.random() * 600 - 300
    //     );
    //     star.velocity = 0;
    //     star.acceleration = 0.02;
    //     starGeo.vertices.push(star);
    // }
    // let sprite = new THREE.TextureLoader().load('star.png');
    // let starMaterial = new THREE.PointsMaterial({
    //     color: 0xaaaaaa,
    //     size: 0.7,
    //     map: sprite
    // });

    // stars = new THREE.Points(starGeo, starMaterial);
    // scene.add(stars)
    // stars.position.x = 2;
    // console.log(stars);
    // console.log(stars.position);


    //   /////////////////////////////

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('pointermove', (e) => {
        let ratio = window.innerHeight / window.innerWidth;
        uniforms.u_mouse.value.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
        uniforms.u_mouse.value.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1;

        e.preventDefault();
    });
}

function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate(delta) {
    requestAnimationFrame(animate);
    render(delta);
}

// function animate1() {
//     starGeo.vertices.forEach(p => {
//         p.velocity += p.acceleration;
//         p.y -= p.velocity;
//         if (p.y < - 200) {
//             p.y = 200;
//             p.velocity = 0;
//         }
//     });
//     starGeo.verticesNeedUpdate = true;
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate1);
// }





let capturer = new CCapture({
    verbose: true,
    framerate: 60,
    // motionBlurFrames: 4,
    quality: 90,
    format: 'webm',
    workersPath: 'js/'
});
let capturing = false;

isCapturing = function (val) {
    if (val === false && window.capturing === true) {
        capturer.stop();
        capturer.save();
    } else if (val === true && window.capturing === false) {
        capturer.start();
    }
    capturing = val;
}
toggleCapture = function () {
    isCapturing(!capturing);
}

window.addEventListener('keyup', function (e) { if (e.keyCode == 68) toggleCapture(); });

let then = 0;
function render(delta) {

    uniforms.u_time.value = -1000 + delta * 0.0005;
    uniforms.u_scroll.value = window.scrollY;
    renderer.render(scene, camera);

    if (capturing) {
        capturer.capture(renderer.domElement);
    }
}