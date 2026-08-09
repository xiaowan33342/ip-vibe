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
const desk = document.querySelector("#desk");

function openProject(projectId) {
  const project = projects[projectId];
  if (!project) return;

  notes.forEach((note) => {
    note.classList.toggle("active", note.dataset.project === projectId);
  });

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
const portfolioTitle = document.querySelector("#portfolioTitle");

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
    const sheetRise = smoothStep(0.14, 0.58, progress);
    const folderDrop = reduceMotion ? Number(progress >= 0.48) : smoothStep(0.54, 0.7, progress);
    const metaReveal = reduceMotion ? Number(progress >= 0.34) : smoothStep(0.46, 0.58, progress);
    const portraitReveal = reduceMotion ? Number(progress >= 0.38) : smoothStep(0.49, 0.66, progress);
    const copyReveal = reduceMotion ? Number(progress >= 0.42) : smoothStep(0.54, 0.7, progress);
    const skillsReveal = reduceMotion ? Number(progress >= 0.46) : smoothStep(0.63, 0.76, progress);

    coverAboutStage.style.setProperty("--cover-opacity", (1 - coverExit).toFixed(4));
    coverAboutStage.style.setProperty("--cover-y", `${(-46 * coverExit).toFixed(2)}px`);
    coverAboutStage.style.setProperty("--sheet-y", `${((1 - sheetRise) * 100).toFixed(3)}svh`);
    const folderResponsiveDrop = 146 + Math.max(0, (window.innerHeight - 840) / 2 - 28);
    coverAboutStage.style.setProperty("--folder-y", `${(folderResponsiveDrop * folderDrop).toFixed(2)}px`);
    coverAboutStage.style.setProperty("--about-stage-y", `${(34 * sheetRise).toFixed(2)}px`);
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
  portfolioTitle?.addEventListener("click", () => {
    if (coverAboutStage.classList.contains("about-is-open")) return;
    openAboutSheet();
  });
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
    if (introSeen) {
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

const mallowSpecTag = document.querySelector(".mallow-spec-tag");
const mallowSpecModal = document.querySelector("#mallowSpecModal");
const mallowSpecClose = document.querySelector(".mallow-spec-modal-close");

if (mallowSpecTag && mallowSpecModal && mallowSpecClose) {
  const openMallowSpecModal = () => {
    mallowSpecModal.hidden = false;
    document.body.classList.add("modal-open");
    mallowSpecClose.focus();
  };

  const closeMallowSpecModal = () => {
    mallowSpecModal.hidden = true;
    document.body.classList.remove("modal-open");
    mallowSpecTag.focus();
  };

  mallowSpecTag.addEventListener("click", openMallowSpecModal);
  mallowSpecClose.addEventListener("click", closeMallowSpecModal);

  mallowSpecModal.addEventListener("click", (event) => {
    if (event.target === mallowSpecModal) {
      closeMallowSpecModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mallowSpecModal.hidden) {
      closeMallowSpecModal();
    }
  });
}

const rumiProject = document.querySelector("#rumi");
const rumiOpening = document.querySelector(".rumi-opening");
const rumiExpressionName = document.querySelector("#rumiExpressionName");
const rumiExpressionNumber = document.querySelector("#rumiExpressionNumber");
const rumiExpressionDescription = document.querySelector("#rumiExpressionDescription");
const rumiExpressionButtons = Array.from(document.querySelectorAll(".rumi-expression-card"));
const rumiProductButtons = Array.from(document.querySelectorAll(".rumi-product-tabs button"));
const rumiProductPanels = Array.from(document.querySelectorAll(".rumi-product-panel"));
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
    button.addEventListener("click", () => {
      rumiExpressionButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      if (rumiExpressionName) rumiExpressionName.textContent = button.dataset.name;
      if (rumiExpressionDescription) rumiExpressionDescription.textContent = button.dataset.description;
      if (rumiExpressionNumber) {
        rumiExpressionNumber.textContent = String(Number(button.dataset.index) + 1).padStart(2, "0");
      }
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

  rumiProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.rumiProduct;

      rumiProductButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      rumiProductPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.rumiPanel === target);
      });
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = rumiProductButtons.indexOf(button);
      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + rumiProductButtons.length) % rumiProductButtons.length;
      rumiProductButtons[nextIndex].focus();
      rumiProductButtons[nextIndex].click();
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

