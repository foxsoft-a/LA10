/**
 * Unit 10: Influence - Course Engine
 * Handles progress tracking, state persistence, and navigation logic.
 */

const CourseEngine = {
    // Configuration
    totalLessons: 26,
    storageKey: 'unit10_progress',

    // State
    state: {
        completedLessons: [], // Array of lesson numbers [1, 2, 5...]
        currentLesson: 1
    },

    // Initialize
    init() {
        this.loadState();
        this.updateUI();
    },

    // Persistence
    loadState() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.state = JSON.parse(stored);
        }
    },

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    },

    // Actions
    markComplete(lessonNumber) {
        lessonNumber = parseInt(lessonNumber);
        if (!this.state.completedLessons.includes(lessonNumber)) {
            this.state.completedLessons.push(lessonNumber);
            this.saveState();
            console.log(`Lesson ${lessonNumber} marked complete.`);
        }

        // Show success UI if on a lesson page
        this.showLessonSuccess(lessonNumber);
    },

    isComplete(lessonNumber) {
        return this.state.completedLessons.includes(parseInt(lessonNumber));
    },

    resetProgress() {
        if (confirm("Are you sure you want to reset all progress?")) {
            this.state.completedLessons = [];
            this.saveState();
            location.reload();
        }
    },

    // Navigation
    goToNext(currentLessonNumber) {
        currentLessonNumber = parseInt(currentLessonNumber);

        // Report to Adapter/OS before navigating
        if (window.parent && window.parent.postMessage) {
            // We rely on the adapter (scholar_adapter.js) to catch the "markComplete" event 
            // which determines completion. 
            // However, we still need to navigate the iframe to the next lesson or HQ.
        }

        if (currentLessonNumber < this.totalLessons) {
            window.location.href = `lesson${currentLessonNumber + 1}.html`;
        } else {
            alert("Congratulations! You have completed the entire Unit.");
            // In OS mode, we might want to stay put or go to a summary page.
            window.location.href = `index.html`;
        }
    },

    // UI Helpers for Index.html
    updateUI() {
        // Run only if we are on index.html (check for mission container)
        const container = document.querySelector('.mission-container');
        if (container) {
            this.renderMissionMap();
        }
    },

    renderMissionMap() {
        // 1. Mark cards as complete
        this.state.completedLessons.forEach(num => {
            const cardLink = document.querySelector(`a[href="lesson${num}.html"]`);
            if (cardLink) {
                cardLink.classList.add('completed');
                // Ensure checkmark exists
                if (!cardLink.querySelector('.check-mark')) {
                    const check = document.createElement('div');
                    check.className = 'check-mark';
                    check.innerHTML = '✅';
                    cardLink.appendChild(check);
                }
            }
        });

        // 2. Update Progress Circle
        const count = this.state.completedLessons.length;
        const percent = Math.round((count / this.totalLessons) * 100);
        const circle = document.querySelector('.progress-circle');
        if (circle) {
            circle.innerHTML = `${percent}%`;
            // Optional: Visual indicator (gradient) could be added here
        }

        // 3. (Optional) Unlock Logic - add 'locked' class to future lessons?
        // keeping it open for now as per plan visual guidance only.
    },

    // UI Helpers for Lesson Pages
    showLessonSuccess(lessonNum) {
        // Create a floating overlay if it doesn't exist
        if (document.getElementById('course-success-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'course-success-overlay';
        overlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            animation: slideUp 0.5s ease-out;
            border: 2px solid #fff;
            max-width: 300px;
        `;

        overlay.innerHTML = `
            <div style="font-weight:bold; font-size:1.1rem;">🎉 Mission Accomplished!</div>
            <div style="font-size:0.9rem;">Progress saved. Ready for the next assignment?</div>
            <button id="next-mission-btn" style="
                background: white;
                color: #10b981;
                border: none;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 5px;
            ">Next Mission >></button>
            <button onclick="window.location.href='index.html'" style="
                background: transparent;
                border: 1px solid white;
                color: white;
                padding: 5px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.8rem;
            ">Return to HQ</button>
        `;

        document.body.appendChild(overlay);

        document.getElementById('next-mission-btn').addEventListener('click', () => {
            this.goToNext(lessonNum);
        });

        // Add a style tag for animation if needed
        const style = document.createElement('style');
        style.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
        document.head.appendChild(style);
    }
};

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    CourseEngine.init();
});
