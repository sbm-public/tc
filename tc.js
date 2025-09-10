window.custom = function() {
// Record START timestamp immediately when code runs
const startTimestamp = Date.now();

const timestampData = {};
let finishTimestamp = null;

// Track which elements have been successfully initialized
const trackedElements = new Set();

function calculateTotalTime(sessions) {
    const total = sessions.reduce((sum, session) => {
        return sum + parseFloat(session.durationSeconds);
    }, 0);
    return total.toFixed(2);
}

function createSessionObject(first, last) {
    return {
        f: first,
        l: last,
        d: ((last - first) / 1000).toFixed(2)
    };
}

function trackTextareaTimestamps(sourceId, label) {
    // Initialize timestamp data
    if (!timestampData[sourceId]) {
        timestampData[sourceId] = {
            label: label || sourceId,
            sessions: [],
            currentSession: null,
            lastEditTimeout: null,
            inputType: null,
            trackedElements: new Set()
        };
        console.log(`[${sourceId}] Initialized timestamp tracking:`, timestampData[sourceId]);
    }
    
    // Function to attach listeners to a textarea
    function attachTextareaListeners(textarea) {
        if (timestampData[sourceId].trackedElements.has(textarea)) {
            return;
        }
        
        timestampData[sourceId].trackedElements.add(textarea);
        timestampData[sourceId].inputType = 'textarea';
        trackedElements.add(sourceId); // Mark as successfully tracked
        console.log(`[${sourceId}] Found and attached listeners to textarea`);
        
        textarea.addEventListener('focus', function() {
            timestampData[sourceId].currentSession = {
                first: Date.now(),
                last: Date.now()
            };
            console.log(`[${sourceId}] Textarea focused - Started new session:`, timestampData[sourceId].currentSession);
        });
        
        textarea.addEventListener('input', function() {
            const data = timestampData[sourceId];
            
            if (!data.currentSession) {
                data.currentSession = {
                    first: Date.now(),
                    last: Date.now()
                };
                console.log(`[${sourceId}] Textarea input - Created new session:`, data.currentSession);
            } else {
                data.currentSession.last = Date.now();
                console.log(`[${sourceId}] Textarea input - Updated last timestamp:`, data.currentSession);
            }
            
            if (data.lastEditTimeout) {
                clearTimeout(data.lastEditTimeout);
            }
            
            data.lastEditTimeout = setTimeout(function() {
                console.log(`[${sourceId}] Edit timeout reached (60 seconds)`);
            }, 60000);
        });
        
        textarea.addEventListener('blur', function() {
            const data = timestampData[sourceId];
            
            if (data.lastEditTimeout) {
                clearTimeout(data.lastEditTimeout);
                data.lastEditTimeout = null;
                console.log(`[${sourceId}] Textarea blur - Cleared edit timeout`);
            }
            
            if (data.currentSession) {
                const sessionWithDuration = createSessionObject(
                    data.currentSession.first,
                    data.currentSession.last
                );
                data.sessions.push(sessionWithDuration);
                console.log(`[${sourceId}] Textarea blur - Session saved:`, sessionWithDuration);
                console.log(`[${sourceId}] Total sessions:`, data.sessions.length);
                data.currentSession = null;
            }
        });
    }
    
    // Function to attach listeners to radio/checkbox
    function attachRadioCheckboxListeners(input) {
        if (timestampData[sourceId].trackedElements.has(input)) {
            return;
        }
        
        timestampData[sourceId].trackedElements.add(input);
        const inputType = input.type;
        timestampData[sourceId].inputType = inputType;
        trackedElements.add(sourceId); // Mark as successfully tracked
        console.log(`[${sourceId}] Found and attached listeners to ${inputType}: ${input.value || input.id}`);
        
        input.addEventListener('change', function() {
            const data = timestampData[sourceId];
            const timestamp = Date.now();
            
            const sessionWithDuration = createSessionObject(
                timestamp,
                timestamp
            );
            
            if (inputType === 'radio') {
                sessionWithDuration.value = this.value;
                console.log(`[${sourceId}] Radio changed - Value: ${this.value}`);
            } else if (inputType === 'checkbox') {
                sessionWithDuration.value = this.value || this.id;
                sessionWithDuration.checked = this.checked;
                console.log(`[${sourceId}] Checkbox changed - Value: ${sessionWithDuration.value}, Checked: ${this.checked}`);
            }
            
            data.sessions.push(sessionWithDuration);
            console.log(`[${sourceId}] Session saved:`, sessionWithDuration);
            console.log(`[${sourceId}] Total sessions:`, data.sessions.length);
            console.log(`[${sourceId}] Current timestamp data:`, timestampData[sourceId]);
        });
    }
    
    // Function to check for and attach listeners to any new elements
    function checkAndAttachListeners(element) {
        const textareas = element.querySelectorAll('textarea');
        textareas.forEach(textarea => attachTextareaListeners(textarea));
        
        const radioButtons = element.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => attachRadioCheckboxListeners(radio));
        
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => attachRadioCheckboxListeners(checkbox));
    }
    
    // Function to set up observer on element
    function setupObserver(element) {
        console.log(`[${sourceId}] Element found, setting up observer`);
        
        // Initial check for existing elements
        checkAndAttachListeners(element);
        
        // Set up MutationObserver to watch for new elements
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'TEXTAREA') {
                                attachTextareaListeners(node);
                            } else if (node.tagName === 'INPUT' && (node.type === 'radio' || node.type === 'checkbox')) {
                                attachRadioCheckboxListeners(node);
                            }
                            
                            if (node.querySelectorAll) {
                                checkAndAttachListeners(element);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(element, {
            childList: true,
            subtree: true
        });
        
        console.log(`[${sourceId}] MutationObserver started - watching for new inputs`);
    }
    
    // Check if element exists now
    const element = document.getElementById(sourceId);
    if (element) {
        setupObserver(element);
    } else {
        // Element doesn't exist yet, watch for it to appear
        console.log(`[${sourceId}] Element not found yet, watching for it to appear...`);
        
        const bodyObserver = new MutationObserver(function(mutations) {
            const element = document.getElementById(sourceId);
            if (element) {
                console.log(`[${sourceId}] Element appeared!`);
                bodyObserver.disconnect();
                setupObserver(element);
            }
        });
        
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize tracking for a list of items
function initializeTracking(trackingItems) {
    trackingItems.forEach(item => {
        // Just call the function - it will handle waiting for elements
        trackTextareaTimestamps(item.id, item.label);
        console.log(`[${item.id}] Tracking initialized (will wait for element if needed)`);
    });
}

function getAllTrackedData() {
    const allData = {};

    // Add START and FINISHED timestamps to the data
    allData['_metadata'] = {
        start: startTimestamp,
        finished: finishTimestamp,
        totalDuration: finishTimestamp ? ((finishTimestamp - startTimestamp) / 1000).toFixed(2) : null,
        trackedCount: trackedElements.size
    };

    for (const sourceId in timestampData) {
        const data = timestampData[sourceId];
        
        let sessions = [...data.sessions];
        if (data.currentSession) {
            sessions.push(createSessionObject(
                data.currentSession.first,
                data.currentSession.last
            ));
        }
        
        const idNumber = sourceId.split('-')[1];
        
        allData[idNumber] = {
            lbl: data.label,
            s: sessions,
            tot: calculateTotalTime(sessions.map(s => ({durationSeconds: s.d}))),
            ed: data.currentSession !== null ? 1 : 0,
            lb: data.currentSession ? null : Date.now()
        };
    }

    return allData;
}

function collectAndEncodeData() {
    const allData = getAllTrackedData();
    
    const jsonString = JSON.stringify(allData);
    const encoded = btoa(jsonString);
    
    return encoded;
}

// EASILY CHANGE TARGET: Modify this to change which question receives the metadata
const METADATA_TARGET_ID = 'question-19';

function updateMetadataTextarea() {
    try {
        const encodedData = collectAndEncodeData();
        const targetElement = document.getElementById(METADATA_TARGET_ID);

        if (targetElement) {
            // First, try clicking the label (if exists)
            const label = targetElement.querySelector('label');
            if (label) {
                label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                label.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                label.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
            
            // Click the container element
            targetElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            targetElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            targetElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            
            const targetTextarea = targetElement.querySelector('textarea');
            
            if (targetTextarea) {
                // Simulate full user interaction sequence
                targetTextarea.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                targetTextarea.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                targetTextarea.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                targetTextarea.focus();
                targetTextarea.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));
                targetTextarea.dispatchEvent(new FocusEvent('focusin', { bubbles: true, cancelable: true }));
                
                // Store old value for comparison
                const oldValue = targetTextarea.value;
                
                // Use the native setter to bypass any getters/setters
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeInputValueSetter.call(targetTextarea, encodedData);
                
                // Create a proper InputEvent (more realistic than generic Event)
                const inputEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: encodedData,
                    dataTransfer: null,
                    view: window
                });
                targetTextarea.dispatchEvent(inputEvent);
                
                // Dispatch change event
                targetTextarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                
                // Simulate keyboard events (as if user typed)
                targetTextarea.dispatchEvent(new KeyboardEvent('keydown', { 
                    bubbles: true, 
                    cancelable: true, 
                    key: 'a',
                    code: 'KeyA',
                    keyCode: 65
                }));
                targetTextarea.dispatchEvent(new KeyboardEvent('keypress', { 
                    bubbles: true, 
                    cancelable: true, 
                    key: 'a',
                    code: 'KeyA',
                    keyCode: 65
                }));
                targetTextarea.dispatchEvent(new KeyboardEvent('keyup', { 
                    bubbles: true, 
                    cancelable: true, 
                    key: 'a',
                    code: 'KeyA',
                    keyCode: 65
                }));
                
                // Trigger custom Angular events
                targetTextarea.dispatchEvent(new CustomEvent('ngModelChange', { 
                    detail: encodedData, 
                    bubbles: true 
                }));
                targetTextarea.dispatchEvent(new CustomEvent('valueChange', { 
                    detail: encodedData, 
                    bubbles: true 
                }));
                
                // Mark the field as touched/dirty for Angular forms
                if (targetTextarea.classList) {
                    targetTextarea.classList.add('ng-touched');
                    targetTextarea.classList.add('ng-dirty');
                    targetTextarea.classList.remove('ng-pristine');
                    targetTextarea.classList.remove('ng-untouched');
                }
                
                // Update the display div (if it exists)
                const parentDiv = targetTextarea.parentElement;
                if (parentDiv) {
                    const previousSiblingDiv = parentDiv.previousElementSibling;
                    if (previousSiblingDiv) {
                        previousSiblingDiv.textContent = '';
                        const textNode = document.createTextNode(encodedData);
                        previousSiblingDiv.appendChild(textNode);
                    }
                }
                
                // Blur to trigger validation
                targetTextarea.blur();
                targetTextarea.dispatchEvent(new FocusEvent('blur', { bubbles: true, cancelable: true }));
                targetTextarea.dispatchEvent(new FocusEvent('focusout', { bubbles: true, cancelable: true }));
                
                // Re-focus after a tiny delay (helps with some frameworks)
                setTimeout(() => {
                    targetTextarea.focus();
                    targetTextarea.blur();
                }, 10);
            } else {
                console.warn(`Metadata textarea not found in ${METADATA_TARGET_ID}`);
            }
        } else {
            console.warn(`Target element ${METADATA_TARGET_ID} not found`);
        }
    } catch (error) {
        console.error('Error updating metadata textarea:', error);
    }
}