const setupXigouTabs = (root) => {
  if (!root || root.dataset.xigouTabsReady === "true") return;

  const buttons = Array.from(root.querySelectorAll("[data-xigou-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-xigou-panel]"));
  if (!buttons.length || !panels.length) return;

  root.dataset.xigouTabsReady = "true";

  const activateTab = (key, moveFocus = false) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.xigouTab === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
      if (isActive && moveFocus) button.focus();
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.xigouPanel === key;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activateTab(button.dataset.xigouTab));
    button.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      activateTab(buttons[nextIndex].dataset.xigouTab, true);
    });
  });

  activateTab(root.dataset.defaultTab || buttons[0].dataset.xigouTab);
};

document.querySelectorAll("[data-xigou-tabs]").forEach(setupXigouTabs);

const xigouRevealItems = Array.from(document.querySelectorAll(".xigou-reveal"));
if (xigouRevealItems.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    xigouRevealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const xigouRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          xigouRevealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    xigouRevealItems.forEach((item) => xigouRevealObserver.observe(item));
  }
}

const pupuProject = document.querySelector("#pupu");

if (pupuProject) {
  const enterPupuProject = () => pupuProject.classList.add("is-entered");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    enterPupuProject();
  } else {
    const pupuProjectObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        enterPupuProject();
        pupuProjectObserver.disconnect();
      },
      { threshold: 0.64 },
    );

    pupuProjectObserver.observe(pupuProject);
  }
}

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector(".lightbox-close");
let lastLightboxTrigger = null;

const openLightbox = (image, trigger) => {
  lastLightboxTrigger = trigger;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
};

document.querySelectorAll(".previewable").forEach((image) => {
  const trigger = image.closest(".xigou-preview-trigger") || image;
  if (trigger.dataset.previewReady === "true") return;
  trigger.dataset.previewReady = "true";

  if (trigger === image) {
    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-label", `放大查看${image.alt}`);
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openLightbox(image, trigger);
    });
  }

  trigger.addEventListener("click", () => openLightbox(image, trigger));
});

const rumiSpecDetail = document.querySelector(".rumi-spec-detail");
const rumiSpecImage = document.querySelector('[data-rumi-panel="spec"] .previewable');

