import './styles.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Stats from 'three/examples/jsm/libs/stats.module';
import * as TWEEN from  'tween' ;
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { useState } from 'react';
let annotations
const annotationMarkers = [];

const backstate = [];
const scene = new THREE.Scene();
scene.background= new THREE.Color( 'skyblue' );
var light = new THREE.DirectionalLight(0x404040,4);
light.position.set(-10, 20, 10);
scene.add(light);
var light2 = new THREE.DirectionalLight(0x404040,4);
light2.position.set(10, 20, -10);
scene.add(light2);

let ambientLight = new THREE.AmbientLight(0x404040,2)
scene.add(ambientLight)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.fov=30;
camera.position.x = 0;
camera.position.y = 280;
camera.position.z = 0;

const deafult_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
deafult_camera.fov=30;
deafult_camera.position.x = 0;
deafult_camera.position.y = 280;
deafult_camera.position.z = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.dampingFactor = .1;
controls.enableDamping = true; 
controls.enablePan = true; 
controls.rotateSpeed = .5;
controls.target.set(0, 0, 0);


const raycaster = new THREE.Raycaster();
const sceneMeshes = new Array();
const circleTexture = new THREE.TextureLoader().load("img/circle.png");
//

const getnames = new THREE.FileLoader();
const progressBar = document.getElementById('progressBar');
const backButton = document.getElementById('backButton');
backstate.push(backButton);


let resourceData
let surroundData
getnames.setMimeType('json')
getnames.load('/surround.json', function (all) {
    surroundData = JSON.parse(all);  
    const gltfloader = new GLTFLoader();
    gltfloader.load(surroundData[0].path, function (gltf) {
        gltf.scene.position.copy(surroundData[0].position)
        scene.add(gltf.scene);
        sceneMeshes.push(gltf.scene)},
        undefined, function (error) { console.error(error); })})
        
getnames.load('/names.json', function (all) {

  
    resourceData = JSON.parse(all);  
    console.log( resourceData)
    annotations = resourceData;
    const gltfloader = new GLTFLoader();

    for (let i = 0; i < resourceData.length; i++) {
        gltfloader.load(resourceData[i].path, function (gltf) {
            //gltf.scene.scale.set(01, .01, .01)
            gltf.scene.position.copy(resourceData[i].position)
            scene.add(gltf.scene);
            sceneMeshes.push(gltf.scene);

        },
            undefined, function (error) { console.error(error); });

        //console.log('path', resourceData[i].path);
        //console.log('name', resourceData[i].name);
        //console.log('position', resourceData[i].position);
    }


    const annotationsPanel = document.getElementById("annotationsPanel");
    const ul = document.createElement("UL");
    const ulElem = annotationsPanel.appendChild(ul);
    backButton.addEventListener('click',function () { backDefault(); });
    

    Object.keys(annotations).forEach(a => {

        const li = document.createElement("UL");
        const liElem = ulElem.appendChild(li);
        const button = document.createElement("BUTTON");

        //button.innerHTML = a + " : " + annotations[a].name;
        button.innerHTML = a+': '+annotations[a].name;

        //console.log(annotations[a].name);
        button.className = "annotationButton";
        //button.addEventListener("click", function () { gotoAnnotation(annotations[a]); });
        button.addEventListener('click',function () {gotoAnnotation(annotations[a]); });
    
        liElem.appendChild(button);
        const annotationSpriteMaterial = new THREE.SpriteMaterial({
            map: circleTexture,
            depthTest: false,
            depthWrite: false,
            sizeAttenuation: false
        });
        const annotationSprite = new THREE.Sprite(annotationSpriteMaterial);
        annotationSprite.scale.set(.066, .066, .066);
        annotationSprite.position.copy(annotations[a].position);
        annotationSprite.position.y=(annotations[a].position.y+3)
        annotationSprite.userData.id = a;

        
        scene.add(annotationSprite);
        annotationMarkers.push(annotationSprite);
        //

        const annotationDiv = document.createElement('div');
        annotationDiv.className = 'annotationLabel';
        annotationDiv.innerHTML =  a;
        
        const annotationLabel = new CSS2DObject(annotationDiv);
        annotationLabel.position.copy(annotations[a].position);
        annotationLabel.position.y=(annotations[a].position.y+3)

        
        scene.add(annotationLabel);
        //scene.add(annotationName);
         

        const  annotationNameDiv = document.createElement('div');
     
        annotationNameDiv.className = 'annotationName';
        annotationNameDiv.innerHTML = annotations[a].name;
        annotationDiv.appendChild(annotationNameDiv);
        annotationDiv.addEventListener('mouseenter',function(event){annotationNameDiv.style.display='block'})
        annotationDiv.addEventListener('mouseleave',function(event){annotationNameDiv.style.display='none'})
        annotationDiv.addEventListener('click', function () { gotoAnnotation(annotations[a]); });
      

        
        if (annotations[a].description) {
            const annotationinfoDiv = document.createElement('div');
            annotationinfoDiv.className = 'annotationDescription';
            annotationinfoDiv.innerHTML = annotations[a].name
            const annotationDescriptionDiv = document.createElement('div');
            annotationDescriptionDiv.style.cssText='font-size: 20px; color: #545454; font-weight:normal;';
            annotationinfoDiv.appendChild(annotationDescriptionDiv);
            
            annotationDescriptionDiv.innerHTML = annotations[a].description;
            annotationDiv.appendChild(annotationinfoDiv);
            annotations[a].descriptionDomElement = annotationinfoDiv;
        }
    });
    progressBar.style.display = "none";
    
}
)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


   
renderer.domElement.addEventListener('click', onClick, false);

