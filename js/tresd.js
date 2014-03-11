'use strict';

// globals
var scene, camera, renderer, controls;

function Text(value) {
    this.mesh = null;

    this.text = value.toUpperCase();
    this.size = 25;
    this.height = 5;
    this.font = 'helvetiker';
    this.color = 0x00ff00;

    function genTextMat(word) {
        return new THREE.MeshBasicMaterial({color: word.color, overdraw: true});
    }

    function genTextGeo(word) {
        //TODO: var value = word.text ? word.text : ' ';
        var geo = new THREE.TextGeometry(word.text, {
            size: word.size,
            height: word.height,
            curveSegments: 4,
            font: word.font
        });
        THREE.GeometryUtils.center(geo);
        return geo;
    }

    this.material = genTextMat(this);
    this.geometry = genTextGeo(this);

    this.update = function() {
        scene.remove(this.mesh);
        this.material = genTextMat(this);
        this.geometry = genTextGeo(this);
        scene.add(this.build());
    }

    this.build = function() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y += 40;
        return this.mesh;
    }
}

function Frames(file) {
    this.mesh = null;

    this.path = file;
    this.size = 10;
    this.color = 0x00ff00;

    this.geometry = new THREE.CubeGeometry(10, 10, 10);
    this.material = new THREE.MeshBasicMaterial({color: 0xffff00});

    var loader = new THREE.STLLoader();

    // closure to update the geometry when the file loads
    var frames = this;
    function onLoad(e) {
        frames.geometry = e.content;
        THREE.GeometryUtils.center(frames.geometry);
        
        scene.remove(frames.mesh);
        
        var mesh = frames.build();
        mesh.rotation.y = Math.PI;
        scene.add(mesh);
    }
    loader.addEventListener('load', onLoad);
    loader.load(file);

    // Construct the mesh object
    this.build = function(e) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        return this.mesh
    } 
}

function render() {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
    controls.update();
}

//--------- init -----------//
console.log('loading...');
var viewPanel = document.getElementById('viewer');
var vw = viewPanel.offsetWidth;
var vh = viewPanel.offsetHeight;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(90, vw/vh, 1, 1000);

//renderer = new THREE.WebGLRenderer();
renderer = new THREE.CanvasRenderer();
renderer.setSize(vw, vh);
viewPanel.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);

var frames = new Frames('stl/glasses_2.stl');
scene.add(frames.build());

var word = new Text('Denny');
scene.add(word.build());

camera.position.z = 80;

// display it
render();



//--------- inputs -----------//
document.getElementById('color').addEventListener('click', function(e) {
    if (word.color === 0x00ff00) {
        word.color = 0x0000ff;
    }
    else if (word.color === 0x0000ff) {
        word.color = 0xff0000;
    } else {
        word.color = 0x00ff00;
    }
    word.update();
});


// correct backspace key behavior
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 8) {
        e.preventDefault();
        if (word.text.length != 0) {
            word.text = word.text.slice(0, -1);
            word.update();
        }
        return false;
    }
    console.log('not bs');
});

document.addEventListener('keypress', function(e) {
    var key = e.which;
    if (key === 8) {
        // kill this
        console.log('wrong. is bs.');
        e.preventDefault();
    } else {
        word.text += String.fromCharCode(key).toUpperCase();
        word.update();
        console.log('updated', word.text);
    }
});
    
