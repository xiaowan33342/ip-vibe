const projects = {
  mallow: {
    tag: "2026.03 / Long-term IP",
    title: "麦洛小屋 Mallow Nook",
    text: "一封来自柔软日常的小屋来信，构建可以短暂停靠的治愈系小世界。",
    href: "#mallow",
  },
  rumi: {
    tag: "2025 / Character IP",
    title: "Rumi",
    text: "从角色气质、表情系统到盲盒与包装，展示单角色 IP 的产品化路径。",
    href: "#rumi",
  },
  ambagel: {
    tag: "2026.06 / Brand Identity",
    title: "AMBagel",
    text: "早安贝果品牌概念，重点展示 Logo、品牌识别和商业应用场景。",
    href: "#ambagel",
  },
  xigou: {
    tag: "2026.05 / Cultural Product",
    title: "白衣红陶细狗",
    text: "从文物造型特征出发，转译为更亲近日常的书签与中性笔产品。",
    href: "#xigou",
  },
  qingliang: {
    tag: "2025.03-04 / Cultural Tourism",
    title: "一念清凉",
    text: "只保留 C 端与 G 端两套核心产品方案，围绕五台山清凉意象展开。",
    href: "#qingliang",
  },
};

const notes = document.querySelectorAll(".project-note");
const projectPeek = document.querySelector("#projectPeek");
const desk = document.querySelector("#desk");

function openProject(projectId) {
  const project = projects[projectId];
  if (!project) return;

  notes.forEach((note) => {
    note.classList.toggle("active", note.dataset.project === projectId);
  });

  if (projectPeek) {
    projectPeek.classList.remove("is-changing");
    void projectPeek.offsetWidth;
    projectPeek.classList.add("is-changing");
    projectPeek.setAttribute("href", project.href);
    projectPeek.setAttribute("aria-label", `打开项目：${project.title}`);
  }
}

notes.forEach((note) => {
  note.addEventListener("click", () => {
    const projectId = note.dataset.project;
    openProject(projectId);
    document.querySelector(projects[projectId].href)?.scrollIntoView({ behavior: "smooth" });
  });
  note.addEventListener("mouseenter", () => openProject(note.dataset.project));
  note.addEventListener("focus", () => openProject(note.dataset.project));
});

if (desk) {
  desk.addEventListener("mousemove", (event) => {
    const rect = desk.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    desk.style.setProperty("--tilt-x", `${y * -2}deg`);
    desk.style.setProperty("--tilt-y", `${x * 2}deg`);
  });
}

const navLinks = Array.from(document.querySelectorAll(".quick-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setCurrentNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("current", link.getAttribute("href") === `#${sectionId}`);
  });
};

const standardSections = sections.filter((section) => section.id !== "cover" && section.id !== "about");

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (!visible) return;
    setCurrentNav(visible.target.id);
  },
  { rootMargin: "-28% 0px -68% 0px", threshold: 0 },
);

standardSections.forEach((section) => observer.observe(section));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coverAboutSequence = document.querySelector(".cover-about-sequence");
const coverAboutStage = document.querySelector("#coverAboutStage");
const aboutAnchor = document.querySelector("#about");
const folderTrigger = document.querySelector("#folderTrigger");