function onClick(event) {
    raycaster.setFromCamera({
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    }, camera);
    const intersects = raycaster.intersectObjects(annotationMarkers, true);
    
    if (intersects.length > 0) {
        if (intersects[0].object.userData && intersects[0].object.userData.id) {
            gotoAnnotation(annotations[intersects[0].object.userData.id]);

        }
    }

}


renderer.domElement.addEventListener('dblclick', onDoubleClick, false);


function onDoubleClick(event) {
    raycaster.setFromCamera({
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    }, camera);
    const intersects = raycaster.intersectObjects(sceneMeshes, true);
    if (intersects.length > 0) {
        const p = intersects[0].point;
        new TWEEN.Tween(controls.target)
            .to({
            x: p.x,
            y: p.y,
            z: p.z
        }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
    }

}

function backDefault(a) {


    new TWEEN.Tween(camera.position)
        .to({
        x: deafult_camera.position.x,
        y: deafult_camera.position.y,
        z: deafult_camera.position.z,
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({
            x: 0,
            y: 0,
            z: 0,
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
        
        Object.keys(annotations).forEach(annotation => {
            if (annotations[annotation].descriptionDomElement) {
                annotations[annotation].descriptionDomElement.style.display = "none";
            }
        });
   


}


function gotoAnnotation(a) {
    new TWEEN.Tween(camera.position)
        .to({
        x: a.position.x-30,
        y: a.position.y+30,
        z: a.position.z+30,
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    new TWEEN.Tween(controls.target)
        .to({
        x: a.position.x,
        y: a.position.y,
        z: a.position.z
    }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    Object.keys(annotations).forEach(annotation => {
        if (annotations[annotation].descriptionDomElement) {
            annotations[annotation].descriptionDomElement.style.display = "none";
        }
    });
    if (a.descriptionDomElement) {

        a.descriptionDomElement.style.display = "block";
    }

}

const stats = Stats();
document.body.appendChild(stats.dom);

var animate = function () {
    requestAnimationFrame(animate);
   
    controls.update();

    TWEEN.update();
    render();
    stats.update();

};

function render() {
   
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);
}

animate()
//render()