if (rumiSpecDetail && rumiSpecImage) {
  rumiSpecDetail.addEventListener("click", () => rumiSpecImage.click());
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
  lastLightboxTrigger?.focus();
  lastLightboxTrigger = null;
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

const ambProject = document.querySelector("#ambagel");

if (ambProject) {
  const ambLogoVariants = {
    logotype: {
      src: "./assets/ambagel/ambagel_logotype.png",
      alt: "AMBagel Logotype 字标",
    },
    brandmark: {
      src: "./assets/ambagel/ambagel_brandmark.png",
      alt: "AMBagel Brandmark 品牌图形",
    },
    monochrome: {
      src: "./assets/ambagel/ambagel_monochrome_logo.png",
      alt: "AMBagel Monochrome 单色 Logo",
    },
  };

  const ambApplicationStates = {
    packaging: {
      src: "./assets/ambagel/aw-bagel-packaging-collection.png",
      alt: "AMBagel 包装系统组合展示",
      title: "包装系统",
      description: "品牌视觉在包装组合中的统一延展。",
    },
    retail: {
      src: "./assets/ambagel/aw-bagel-storefront-logo-mockup.png",
      alt: "AMBagel 门店与招牌 Logo 应用场景",
      title: "门店体验",
      description: "品牌识别在门店与真实消费场景中的呈现。",
    },
    touchpoints: {
      src: "./assets/ambagel/an-bagel-business-card-mockup.png",
      alt: "AMBagel 品牌名片应用",
      title: "品牌触点",
      description: "将统一的视觉识别延展到名片等日常接触物料中，保持品牌体验的一致与完整。",
    },
  };

  const ambIntro = ambProject.querySelector(".amb-intro");
  if (ambIntro) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      ambIntro.classList.add("is-visible");
    } else {
      const ambIntroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            ambIntroObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.16 },
      );
      ambIntroObserver.observe(ambIntro);
    }
  }

  const ambLogoStage = ambProject.querySelector("#ambLogoStage");
  const ambLogoImage = ambProject.querySelector("#ambLogoImage");
  const ambLogoButtons = Array.from(ambProject.querySelectorAll("[data-amb-logo]"));
  let ambLogoTimer = 0;

  const updateAmbLogo = (key) => {
    const variant = ambLogoVariants[key];
    if (!variant || !ambLogoStage || !ambLogoImage) return;

    ambLogoButtons.forEach((button) => {
      const isActive = button.dataset.ambLogo === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    window.clearTimeout(ambLogoTimer);
    if (reduceMotion) {
      ambLogoImage.src = variant.src;
      ambLogoImage.alt = variant.alt;
      return;
    }

    ambLogoStage.classList.add("is-changing");
    ambLogoTimer = window.setTimeout(() => {
      ambLogoImage.src = variant.src;
      ambLogoImage.alt = variant.alt;
      window.requestAnimationFrame(() => ambLogoStage.classList.remove("is-changing"));
    }, 170);
  };

  ambLogoButtons.forEach((button) => {
    button.addEventListener("click", () => updateAmbLogo(button.dataset.ambLogo));
  });

  const ambColorList = ambProject.querySelector(".amb-color-list");
  const ambColorButtons = Array.from(ambProject.querySelectorAll("[data-amb-color]"));
  let ambSelectedColor = "#FBF6EB";
  let ambSelectedColorIsDark = false;

  const applyAmbLogoBackground = (color, isDark) => {
    if (!ambLogoStage) return;
    ambLogoStage.style.backgroundColor = color;
    ambLogoStage.classList.toggle("is-dark", isDark);
  };

  const restoreAmbLogoBackground = () => {
    applyAmbLogoBackground(ambSelectedColor, ambSelectedColorIsDark);
  };

  ambColorButtons.forEach((button) => {
    const previewColor = () => applyAmbLogoBackground(button.dataset.ambColor, button.dataset.ambDark === "true");
    button.addEventListener("pointerenter", previewColor);
    button.addEventListener("focus", previewColor);
    button.addEventListener("blur", restoreAmbLogoBackground);
    button.addEventListener("click", () => {
      ambSelectedColor = button.dataset.ambColor;
      ambSelectedColorIsDark = button.dataset.ambDark === "true";
      ambColorButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      restoreAmbLogoBackground();
    });
  });
  ambColorList?.addEventListener("pointerleave", restoreAmbLogoBackground);

  const ambApplicationStage = ambProject.querySelector("#ambApplicationStage");
  const ambApplicationImage = ambProject.querySelector("#ambApplicationImage");
  const ambApplicationName = ambProject.querySelector("#ambApplicationName");
  const ambApplicationDescription = ambProject.querySelector("#ambApplicationDescription");
  const ambApplicationSummary = ambProject.querySelector(".amb-application-summary");
  const ambApplicationButtons = Array.from(ambProject.querySelectorAll("[data-amb-application]"));
  let ambApplicationTimer = 0;

  const updateAmbApplication = (key) => {
    const state = ambApplicationStates[key];
    if (!state || !ambApplicationStage || !ambApplicationImage || !ambApplicationName || !ambApplicationDescription) return;

    ambApplicationButtons.forEach((button) => {
      const isActive = button.dataset.ambApplication === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const applyState = () => {
      ambApplicationStage.dataset.mode = key;
      ambApplicationImage.src = state.src;
      ambApplicationImage.alt = state.alt;
      ambApplicationName.textContent = state.title;
      ambApplicationDescription.textContent = state.description;
    };

    window.clearTimeout(ambApplicationTimer);
    if (reduceMotion) {
      applyState();
      return;
    }

    ambApplicationStage.classList.add("is-changing");
    ambApplicationSummary?.classList.add("is-changing");
    ambApplicationTimer = window.setTimeout(() => {
      applyState();
      window.requestAnimationFrame(() => {
        ambApplicationStage.classList.remove("is-changing");
        ambApplicationSummary?.classList.remove("is-changing");
      });
    }, 170);
  };

  ambApplicationButtons.forEach((button) => {
    button.addEventListener("click", () => updateAmbApplication(button.dataset.ambApplication));
  });

  const ambSectionNav = ambProject.querySelector(".amb-section-nav");
  const ambSectionLinks = Array.from(ambProject.querySelectorAll("[data-amb-section-link]"));
  const ambSections = ambSectionLinks
    .map((link) => document.getElementById(link.dataset.ambSectionLink))
    .filter(Boolean);

  ambSectionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.ambSectionLink);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  if (ambSectionNav && "IntersectionObserver" in window) {
    const ambProjectObserver = new IntersectionObserver(
      ([entry]) => {
        ambSectionNav.classList.toggle("is-visible", entry.isIntersecting);
        document.body.classList.toggle("amb-project-active", entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-72px 0px -8%" },
    );
    ambProjectObserver.observe(ambProject);

    const ambSectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;
        ambSectionLinks.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.ambSectionLink === visibleEntry.target.id);
        });
      },
      { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -48%" },
    );
    ambSections.forEach((section) => ambSectionObserver.observe(section));
  }
}