if (coverAboutSequence && coverAboutStage && aboutAnchor && folderTrigger) {
  let sequenceFrame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothStep = (start, end, value) => {
    const position = clamp((value - start) / (end - start));
    return position * position * (3 - 2 * position);
  };

  const updateCoverAboutSequence = () => {
    const sequenceRect = coverAboutSequence.getBoundingClientRect();
    const maxTravel = Math.max(1, sequenceRect.height - window.innerHeight);
    const progress = clamp(-sequenceRect.top / maxTravel);

    const coverExit = reduceMotion ? Number(progress >= 0.18) : smoothStep(0.04, 0.27, progress);
    const sheetRise = reduceMotion ? Number(progress >= 0.3) : smoothStep(0.14, 0.58, progress);
    const folderDrop = reduceMotion ? Number(progress >= 0.48) : smoothStep(0.54, 0.7, progress);
    const metaReveal = reduceMotion ? Number(progress >= 0.34) : smoothStep(0.46, 0.58, progress);
    const portraitReveal = reduceMotion ? Number(progress >= 0.38) : smoothStep(0.49, 0.66, progress);
    const copyReveal = reduceMotion ? Number(progress >= 0.42) : smoothStep(0.54, 0.7, progress);
    const skillsReveal = reduceMotion ? Number(progress >= 0.46) : smoothStep(0.63, 0.76, progress);

    coverAboutStage.style.setProperty("--cover-opacity", (1 - coverExit).toFixed(4));
    coverAboutStage.style.setProperty("--cover-y", `${(-46 * coverExit).toFixed(2)}px`);
    coverAboutStage.style.setProperty("--sheet-y", `${((1 - sheetRise) * 100).toFixed(3)}svh`);
    coverAboutStage.style.setProperty("--folder-y", `${(122 * folderDrop).toFixed(2)}px`);
    coverAboutStage.style.setProperty("--about-stage-y", `${(72 * sheetRise).toFixed(2)}px`);
    coverAboutStage.style.setProperty("--about-meta", metaReveal.toFixed(4));
    coverAboutStage.style.setProperty("--about-portrait", portraitReveal.toFixed(4));
    coverAboutStage.style.setProperty("--about-copy", copyReveal.toFixed(4));
    coverAboutStage.style.setProperty("--about-skills", skillsReveal.toFixed(4));
    coverAboutStage.classList.toggle("about-is-open", progress >= 0.58);

    const navLine = window.innerHeight * 0.3;
    if (sequenceRect.top <= navLine && sequenceRect.bottom > navLine) {
      setCurrentNav(progress < 0.32 ? "cover" : "about");
    }
  };

  const requestSequenceUpdate = () => {
    window.cancelAnimationFrame(sequenceFrame);
    sequenceFrame = window.requestAnimationFrame(updateCoverAboutSequence);
  };

  const openAboutSheet = () => {
    aboutAnchor.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  folderTrigger.addEventListener("click", openAboutSheet);
  folderTrigger.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openAboutSheet();
  });

  window.addEventListener("scroll", requestSequenceUpdate, { passive: true });
  window.addEventListener("resize", requestSequenceUpdate);
  updateCoverAboutSequence();
}

const mallowHero = document.querySelector("#mallowHero");
const mallowIntro = document.querySelector("#mallowIntro");

if (mallowHero && mallowIntro) {
  mallowHero.classList.add("is-intro-pending");

  let introSeen = false;
  try {
    introSeen = window.sessionStorage.getItem("mallowIntroSeen") === "1";
  } catch {
    introSeen = false;
  }

  const finishMallowIntro = () => {
    mallowHero.classList.remove("is-intro-pending");
    mallowHero.classList.add("is-revealed");
    mallowIntro.classList.add("is-complete");
  };

  const playMallowIntro = () => {
    if (reduceMotion || introSeen) {
      finishMallowIntro();
      return;
    }

    mallowHero.classList.add("is-intro-playing");
    try {
      window.sessionStorage.setItem("mallowIntroSeen", "1");
    } catch {
      // The animation still works when session storage is unavailable.
    }
    window.setTimeout(finishMallowIntro, 3200);
  };

  const heroObserver = new IntersectionObserver(
    (entries, observerInstance) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observerInstance.disconnect();
      playMallowIntro();
    },
    { threshold: 0.28 },
  );

  heroObserver.observe(mallowHero);
}

const mallowCharacterSection = document.querySelector("#mallow-characters");

if (mallowCharacterSection) {
  mallowCharacterSection.classList.add("is-reveal-pending");
  const characterSectionObserver = new IntersectionObserver(
    (entries, observerInstance) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      mallowCharacterSection.classList.add("is-visible");
      observerInstance.disconnect();
    },
    { threshold: 0.16 },
  );
  characterSectionObserver.observe(mallowCharacterSection);
}

const characterLabels = Array.from(document.querySelectorAll(".character-label"));

function closeCharacterLabels(except = null) {
  characterLabels.forEach((label) => {
    if (label === except) return;
    label.classList.remove("is-open");
    label.setAttribute("aria-expanded", "false");
  });
}

characterLabels.forEach((label) => {
  label.addEventListener("click", () => {
    const shouldOpen = !label.classList.contains("is-open");
    closeCharacterLabels(label);
    label.classList.toggle("is-open", shouldOpen);
    label.setAttribute("aria-expanded", String(shouldOpen));
  });

  label.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    label.click();
  });
});

