// ===== UPLOAD TABS MANAGER - FIXED VERSION =====
class UploadTabsManager {
  constructor() {
    this.tabs = null;
    this.containers = null;
    this.init();
  }

  init() {
    // Add delay to ensure DOM is fully loaded
    setTimeout(() => {
      this.tabs = document.querySelectorAll(".upload-tab");
      this.containers = document.querySelectorAll(".upload-form-container");

      if (this.tabs.length === 0) {
        console.warn("No upload tabs found!");
        return;
      }

      console.log(
        `Upload Tabs initializing: ${this.tabs.length} tabs, ${this.containers.length} containers`
      );

      this.tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetTab = tab.dataset.tab;
          console.log("Clicked tab:", targetTab);
          this.switchTab(targetTab);
        });
      });

      console.log("✅ Upload Tabs initialized");
    }, 500); // Wait 500ms for DOM
  }

  switchTab(targetTab) {
    // Remove active class from all tabs
    this.tabs.forEach((tab) => tab.classList.remove("active"));

    // Add active class to clicked tab
    const activeTab = document.querySelector(`.upload-tab[data-tab="${targetTab}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    // Hide all containers
    this.containers.forEach((container) => {
      container.classList.remove("active");
    });

    // Show target container
    const targetContainer = document.getElementById(`form-${targetTab}`);
    if (targetContainer) {
      targetContainer.classList.add("active");
      console.log(`✅ Switched to ${targetTab}`);
    } else {
      console.error(`❌ Container not found: form-${targetTab}`);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.uploadTabsManager = new UploadTabsManager();
});

console.log("upload_tabs.js loaded");
