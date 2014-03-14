'use strict';

// globals
var scene, camera, renderer, controls;

function Text(value) {
    this.mesh = null;

    this.text = value.toUpperCase();
    this.size = 20;
    this.height = 5;
    this.font = 'helvetiker';
    this.style = 'normal';
    this.color = 0x00ff00;

    function genTextMat(word) {
        return new THREE.MeshBasicMaterial({color: word.color, overdraw: true});
    }

    function genTextGeo(word) {
        //TODO: var value = word.text ? word.text : ' ';
        var params = {
            size: word.size,
            height: word.height,
            curveSegments: 12,
            font: word.font
        };

        if (word.style === 'italic') {
            params.style = word.style;
        } else {
            params.weight = word.style;
        }

        var geo = new THREE.TextGeometry(word.text, params);
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
        this.mesh.position.y += (30 + 10);
        return this.mesh;
    }
}

function Frames(file) {
    this.mesh = null;

    this.path = file;
    this.size = 5;
    this.color = 0x00ff00;
    this.style = 'normal';

    this.geometry = genNormalFrames(50, 20, 40, 120, this.size, 5);
    //this.material = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true});
    this.material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });

    // var loader = new THREE.STLLoader();

    // // closure to update the geometry when the file loads
    // var frames = this;
    // function onLoad(e) {
    //     frames.geometry = e.content;
    //     THREE.GeometryUtils.center(frames.geometry);
    //     
    //     scene.remove(frames.mesh);
    //     
    //     var mesh = frames.build();
    //     mesh.rotation.y = Math.PI;
    //     scene.add(mesh);
    // }
    // loader.addEventListener('load', onLoad);
    // loader.load(file);

    function genNormalFrames(eye, bridge, height, arm, size, thickness) {
        var triangleShape = new THREE.Shape();

        // eye = 50, bridge = 20, height = 40, arm = 140
        // size = how wide to make frame, 5
        // thickness = z-height for extrusion, 5

        //---------- front ------------//
        var width = (eye * 2) + bridge;
        // frames
        triangleShape.moveTo(0, 0);                      //lower left
		triangleShape.lineTo(0, height);                 //upper left
        triangleShape.lineTo(width, height);             //upper rigt
        triangleShape.lineTo(width, 0);                  //lower right
        triangleShape.lineTo(eye + bridge, 0);
        triangleShape.lineTo(eye + bridge,
                                height - (2 * size));    // bridge
        triangleShape.lineTo(eye, height - (2 * size));
        triangleShape.lineTo(eye, 0);
        triangleShape.lineTo(0, 0);                      //close it up

        // left hole
        var leftHole = new THREE.Path();
        leftHole.moveTo(size, size);
        leftHole.lineTo(eye - size, size);
        leftHole.lineTo(eye - size, height - size);
        leftHole.lineTo(size, height - size);
        leftHole.lineTo(size, size);
        triangleShape.holes.push(leftHole);

        // right hole
        var rightHole = new THREE.Path();
        rightHole.moveTo(eye + bridge + size, size);
        rightHole.lineTo(width - size, size);
        rightHole.lineTo(width - size, height - size);
        rightHole.lineTo(eye + bridge + size, height - size);
        rightHole.lineTo(eye + bridge + size, size);
        triangleShape.holes.push(rightHole);

        var extrudeSettings = {
            amount: thickness,
            //bevelThickness: 0,
            //bevelSize: 0,
            //bevelSegments : 0,
            bevelEnabled: false,
            curveSegments: 12,
            steps: 1
        };
        var frontGeo = triangleShape.extrude(extrudeSettings);


        //---------- left arm ------------//
        var armShape = new THREE.Shape();
        armShape.moveTo(0, height);
        armShape.lineTo(-size, height);
        armShape.lineTo(-size, height - size);
        armShape.lineTo(0, height - size);
        armShape.lineTo(0, height);

        var leftArmGeo = armShape.extrude({amount: arm, bevelEnabled: false});


        //---------- right arm ------------//
        var armShape2 = new THREE.Shape();
        armShape2.moveTo(width, height);
        armShape2.lineTo(width + size, height);
        armShape2.lineTo(width + size, height - size);
        armShape2.lineTo(width, height - size);
        armShape2.lineTo(width, height);

        var rightArmGeo = armShape2.extrude({amount: arm, bevelEnabled: false});

        var geo = frontGeo; // set front as the parent for the merge
        THREE.GeometryUtils.merge(geo, leftArmGeo);
        THREE.GeometryUtils.merge(geo, rightArmGeo);
        THREE.GeometryUtils.center(geo);
        return geo;
    }

    this.update = function() {
    }

    // Construct the mesh object
    this.build = function(e) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.y = Math.PI;
        this.mesh.position.z = -70;
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
    } else if (word.color === 0x0000ff) {
        word.color = 0xff0000;
    } else {
        word.color = 0x00ff00;
    }
    word.update();
});

//document.getElementById('glasses').addEventListener('click', function(e) {
//    // do nothing for now
//});

document.getElementById('font').addEventListener('click', function(e) {
    if (word.font === 'helvetiker') {
        word.font = 'optimer';
    } else if (word.font === 'optimer') {
        word.font = 'gentilis';
    } else {
        word.font = 'helvetiker';
    }
    word.update();
});

document.getElementById('style').addEventListener('click', function(e) {
    if (word.style === 'normal') {
        word.style = 'bold';
    } else if (word.style === 'bold') {
        word.style = 'italic';
    } else {
        word.style = 'normal';
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
    
