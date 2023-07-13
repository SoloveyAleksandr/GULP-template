// import * as THREE from "./three.module.min.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';

import * as THREE from "three";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo({
    top: 0,
  });

  // document.body.classList.add("_hidden");

  const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  let canvas, scene, camera, cameraWrapper, renderer;
  let loader, clock;
  let transformControl, orbitControl;

  let ambientLight, dirLight, spotLight;

  let avatar, skeleton, mixer;
  let avatarActions = {};
  let activeAction = "tPose";
  let prevAction = null;

  let table, chair;

  const tableTL = gsap.timeline({
    paused: true,
    finished: false,
    onComplete: () => {
      tableTL.finished = true;
    },
    onReverseComplete: () => {
      tableTL.finished = false;
    },
  });

  const tableAnimBtn = document.querySelector("[data-table-anim]");
  if (tableAnimBtn) {
    tableAnimBtn.addEventListener('click', () => {
      if (tableTL.finished) {
        tableTL.reverse();
      } else {
        tableTL.play();
      }
    });
  }

  init();

  function init() {

    canvas = document.getElementById("scene");
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, windowSize.width / windowSize.height, 1, 500);
    cameraWrapper = new THREE.Group();
    cameraWrapper.add(camera);
    scene.add(cameraWrapper);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext("webgl2"),
      antialias: true,
      alpha: true
    });
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    loader = new GLTFLoader();
    clock = new THREE.Clock();

    scene.background = new THREE.Color("#e2e2e2");
    scene.fog = new THREE.Fog("#e2e2e2", 1, 50);

    // глобальный свет
    ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);

    // направленый свет
    dirLight = new THREE.DirectionalLight("#ffffff", 0.5);
    dirLight.position.set(2, 2, -2);
    dirLight.castShadow = true;
    scene.add(dirLight);

    spotLight = new THREE.SpotLight("#b93a3a");
    dirLight.castShadow = true;
    scene.add(dirLight);

    // пол
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({
        color: "#c7c7c7",
      })
    );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    camera.position.set(-0.32455703955060344, 4.868967116532931, 4.3476857990988895);
    camera.rotation.set(-0.7623217702189572, 0.20440336509283258, 0.1914505610470401);
    // cameraWrapper.position.set(-0.32455703955060344, 4.868967116532931, 4.3476857990988895);
    // cameraWrapper.rotation.set(-0.7623217702189572, 0.20440336509283258, 0.1914505610470401);

    // Управление объектом
    // transformControl = new TransformControls(camera, renderer.domElement);
    if (transformControl) {
      transformControl.addEventListener('dragging-changed', (e) => transformHandler(e));
      function transformHandler(e) {
        orbitControl.enabled = !e.value;
        console.log("table position: ", table.position);
        console.log("table rotation: ", table.rotation);
      }
    }

    // Управление камерой
    // orbitControl = new OrbitControls(camera, renderer.domElement);
    if (orbitControl) {
      orbitControl.addEventListener('change', (e) => orbitHandler(e));
      function orbitHandler(e) {
        // console.log("camera position: ", camera.position);
        // console.log("camera rotation: ", camera.rotation);
      }
    }

    // Загрузка аватара
    loadAvatar();
    loadTable();
    loadChair();

    animate();
  }

  function loadAvatar() {
    loader.load("/assets/models/animAvatar/animAvatar.glb", function (gltf) {
      avatar = gltf.scene;

      // Подключение теней
      avatar.traverse(function (child) { child.castShadow = true; });
      scene.add(avatar);

      // Скелет
      skeleton = new THREE.SkeletonHelper(avatar);
      skeleton.visible = false;
      scene.add(skeleton);

      // Анимации
      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer(avatar);

      for (let i = 0; i !== animations.length; ++i) {
        let clip = animations[i];
        const name = clip.name;

        const action = mixer.clipAction(clip);

        avatarActions[name] = action;
      }

      console.log(avatarActions);

      prevAction = avatarActions["tPose"];
      activeAction = avatarActions["idle"];

      fadeToAction("walking_1", 0);
      start();

      // createControls();

    }, undefined, function (error) {
      console.error(error);
    });
  }

  function loadTable() {
    loader.load("/assets/models/table/scene.gltf", function (gltf) {
      table = gltf.scene;
      table.traverse(function (child) { child.castShadow = true; });

      // table.scale.set(0.9, 0.9, 0.9);
      table.scale.set(0, 0, 0);
      table.rotation.y = Math.PI;
      table.position.set(-0.10519360394371702, 0.6051190114344637, 0.4608406952617326);

      // transformControl.attach(table);
      // scene.add(transformControl);

      scene.add(table);

      tableTL.to(table.scale, {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration: 1,
        ease: "back.out(2)",
      }, "sin");

    }, undefined, function (error) {
      console.error(error);
    });
  }

  function loadChair() {
    loader.load("/assets/models/chair/scene.gltf", function (gltf) {
      chair = gltf.scene;
      chair.traverse(function (child) { child.castShadow = true; });

      // chair.scale.set(0.23, 0.23, 0.23);
      chair.scale.set(0, 0, 0);
      chair.position.set(0.01, 0, 0);

      // transformControl.attach(chair);
      // scene.add(transformControl);

      scene.add(chair);

      tableTL.to(chair.scale, {
        x: 0.23,
        y: 0.23,
        z: 0.23,
        duration: 1,
        ease: "back.out(2)",
      }, "sin");

    }, undefined, function (error) {
      console.error(error);
    });
  }

  // Переключение анимаций
  // function createControls() {
  //   const controls = document.querySelector(".controls");
  //   if (controls) {
  //     const keys = Object.keys(avatarActions);

  //     for (let i = 0; i < keys.length; i++) {
  //       const btn = document.createElement("button");
  //       btn.className = "controls__btn";

  //       btn.textContent = keys[i];
  //       btn.addEventListener("click", () => fadeToAction(keys[i], 0.8));

  //       controls.appendChild(btn);
  //     }
  //   }
  // }

  function fadeToAction(name, duration) {
    prevAction = activeAction;
    activeAction = avatarActions[name];

    if (prevAction !== activeAction) {
      prevAction.fadeOut(duration);
    }

    activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play()
  }

  // Animation render loop
  function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
      let mixerUpdateDelta = clock.getDelta();
      mixer.update(mixerUpdateDelta);
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    windowSize.width = window.innerWidth;
    windowSize.height = window.innerHeight;
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;
    renderer.setSize(windowSize.width, windowSize.height);
    camera.aspect = windowSize.width / windowSize.height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", onWindowResize, false);

  // GSAP
  function start() {
    const greetingTitle = document.querySelector(".greeting__title");
    const greetingText = document.querySelector(".greeting__text");

    const mainTL = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("_hidden");
      }
    });

    // Выход аватара 
    const avatarTL = gsap.timeline({
      onComplete: () => {
        fadeToAction("idle", 0.5);
      },
    })
    avatarTL.from(avatar.position, {
      x: 2,
      z: -5,
      duration: 8,
      ease: "none",
    }, "sin")
      .from(avatar.rotation, {
        y: -0.5,
        duration: 8,
        ease: "none",
      }, "sin")
      .to(avatar, {
        duration: 6,
        onStart: () => {
          fadeToAction("looking", 1);
        }
      })

    mainTL.add(avatarTL);

    // набор текста
    const titleTL = gsap.timeline({
      onStart: () => {
        greetingTitle.classList.remove("_hide-cursor");
        fadeToAction("hello", 0.5);
      },
      onComplete: () => {
        greetingTitle.classList.add("_hide-cursor");
        fadeToAction("idle", 1);
      }
    });
    titleTL.to(greetingTitle, {
      text: "Ghbdtn",
      duration: 1.5,
      delay: 2,
      repeat: 1,
      yoyo: true,
      ease: "none",
    })
      .to(greetingTitle, {
        text: "Привет",
        duration: 1.5,
        ease: "none",
      });

    mainTL.add(titleTL);

    const textTL = gsap.timeline({
      onStart: () => {
        greetingText.classList.remove("_hide-cursor");
      },
      onComplete: () => {
        greetingText.classList.add("_hide-cursor");
      }
    });
    textTL.from(greetingText, {
      text: "",
      duration: 5,
      ease: "none",
    });

    mainTL.add(textTL);
  }

  const about = document.querySelector(".about");

  const aboutTL = gsap.timeline({
    scrollTrigger: {
      trigger: about,
      start: "top bottom",
      end: "bottom bottom",
      markers: true,
      scrub: 1,
      onUpdate: (e) => {
        if (e.direction > 0) {
          gsap.to(avatar.rotation, {
            y: 0,
          })
        } else {
          gsap.to(avatar.rotation, {
            y: -Math.PI,
          })
        }
      },
      onEnter: () => {
        fadeToAction("walking_2", 1);;
      },
      onLeave: () => {
        fadeToAction("idle", 1);;
      },
      onEnterBack: () => {
        fadeToAction("walking_2", 1)
      },
      onLeaveBack: () => {
        fadeToAction("idle", 1);
        gsap.to(avatar.rotation, {
          y: 0,
        });
      },
    },
  });

  window.ambientLight = ambientLight;
  aboutTL.to(ambientLight, {
    intensity: 0,
  }, "sin").timeScale(3);

  aboutTL.to(cameraWrapper.position, {
    x: -1.5,
    y: 1,
    z: 3,
  }, "sin");
  aboutTL.to(cameraWrapper.rotation, {
    y: -1.8,
  }, "sin");

});