function decodeData(encodedString) {
    try {
        const jsonString = atob(encodedString);
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

// Function to attach listener to submit button
function attachSubmitListener() {
    const submitButton = document.querySelector('[data-testid="task-response-editor-submit"]');
    
    if (submitButton) {
        // Add listener that doesn't interfere with other functionality
        submitButton.addEventListener('click', function() {
            // Record finished timestamp
            finishTimestamp = Date.now();
            console.log('FINISHED timestamp recorded:', finishTimestamp);
            
            // Also paste the final metadata to the textarea
            updateMetadataTextarea();
            console.log('Final metadata pasted to', METADATA_TARGET_ID);
        }, true); // Use capture phase to ensure it runs early
        
        console.log('Submit button listener attached successfully');
    } else {
        // If button doesn't exist yet, try again in a moment
        console.log('Submit button not found, retrying...');
        setTimeout(attachSubmitListener, 500);
    }
}

// Function to style the metadata textarea
function styleMetadataTextarea() {
    const targetElement = document.getElementById(METADATA_TARGET_ID);
    if (targetElement) {
        const textarea = targetElement.querySelector("textarea");
        if (textarea) {
            Object.assign(textarea.style, {
                color: "rgba(255,255,255,0)",  // hide text
                caretColor: "transparent",     // hide cursor
                maxHeight: "50px",
                border: "1px solid #fff",      // white border
                background: "#fff",            // blend with page
                pointerEvents: "none",         // block typing/clicks
                userSelect: "none"             // prevent highlight
            });
            console.log('Metadata textarea styled successfully');
            return true;
        }
    }
    return false;
}

// Main initialization function
function initialize() {
    console.log('Starting initialization...');
    
    const trackingItems = [
        {id: 'question-2', label: 'OH_A'},
        {id: 'question-3', label: 'OH_A_ISS'},
        {id: 'question-4', label: 'SAF_ISS_A'},
        {id: 'question-5', label: 'REL_ISS_A'},
        {id: 'question-6', label: 'ACC_ISS_A'},
        {id: 'question-7', label: 'GROU_ISS_A'},
        {id: 'question-8', label: 'COMPO_ISS_A'},
        {id: 'question-10', label: 'OH_B'},
        {id: 'question-11', label: 'OH_B_ISS'},
        {id: 'question-12', label: 'SAF_ISS_B'},
        {id: 'question-13', label: 'REL_ISS_B'},
        {id: 'question-14', label: 'ACC_ISS_B'},
        {id: 'question-15', label: 'GROU_ISS_B'},
        {id: 'question-16', label: 'COMPO_ISS_B'},
        {id: 'question-17', label: 'HTH'},
        {id: 'question-18', label: 'RAT'},
    ];
    
    // Initialize tracking for all items
    initializeTracking(trackingItems);
    
    // Try to style metadata textarea (may need retry)
    if (!styleMetadataTextarea()) {
        // Retry styling after elements load
        const styleRetryInterval = setInterval(() => {
            if (styleMetadataTextarea()) {
                clearInterval(styleRetryInterval);
            }
        }, 500);
        
        // Stop trying after 10 seconds
        setTimeout(() => clearInterval(styleRetryInterval), 10000);
    }
    
    // Attach listener to submit button
    attachSubmitListener();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already ready
    initialize();
}

// Also initialize on window load as a fallback
window.addEventListener('load', function() {
    // Double-check initialization
    if (trackedElements.size === 0) {
        console.log('Reinitializing on window load...');
        initialize();
    }
});

// Expose functions globally for debugging
window.getAllTrackedData = getAllTrackedData;
window.decodeData = decodeData;
window.getTrackingStatus = function() {
    return {
        tracked: Array.from(trackedElements),
        data: timestampData
    };
};

};