const mallowAppTrack = document.querySelector("#mallowAppTrack");
const mallowLilaEntry = document.querySelector("#mallowLilaEntry");
const mallowAppNext = document.querySelector("#mallowAppNext");
const mallowAppProgress = Array.from(document.querySelectorAll(".mallow-app-progress span"));

if (mallowAppTrack) {
  let activeAppScene = 0;
  let appStoryActivated = false;
  let scrollFrame = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let wheelLockedUntil = 0;

  const updateAppProgress = () => {
    activeAppScene = Math.max(0, Math.min(2, Math.round(mallowAppTrack.scrollLeft / mallowAppTrack.clientWidth)));
    mallowAppProgress.forEach((item, index) => item.classList.toggle("active", index === activeAppScene));
  };

  const goToAppScene = (index) => {
    activeAppScene = Math.max(0, Math.min(2, index));
    appStoryActivated = true;
    mallowAppTrack.classList.add("is-active");
    mallowAppTrack.scrollTo({
      left: activeAppScene * mallowAppTrack.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    mallowAppProgress.forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === activeAppScene));
  };

  mallowLilaEntry?.addEventListener("click", () => goToAppScene(1));
  mallowAppNext?.addEventListener("click", () => goToAppScene(2));

  const activateAppControlWithKeyboard = (control, action) => {
    control?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      action();
    });
  };

  activateAppControlWithKeyboard(mallowLilaEntry, () => goToAppScene(1));
  activateAppControlWithKeyboard(mallowAppNext, () => goToAppScene(2));

  mallowAppTrack.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(updateAppProgress);
  });

  mallowAppTrack.addEventListener(
    "wheel",
    (event) => {
      if (!appStoryActivated) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const maxScroll = mallowAppTrack.scrollWidth - mallowAppTrack.clientWidth;
      const canMoveForward = delta > 0 && mallowAppTrack.scrollLeft < maxScroll - 2;
      const canMoveBack = delta < 0 && mallowAppTrack.scrollLeft > 2;
      if (!canMoveForward && !canMoveBack) return;
      event.preventDefault();
      if (Date.now() < wheelLockedUntil || Math.abs(delta) < 8) return;
      wheelLockedUntil = Date.now() + 700;
      goToAppScene(activeAppScene + (delta > 0 ? 1 : -1));
    },
    { passive: false },
  );

  mallowAppTrack.addEventListener("keydown", (event) => {
    if (!appStoryActivated) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToAppScene(activeAppScene + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToAppScene(activeAppScene - 1);
    }
  });

  mallowAppTrack.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.target.closest("button, a")) return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = mallowAppTrack.scrollLeft;
    mallowAppTrack.setPointerCapture(event.pointerId);
  });

  mallowAppTrack.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    appStoryActivated = true;
    mallowAppTrack.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  const finishAppDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    if (mallowAppTrack.hasPointerCapture(event.pointerId)) {
      mallowAppTrack.releasePointerCapture(event.pointerId);
    }
    goToAppScene(Math.round(mallowAppTrack.scrollLeft / mallowAppTrack.clientWidth));
  };

  mallowAppTrack.addEventListener("pointerup", finishAppDrag);
  mallowAppTrack.addEventListener("pointercancel", finishAppDrag);

  window.addEventListener("resize", () => {
    mallowAppTrack.scrollTo({ left: activeAppScene * mallowAppTrack.clientWidth, behavior: "auto" });
  });
}

const rumiProject = document.querySelector("#rumi");
const rumiOpening = document.querySelector(".rumi-opening");
const rumiExpressionImage = document.querySelector("#rumiExpressionImage");
const rumiExpressionName = document.querySelector("#rumiExpressionName");
const rumiExpressionNumber = document.querySelector("#rumiExpressionNumber");
const rumiExpressionDescription = document.querySelector("#rumiExpressionDescription");
const rumiExpressionButtons = Array.from(document.querySelectorAll(".rumi-expression-controls button"));
const rumiProductStory = document.querySelector("#rumiProductStory");
const rumiPackaging = document.querySelector("#rumiPackaging");
const rumiPackageStage = document.querySelector("#rumiPackageStage");
const rumiPackageStatus = document.querySelector("#rumiPackageStatus");
const rumiPackageTimeline = Array.from(document.querySelectorAll(".rumi-package-timeline li"));
const rumiCutPath = document.querySelector("#rumiCutPath");
const rumiScissors = document.querySelector("#rumiScissors");