const qingliangRevealItems = Array.from(document.querySelectorAll(".qingliang-reveal"));

if (qingliangRevealItems.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    qingliangRevealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const qingliangRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          qingliangRevealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    qingliangRevealItems.forEach((item) => qingliangRevealObserver.observe(item));
  }
}

const portfolioEnd = document.querySelector("#portfolio-end");
const portfolioBackToTop = document.querySelector("#portfolioBackToTop");

if (portfolioEnd) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    portfolioEnd.classList.add("is-visible");
  } else {
    const portfolioEndObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        portfolioEnd.classList.add("is-visible");
        portfolioEndObserver.unobserve(portfolioEnd);
      },
      { threshold: 0.28 },
    );
    portfolioEndObserver.observe(portfolioEnd);
  }
}

portfolioBackToTop?.addEventListener("click", () => {
  document.querySelector("#cover")?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
});

const categoryDividers = Array.from(document.querySelectorAll(".category-divider"));

if (categoryDividers.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    categoryDividers.forEach((divider) => divider.classList.add("is-visible"));
  }

  if ("IntersectionObserver" in window) {
    const visibleCategoryDividers = new Set();
    const categoryDividerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleCategoryDividers.add(entry.target);
            entry.target.classList.add("is-visible");
          } else {
            visibleCategoryDividers.delete(entry.target);
          }
        });

        document.body.classList.toggle("category-divider-active", visibleCategoryDividers.size > 0);
      },
      { rootMargin: "0px 0px -8%", threshold: 0.18 },
    );

    categoryDividers.forEach((divider) => categoryDividerObserver.observe(divider));
  }
}

const writingWorks = {
  buddhism: {
    title: "当佛教远行",
    pages: [
      "./assets/writing/buddhism/buddhism01.png",
      "./assets/writing/buddhism/buddhism02.png",
    ],
  },
  food: {
    title: "神的食物",
    pages: [
      "./assets/writing/food/FOOD1.png",
      "./assets/writing/food/FOOD2.png",
      "./assets/writing/food/FOOD3.png",
      "./assets/writing/food/FOOD4.png",
      "./assets/writing/food/FOOD5.png",
    ],
  },
  beasts: {
    title: "书页边缘的怪兽",
    pages: [
      "./assets/writing/beasts/怪兽p1.png",
      "./assets/writing/beasts/怪兽p2.png",
      "./assets/writing/beasts/怪兽p3.png",
    ],
  },
};

