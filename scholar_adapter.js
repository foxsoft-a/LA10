
// Scholar's OS Adapter
// This script allows individual lessons to communicate with the parent OS frame.

const lessonID = document.title;

function reportToOS(action, payload) {
    // Check if running in iframe
    if (window.self !== window.top) {
        window.parent.postMessage({
            source: 'LESSON_FRAME',
            lesson: lessonID,
            type: action,
            data: payload
        }, '*');
        console.log(`[Adapter] Reported ${action} to OS`);
    } else {
        console.log(`[Adapter] Standalone Mode: ${action}`, payload);
    }
}

// Hook into CourseEngine if it exists
// We want to override or augment the completion logic
if (window.CourseEngine) {
    const originalMarkComplete = window.CourseEngine.markComplete.bind(window.CourseEngine);

    window.CourseEngine.markComplete = function (lessonNum) {
        // Run original logic (localStorage)
        originalMarkComplete(lessonNum);

        // Report to OS
        reportToOS('LESSON_COMPLETE', {
            lessonNumber: lessonNum,
            score: 100
        });
    };
}

// Hook into nextSlide global function if it exists
// This assumes lessons use 'nextSlide(n)' for navigation
if (typeof window.nextSlide !== 'undefined') {
    const originalNextSlide = window.nextSlide;
    window.nextSlide = function (n) {
        originalNextSlide(n);

        // Use heuristics to estimate progress
        // Most lessons have around 5 slides.
        const percent = Math.min(100, (n / 5) * 100);
        reportToOS('PROGRESS_UPDATE', { percent: percent });
    };
}