if (rumiProject) {
  const rumiClamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const rumiSmooth = (start, end, value) => {
    const position = rumiClamp((value - start) / Math.max(0.0001, end - start));
    return position * position * (3 - 2 * position);
  };

  rumiProject.classList.add("is-enhanced");

  if (rumiOpening) {
    const rumiOpeningObserver = new IntersectionObserver(
      (entries, observerInstance) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        rumiOpening.classList.add("is-visible");
        observerInstance.disconnect();
      },
      { threshold: 0.14 },
    );
    rumiOpeningObserver.observe(rumiOpening);
  }

  rumiExpressionButtons.forEach((button) => {
    const preload = new Image();
    preload.src = button.dataset.src;

    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true" || !rumiExpressionImage) return;

      rumiExpressionButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      rumiExpressionImage.classList.add("is-switching");

      window.setTimeout(
        () => {
          rumiExpressionImage.src = button.dataset.src;
          rumiExpressionImage.alt = button.dataset.alt;
          rumiExpressionName.textContent = button.dataset.name;
          rumiExpressionDescription.textContent = button.dataset.description;
          rumiExpressionNumber.textContent = String(Number(button.dataset.index) + 1).padStart(2, "0");
          rumiExpressionImage.classList.remove("is-switching");
        },
        reduceMotion ? 0 : 170,
      );
    });

    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const currentIndex = rumiExpressionButtons.indexOf(button);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + rumiExpressionButtons.length) % rumiExpressionButtons.length;
      rumiExpressionButtons[nextIndex].focus();
      rumiExpressionButtons[nextIndex].click();
    });
  });

  let rumiFrame = 0;
  let rumiCutLength = 0;
  let rumiStatusIndex = -1;
  let rumiStatusLabel = "";
  let rumiIsMobile = window.matchMedia("(max-width: 767px)").matches;

  const updateRumiCutMetrics = () => {
    rumiIsMobile = window.matchMedia("(max-width: 767px)").matches;
    rumiCutLength = rumiCutPath?.getTotalLength() || 0;
  };

  const updateRumiProduct = () => {
    if (!rumiProductStory) return;
    const rect = rumiProductStory.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = rumiClamp(-rect.top / travel);
    const front = 1 - rumiSmooth(0.16, 0.42, progress);
    const turn = rumiSmooth(0.27, 0.58, progress);
    const badge = rumiSmooth(0.62, 0.9, progress);

    rumiProductStory.style.setProperty("--rumi-product-front", front.toFixed(4));
    rumiProductStory.style.setProperty("--rumi-product-turn", turn.toFixed(4));
    rumiProductStory.style.setProperty("--rumi-product-badge", badge.toFixed(4));
  };

  const setRumiPackageStatus = (index, label) => {
    if (rumiStatusIndex === index && rumiStatusLabel === label) return;
    rumiStatusIndex = index;
    rumiStatusLabel = label;
    if (rumiPackageStatus) rumiPackageStatus.textContent = label;
    rumiPackageTimeline.forEach((item, itemIndex) => item.classList.toggle("is-current", itemIndex === index));
  };

  const updateRumiPackaging = () => {
    if (!rumiPackaging || !rumiPackageStage) return;
    const rect = rumiPackaging.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = rumiClamp(-rect.top / travel);

    let dielineOpacity = rumiSmooth(0, 0.035, progress) * (1 - rumiSmooth(0.61, 0.69, progress));
    const dielineScale = 0.76 + rumiSmooth(0, 0.12, progress) * 0.24;
    const cutProgress = rumiSmooth(0.12, 0.38, progress);
    const scissorOpacity = progress < 0.38 ? rumiSmooth(0.115, 0.135, progress) : 1 - rumiSmooth(0.38, 0.41, progress);
    const scrapProgress = rumiSmooth(0.38, 0.48, progress) * (1 - rumiSmooth(0.48, 0.52, progress));
    const insertLinear = rumiSmooth(0.48, 0.6, progress);
    let insertMotion = insertLinear;
    if (insertLinear > 0.74 && insertLinear < 1) {
      insertMotion += Math.sin(((insertLinear - 0.74) / 0.26) * Math.PI) * 0.045;
    }
    const foldLine = rumiSmooth(0.58, 0.68, progress);
    let foldModelOpacity = rumiSmooth(0.59, 0.65, progress) * (1 - rumiSmooth(0.84, 0.92, progress));
    const foldLeft = rumiSmooth(0.61, 0.67, progress);
    const foldBack = rumiSmooth(0.65, 0.71, progress);
    const foldRight = rumiSmooth(0.69, 0.75, progress);
    const foldBottom = rumiSmooth(0.73, 0.79, progress);
    const foldTop = rumiSmooth(0.77, 0.82, progress);
    const foldAngle = rumiSmooth(0.7, 0.84, progress);
    let finalOpacity = rumiSmooth(0.82, 0.92, progress);
    let landing = rumiSmooth(0.92, 0.985, progress);

    if (reduceMotion) {
      dielineOpacity = 1 - rumiSmooth(0.56, 0.7, progress);
      foldModelOpacity = 0;
      finalOpacity = rumiSmooth(0.58, 0.72, progress);
      landing = finalOpacity;
    } else if (rumiIsMobile) {
      dielineOpacity = 1 - rumiSmooth(0.7, 0.84, progress);
      foldModelOpacity = 0;
      finalOpacity = rumiSmooth(0.76, 0.9, progress);
      landing = rumiSmooth(0.88, 0.985, progress);
    }

    let boxY = -72 * (1 - Math.min(1, landing / 0.7));
    if (landing >= 0.7) {
      boxY = -10 * Math.sin(((landing - 0.7) / 0.3) * Math.PI);
    }

    rumiPackageStage.style.setProperty("--rumi-dieline-opacity", dielineOpacity.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-dieline-scale", dielineScale.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-cut-progress", cutProgress.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-scissors-opacity", rumiClamp(scissorOpacity).toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-scrap-progress", scrapProgress.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-insert-progress", rumiClamp(insertMotion, 0, 1.05).toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-line", foldLine.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-model-opacity", foldModelOpacity.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-left", foldLeft.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-back", foldBack.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-right", foldRight.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-bottom", foldBottom.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-top", foldTop.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-fold-angle", foldAngle.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-final-opacity", finalOpacity.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-landing", landing.toFixed(4));
    rumiPackageStage.style.setProperty("--rumi-box-y", `${boxY.toFixed(2)}px`);
    rumiPackageStage.classList.toggle("is-cutting", !reduceMotion && progress >= 0.115 && progress <= 0.41);

    if (rumiCutPath && rumiScissors && rumiCutLength > 0) {
      const distance = rumiCutLength * cutProgress;
      const point = rumiCutPath.getPointAtLength(distance);
      const before = rumiCutPath.getPointAtLength(Math.max(0, distance - 4));
      const after = rumiCutPath.getPointAtLength(Math.min(rumiCutLength, distance + 4));
      const angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
      const scissorScale = rumiIsMobile ? 1.55 : 1.35;
      rumiScissors.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scissorScale})`);
    }

    if (progress < 0.12) setRumiPackageStatus(0, "刀模铺开");
    else if (progress < 0.48) setRumiPackageStatus(1, progress < 0.38 ? "沿 CUT 刀线裁剪" : "外围废料离开");
    else if (progress < 0.6) setRumiPackageStatus(2, "Rumi 与徽章进入包装");
    else if (progress < 0.84) setRumiPackageStatus(3, "沿 FOLD 折线依次成型");
    else setRumiPackageStatus(4, "完整礼盒展示");
  };

  const updateRumiStory = () => {
    rumiFrame = 0;
    updateRumiProduct();
    updateRumiPackaging();
  };

  const requestRumiUpdate = () => {
    if (rumiFrame) return;
    rumiFrame = window.requestAnimationFrame(updateRumiStory);
  };

  updateRumiCutMetrics();
  updateRumiStory();
  window.addEventListener("scroll", requestRumiUpdate, { passive: true });
  window.addEventListener("resize", () => {
    updateRumiCutMetrics();
    requestRumiUpdate();
  });
}

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector(".lightbox-close");

document.querySelectorAll(".previewable").forEach((image) => {
  image.addEventListener("click", () => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeCharacterLabels();
  if (!lightbox.hidden) closeLightbox();
});