const writingSections = Array.from(document.querySelectorAll(".writing-section"));
const writingReader = document.querySelector("#writingReader");
const writingReaderTitle = document.querySelector("#writingReaderTitle");
const writingReaderCurrent = document.querySelector("#writingReaderCurrent");
const writingReaderTotal = document.querySelector("#writingReaderTotal");
const writingReaderPage = document.querySelector("#writingReaderPage");
const writingReaderPageWrap = document.querySelector("[data-writing-swipe]");
const writingReaderPagination = document.querySelector("#writingReaderPagination");
const writingReaderPrev = document.querySelector("[data-writing-prev]");
const writingReaderNext = document.querySelector("[data-writing-next]");
const writingReaderClose = document.querySelector("[data-writing-close]");

if (writingSections.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    writingSections.forEach((section) => section.classList.add("is-visible"));
  } else {
    const writingRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          writingRevealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.18 },
    );

    writingSections.forEach((section) => writingRevealObserver.observe(section));
  }
}

if (
  writingReader &&
  writingReaderTitle &&
  writingReaderCurrent &&
  writingReaderTotal &&
  writingReaderPage &&
  writingReaderPageWrap &&
  writingReaderPagination &&
  writingReaderPrev &&
  writingReaderNext &&
  writingReaderClose
) {
  let activeWritingWork = null;
  let activeWritingPage = 0;
  let writingReaderLocked = false;
  let writingReaderTrigger = null;
  let writingReaderScrollY = 0;
  let writingReaderTimer = 0;
  let writingPointerId = null;
  let writingPointerStartX = 0;
  let writingPointerStartY = 0;
  let writingPointerDeltaX = 0;

  const formatWritingPage = (page) => String(page + 1).padStart(2, "0");

  const preloadWritingPage = (src) => {
    if (!src) return;
    const image = new Image();
    image.src = src;
  };

  const preloadAdjacentWritingPages = () => {
    if (!activeWritingWork) return;
    preloadWritingPage(activeWritingWork.pages[activeWritingPage - 1]);
    preloadWritingPage(activeWritingWork.pages[activeWritingPage + 1]);
  };

  const updateWritingReaderControls = () => {
    const total = activeWritingWork?.pages.length || 0;
    writingReaderCurrent.textContent = formatWritingPage(activeWritingPage);
    writingReaderTotal.textContent = String(total).padStart(2, "0");
    writingReaderPrev.disabled = activeWritingPage === 0;
    writingReaderNext.disabled = activeWritingPage === total - 1;

    Array.from(writingReaderPagination.children).forEach((button, index) => {
      const isCurrent = index === activeWritingPage;
      if (isCurrent) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  };

  const buildWritingPagination = () => {
    writingReaderPagination.replaceChildren();

    activeWritingWork.pages.forEach((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `查看第 ${index + 1} 页`);
      button.innerHTML = `<span>${formatWritingPage(index)}</span>`;
      button.addEventListener("click", () => showWritingPage(index));
      writingReaderPagination.append(button);
    });
  };

  const setWritingPageSource = () => {
    const src = activeWritingWork.pages[activeWritingPage];
    writingReaderPage.src = src;
    writingReaderPage.alt = `${activeWritingWork.title}稿件第 ${activeWritingPage + 1} 页`;
    updateWritingReaderControls();
    preloadAdjacentWritingPages();
  };

  function showWritingPage(nextPage, immediate = false) {
    if (!activeWritingWork || writingReaderLocked) return;
    if (nextPage < 0 || nextPage >= activeWritingWork.pages.length) return;
    if (nextPage === activeWritingPage && !immediate) return;

    const direction = nextPage > activeWritingPage ? "next" : "previous";
    window.clearTimeout(writingReaderTimer);

    if (immediate || reduceMotion) {
      activeWritingPage = nextPage;
      setWritingPageSource();
      return;
    }

    writingReaderLocked = true;
    writingReaderPage.classList.add(direction === "next" ? "is-exiting-left" : "is-exiting-right");

    writingReaderTimer = window.setTimeout(() => {
      activeWritingPage = nextPage;
      writingReaderPage.className = "writing-reader__page";
      writingReaderPage.classList.add(direction === "next" ? "is-entering-right" : "is-entering-left");
      setWritingPageSource();
      writingReaderPage.getBoundingClientRect();

      requestAnimationFrame(() => {
        writingReaderPage.classList.remove("is-entering-right", "is-entering-left");
        writingReaderTimer = window.setTimeout(() => {
          writingReaderLocked = false;
        }, 180);
      });
    }, 150);
  }

  const resetWritingPointer = () => {
    writingPointerId = null;
    writingPointerDeltaX = 0;
    writingReaderPageWrap.classList.remove("is-dragging");
    writingReaderPageWrap.style.removeProperty("--writing-reader-drag-x");
  };

  const handleWritingReaderKeydown = (event) => {
    if (writingReader.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeWritingReader();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showWritingPage(activeWritingPage - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showWritingPage(activeWritingPage + 1);
    }
  };

  function openWritingReader(workId, trigger) {
    const work = writingWorks[workId];
    if (!work) return;

    activeWritingWork = work;
    activeWritingPage = 0;
    writingReaderTrigger = trigger;
    writingReaderScrollY = window.scrollY;
    writingReaderTitle.textContent = work.title;
    buildWritingPagination();
    setWritingPageSource();
    writingReader.hidden = false;
    document.body.classList.add("writing-reader-open");
    window.addEventListener("keydown", handleWritingReaderKeydown);
    writingReaderClose.focus();
  }

  function closeWritingReader() {
    if (writingReader.hidden) return;

    window.clearTimeout(writingReaderTimer);
    writingReaderLocked = false;
    resetWritingPointer();
    writingReader.hidden = true;
    document.body.classList.remove("writing-reader-open");
    window.removeEventListener("keydown", handleWritingReaderKeydown);
    window.scrollTo({ top: writingReaderScrollY, behavior: "auto" });
    writingReaderTrigger?.focus();
    writingReaderTrigger = null;
  }

  document.querySelectorAll("[data-writing-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => openWritingReader(trigger.dataset.writingOpen, trigger));
  });

  writingReaderClose.addEventListener("click", closeWritingReader);
  writingReaderPrev.addEventListener("click", () => showWritingPage(activeWritingPage - 1));
  writingReaderNext.addEventListener("click", () => showWritingPage(activeWritingPage + 1));

  writingReaderPage.addEventListener("error", () => {
    console.error(`Writing page image failed to load: ${writingReaderPage.getAttribute("src")}`);
  });

  writingReaderPageWrap.addEventListener("pointerdown", (event) => {
    if (writingReaderLocked || (event.pointerType === "mouse" && event.button !== 0)) return;
    writingPointerId = event.pointerId;
    writingPointerStartX = event.clientX;
    writingPointerStartY = event.clientY;
    writingPointerDeltaX = 0;
    writingReaderPageWrap.setPointerCapture(event.pointerId);
    writingReaderPageWrap.classList.add("is-dragging");
  });

  writingReaderPageWrap.addEventListener("pointermove", (event) => {
    if (event.pointerId !== writingPointerId) return;
    const deltaX = event.clientX - writingPointerStartX;
    const deltaY = event.clientY - writingPointerStartY;
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 4) return;
    event.preventDefault();
    writingPointerDeltaX = Math.max(-120, Math.min(120, deltaX));
    writingReaderPageWrap.style.setProperty("--writing-reader-drag-x", `${writingPointerDeltaX}px`);
  });

  const finishWritingPointer = (event) => {
    if (event.pointerId !== writingPointerId) return;
    const deltaX = writingPointerDeltaX;
    resetWritingPointer();

    if (Math.abs(deltaX) < 60) return;
    if (deltaX < 0) showWritingPage(activeWritingPage + 1);
    if (deltaX > 0) showWritingPage(activeWritingPage - 1);
  };

  writingReaderPageWrap.addEventListener("pointerup", finishWritingPointer);
  writingReaderPageWrap.addEventListener("pointercancel", resetWritingPointer);
}
