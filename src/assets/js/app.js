// import * as THREE from "./three.module.min.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';
// import * as THREE from 'https://cdn.skypack.dev/three@0.133.0/build/three.module.js';

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

document.addEventListener("DOMContentLoaded", () => {

  SmoothScroll({
    // Время скролла 400 = 0.4 секунды
    animationTime: 1000,
    // Размер шага в пикселях 
    stepSize: 60,

    // Дополнительные настройки:

    // Ускорение 
    accelerationDelta: 100,
    // Максимальное ускорение
    accelerationMax: 2,

    // Поддержка клавиатуры
    keyboardSupport: true,
    // Шаг скролла стрелками на клавиатуре в пикселях
    arrowScroll: 50,

    // Pulse (less tweakable)
    // ratio of "tail" to "acceleration"
    pulseAlgorithm: true,
    pulseScale: 4,
    pulseNormalize: 1,

    // Поддержка тачпада
    touchpadSupport: true,
  })

  const spinner = document.querySelector(".spinner");
  const loadingFill = document.querySelector(".spinner-loading__fill");

  const greetingTitle = document.querySelector(".greeting__title");
  const greetingText = document.querySelector(".greeting__text");

  const about = document.querySelector(".about");
  const aboutTitle = document.querySelector(".about__title");
  const aboutText = document.querySelector(".about__text");

  const loadingManager = new THREE.LoadingManager();
  const loader = new GLTFLoader(loadingManager);
  const fontLoader = new FontLoader(loadingManager);

  loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  };

  loadingManager.onLoad = function () {
    console.log('Loading complete!');
    spinner.classList.add("_load");
    animate();
    start();
  };

  loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    loadingFill.style.width = `calc(${itemsLoaded / (itemsTotal / 100)}% - 1.2rem)`;
  };

  loadingManager.onError = function (url) {
    console.log('There was an error loading ' + url);
  };

  const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  let canvas, scene, camera, cameraWrapper, renderer;
  let clock;
  let transformControl, orbitControl;

  let ambientLight, spotLight_1, spotLightTarget_1, spotLight_2, spotLightTarget_2, spotLight_3, spotLightTarget_3;

  let avatar, skeleton, mixer;
  let avatarActions = {};
  let activeAction = "tPose";
  let prevAction = null;

  let table, chair;

  let background;
  let curtainGroup, curtainLeft, curtainLeftMat, curtainRight, curtainRightMat, curtainMat;
  let stack, css, html, js, ts, react;

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

    clock = new THREE.Clock();

    scene.background = new THREE.Color("#1f1f1f");
    scene.fog = new THREE.Fog("#2b2b2b", 0.2, 22);

    // свет
    ambientLight = new THREE.AmbientLight("#ffffff", 0);
    scene.add(ambientLight);

    spotLightTarget_1 = new THREE.Object3D();

    spotLight_1 = new THREE.SpotLight("#ffffff");
    spotLight_1.position.y = 8;
    spotLight_1.position.x = 6;
    spotLight_1.position.z = -4;
    spotLight_1.intensity = 0.8;
    spotLight_1.angle = 0.2;
    spotLight_1.penumbra = 0.1;
    spotLight_1.distance = 35;
    spotLight_1.castShadow = true;
    spotLight_1.target = spotLightTarget_1;
    scene.add(spotLight_1.target);
    scene.add(spotLight_1);

    spotLightTarget_2 = new THREE.Object3D();
    scene.add(spotLightTarget_2);

    spotLight_2 = new THREE.SpotLight("#ffffff");
    spotLight_2.position.y = 8;
    spotLight_2.position.x = 2;
    spotLight_2.position.z = 5;
    spotLight_2.intensity = 0.8;
    spotLight_2.angle = 0.2;
    spotLight_2.penumbra = 0.1;
    spotLight_2.distance = 35;
    spotLight_2.castShadow = true;
    spotLight_2.target = spotLightTarget_2;
    scene.add(spotLight_2.target);
    scene.add(spotLight_2);

    spotLightTarget_3 = new THREE.Object3D();
    scene.add(spotLightTarget_3);

    spotLight_3 = new THREE.SpotLight("#ffffff");
    spotLight_3.position.y = 8;
    spotLight_3.position.x = -5;
    spotLight_3.position.z = 5;
    spotLight_3.intensity = 0.8;
    spotLight_3.angle = 0.2;
    spotLight_3.penumbra = 0.1;
    spotLight_3.distance = 35;
    spotLight_3.castShadow = true;
    spotLight_3.target = spotLightTarget_3;
    scene.add(spotLight_3.target);
    scene.add(spotLight_3);

    // пол
    const planeGeo = new THREE.PlaneGeometry(100, 100, 100, 100);
    const planeMat = new THREE.MeshStandardMaterial({
      color: "#c7c7c7",
      emissive: "#1b1b1b",
      roughness: 0,
      metalness: 0.4,
    });
    const plane = new THREE.Mesh(
      planeGeo,
      planeMat
    );

    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    camera.position.set(0, 5, 9);
    camera.rotation.set(-0.4, 0, 0);
  }

  loadAvatar();
  // loadTable();
  // loadChair();
  loadBackground();
  // loadCurtain();
  loadStack();

  function start() {
    // Занавес
    // const curtainTL = gsap.timeline({
    //   delay: 1,
    // })
    //   .to(curtainLeft.position, {
    //     x: -15,
    //     duration: 5,
    //     ease: "none",
    //   }, "sin")
    //   .to(curtainRight.position, {
    //     x: -2,
    //     duration: 5,
    //     ease: "none",
    //   }, "sin")
    //   .to(curtainMat, {
    //     opacity: 0,
    //     duration: 3,
    //     delay: 2,
    //     ease: "none",
    //   }, "sin");

    const lightsTL = gsap.timeline({
      delay: 2,
    })
      .from(spotLightTarget_1.position, {
        x: 8,
        z: 5,
        duration: 2.5,
        ease: "back.out(1.7)",
      }, "sin")
      .from(spotLightTarget_2.position, {
        x: -8,
        z: 5,
        duration: 3,
        ease: "back.out(1.4)",
      }, "sin")
      .from(spotLightTarget_3.position, {
        z: 5,
        duration: 2.8,
        ease: "back.out(1.6)",
      }, "sin");

    const greetingTL = gsap.timeline({
      delay: 1,
      onStart: () => {
        greetingTitle.classList.remove("_hide-cursor");
      },
    });
    const greetingTitleTL = gsap.timeline({
      delay: 2,
      onComplete: () => {
        greetingTitle.classList.add("_hide-cursor");
      }
    })
      .to(greetingTitle, {
        text: "Ghbdt",
        duration: 1.5,
        repeat: 1,
        yoyo: true,

      })
      .to(greetingTitle, {
        text: "Привет",
        delay: 1,
        duration: 1.5,
      });
    greetingTL.add(greetingTitleTL);

    const greetingTextTL = gsap.timeline({
      onStart: () => {
        greetingText.classList.remove("_hide-cursor");
      },
      onComplete: () => {
        greetingText.classList.add("_hide-cursor");
      }
    })
      .from(greetingText, {
        text: "",
        duration: 5,
      });
    greetingTL.add(greetingTextTL);

    const aboutTL = gsap.timeline({
      scrollTrigger: {
        trigger: about,
        scrub: true,
        start: "20% 90%",
        end: "bottom bottom"
      }
    })
      .from(aboutTitle, {
        // y: "100%",
        letterSpacing: "1rem",
        opacity: 0,
        ease: "none",
      }, "sin")
      .from(aboutText, {
        // y: "200%",
        scale: 0.6,
        opacity: 0,
        ease: "none",
      }, "sin");

    const backgroundTL = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        gsap.to(avatar.rotation, {
          y: 0,
          duration: 2,
        });
        fadeToAction("idle", 1);
      }
    })
      .to(background.position, {
        z: -8,
        duration: 17,
        ease: "none",
      });

    const cameraTL = gsap.timeline({
      scrollTrigger: {
        trigger: about,
        scrub: 2,
        onEnter: () => {
          // fadeToAction("walking_2", 1);
        },
        onLeave: () => {
          // fadeToAction("walking_1", 1);
        },
        onEnterBack: () => {
          // fadeToAction("walking_2", 1);
        },
        // onLeaveBack: () => {
        //   fadeToAction("idle", 1);
        //   gsap.to(avatar.rotation, {
        //     y: 0,
        //     duration: 2,
        //   });
        // },
        onUpdate: (e) => {
          if (e.direction > 0) {
            backgroundTL.play();

            gsap.to(avatar.rotation, {
              y: 0,
              duration: 1,
            });
          } else {
            backgroundTL.reverse();

            if (backgroundTL.isActive()) {
              gsap.to(avatar.rotation, {
                y: Math.PI,
                duration: 1,
              });
            }
          }

          if (backgroundTL.isActive()) {
            fadeToAction("walking_2", 1);
          } else {
            fadeToAction("idle", 1);
          }
        }
      }
    })
      .to(cameraWrapper.rotation, {
        y: -1.8,
        duration: 2,
      }, "sin")
      .to(cameraWrapper.position, {
        z: 2,
        duration: 2,
      }, "sin");
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
      activeAction = avatarActions["tPose"];

      fadeToAction("idle", 0);

    }, undefined, function (error) {
      console.error(error);
    });
  }

  function loadTable() {
    loader.load("/assets/models/table/scene.gltf", function (gltf) {
      table = gltf.scene;
      table.traverse(function (child) { child.castShadow = true; });

      table.scale.set(0.9, 0.9, 0.9);
      // table.scale.set(0, 0, 0);
      table.rotation.y = Math.PI;
      table.position.set(-0.10519360394371702, 0.6051190114344637, 0.4608406952617326);

      scene.add(table);

    }, undefined, function (error) {
      console.error(error);
    });
  }

  function loadChair() {
    loader.load("/assets/models/chair/scene.gltf", function (gltf) {
      chair = gltf.scene;
      chair.traverse(function (child) { child.castShadow = true; });

      chair.scale.set(0.23, 0.23, 0.23);
      // chair.scale.set(0, 0, 0);
      chair.position.set(0.01, 0, 0);

      scene.add(chair);

    }, undefined, function (error) {
      console.error(error);
    });
  }

  function loadBackground() {
    background = new THREE.Group();

    fontLoader.load("/assets/fonts/Tektur ExtraBold_Regular.json", function (font) {
      const group = new THREE.Group();

      const textGeo = createTextGeo(font, "Front", 3, 0.4);
      textGeo.computeBoundingBox();
      textGeo.computeVertexNormals();

      const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

      const front = new THREE.Mesh(
        textGeo,
        new THREE.MeshPhongMaterial({
          color: "#cccccc",
          emissive: "#000000",
          specular: "#ffffff",
        })
      );
      front.traverse(function (child) { child.castShadow = true; });
      front.position.set(0, 0, -2);

      group.position.x = -textWidth / 2;
      group.position.z = -5;
      group.add(front);

      loader.load("/assets/models/spotLight/scene.gltf", (gltf) => {
        for (let i = 0; i < 7; i++) {
          const model = gltf.scene.clone();
          model.scale.set(0.3, 0.3, 0.3);
          model.position.x = textWidth / 8 * (i + 1);
          model.rotation.y = Math.PI;

          const light = new THREE.SpotLight("#e4ffe4");
          const lightTarget = new THREE.Object3D();
          lightTarget.position.x = model.position.x;
          lightTarget.position.y = textGeo.boundingBox.max.y / 3;
          lightTarget.position.z = front.position.z;

          light.position.y = 0.1;
          light.position.x = model.position.x;
          light.position.z = -0.1;
          light.intensity = 0.3;
          light.angle = 0.7;
          light.penumbra = 0.2;
          light.distance = 4;
          light.castShadow = false;
          light.target = lightTarget;
          group.add(light.target);
          group.add(light);
          group.add(model);
        }
      });

      background.add(group);
    });

    fontLoader.load("/assets/fonts/Tektur ExtraBold_Regular.json", function (font) {
      const group = new THREE.Group();

      const textGeo = createTextGeo(font, "end", 1.5, 0.2);
      textGeo.computeBoundingBox();
      textGeo.computeVertexNormals();

      const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

      const end = new THREE.Mesh(
        textGeo,
        new THREE.MeshPhongMaterial({
          color: "#cccccc",
          emissive: "#000000",
          specular: "#ffffff",
        })
      );
      end.traverse(function (child) { child.castShadow = true; });
      end.position.set(0, 0, -2);

      group.position.z = -2;
      group.add(end);

      loader.load("/assets/models/spotLight/scene.gltf", (gltf) => {
        for (let i = 0; i < 3; i++) {
          const model = gltf.scene.clone();
          model.scale.set(0.3, 0.3, 0.3);
          model.position.x = textWidth / 3.5 * (i + 1);
          model.rotation.y = Math.PI;

          const light = new THREE.SpotLight("#ffe4e4");
          const lightTarget = new THREE.Object3D();
          lightTarget.position.x = model.position.x;
          lightTarget.position.y = textGeo.boundingBox.max.y / 3;
          lightTarget.position.z = end.position.z;

          light.position.y = 0.1;
          light.position.x = model.position.x;
          light.position.z = -0.1;
          light.intensity = 0.2;
          light.angle = 0.6;
          light.penumbra = 0.2;
          light.distance = 3;
          light.castShadow = false;
          light.target = lightTarget;
          group.add(light.target);
          group.add(light);
          group.add(model);
        }
      });

      background.add(group);
    });

    scene.add(background);
  }

  function loadCurtain() {
    curtainGroup = new THREE.Group();
    scene.add(curtainGroup);

    curtainMat = new THREE.MeshPhongMaterial({
      color: "#792626",
      emissive: "#000000",
      specular: "#914545",
      shininess: 26,
      transparent: true,
      opacity: 1,
    });

    loader.load("/assets/models/curtain/scene.gltf", function (gltf) {
      curtainLeft = gltf.scene.clone();
      curtainLeft.traverse(function (child) {
        child.castShadow = true;
        child.material = curtainMat;
        child.material.needsUpdate = true;
      });
      curtainLeft.scale.set(4, 1.2, 1.2);

      curtainLeft.position.x = -10;

      curtainGroup.add(curtainLeft);
    }, undefined, function (error) {
      console.error(error);
    });

    loader.load("/assets/models/curtain/scene.gltf", function (gltf) {
      curtainRight = gltf.scene.clone();
      curtainRight.traverse(function (child) {
        child.castShadow = true;
        child.material = curtainMat;
        child.material.needsUpdate = true;
      });
      curtainRight.scale.set(4, 1.2, 1.2);

      curtainRight.position.x = -7;
      curtainRight.position.z = 0.3;

      curtainGroup.add(curtainRight);
    }, undefined, function (error) {
      console.error(error);
    });

    curtainGroup.position.y = 1;
    curtainGroup.position.z = 3;
  }

  function loadStack() {
    stack = new THREE.Group();
    scene.add(stack);
    stack.position.x = 5;
    stack.rotation.y = -Math.PI / 2;

    const textMat = new THREE.MeshPhongMaterial({
      color: "#cccccc",
      emissive: "#000000",
      specular: "#ffffff",
    });

    fontLoader.load("/assets/fonts/Tektur ExtraBold_Regular.json", function (font) {
      {
        const group = new THREE.Group();
        group.position.z = -5;

        const textGeo = createTextGeo(font, "HTML", 3, 0.4);
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

        const front = new THREE.Mesh(
          textGeo,
          textMat,
        );
        front.traverse(function (child) { child.castShadow = true; });
        front.position.set(-textWidth / 2, 0, 0);

        const light = new THREE.SpotLight("#ff0000");
        const lightTarget = new THREE.Object3D();
        lightTarget.position.x = front.position.x + textWidth / 2;
        lightTarget.position.z = front.position.z - 2;

        light.position.x = front.position.x + textWidth / 2;
        light.position.y = textGeo.boundingBox.max.y + 1;
        light.position.z = front.position.z + 2;
        light.intensity = 10;
        light.angle = 1;
        light.penumbra = 0.2;
        light.distance = 20;
        light.castShadow = true;
        light.target = lightTarget;

        group.add(light.target);
        group.add(light);
        group.add(front);

        stack.add(group);
      }

      {
        const group = new THREE.Group();
        group.position.z = -2;
        group.position.x = 1;

        const textGeo = createTextGeo(font, "CSS", 2, 0.4);
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;

        const front = new THREE.Mesh(
          textGeo,
          textMat,
        );
        front.traverse(function (child) { child.castShadow = true; });
        front.position.set(-textWidth / 2, 0, 0);

        const light = new THREE.SpotLight("#09ff00");
        const lightTarget = new THREE.Object3D();
        lightTarget.position.x = front.position.x + textWidth / 2;
        lightTarget.position.z = front.position.z - 2;

        light.position.x = front.position.x + textWidth / 2;
        light.position.y = textGeo.boundingBox.max.y + 1;
        light.position.z = front.position.z + 2;
        light.intensity = 1;
        light.angle = 0.6;
        light.penumbra = 0.2;
        light.distance = 5;
        light.castShadow = true;
        light.target = lightTarget;

        group.add(light.target);
        group.add(light);
        group.add(front);

        stack.add(group);
      }
    });
  }

  function createTextGeo(font, text, size, height) {
    const textGeo = new TextGeometry(text, {
      font,
      size,
      height,
    });
    return textGeo;
  }

  function fadeToAction(name, duration) {
    prevAction = activeAction;
    activeAction = avatarActions[name];

    if (prevAction !== activeAction) {
      prevAction.fadeOut(duration);

      activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play()
    }
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

});