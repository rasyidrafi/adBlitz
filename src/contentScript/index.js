/**
 * Initializes the ad skipping functionality and observes changes in the target node.
 * @param {Node} targetNode - The node to observe for changes.
*/
// variable to store the MutationObserver instance
let observer;

// Function to handle ad skipping logic
const execute = (targetNode) => {
    const increaseAdPlaybackSpeed = () => {
        const videoElement = document.querySelector("video")
        if (videoElement) {
            videoElement.playbackRate = Math.floor(Math.random() * 4) + 2; // Randomize between 2 and 5
            videoElement.volume = 0;
            chrome.runtime.sendMessage({ action: 'adSpeeded' });
        }
    }

    const skipAdWithDelay = (button) => {
        const delay = Math.floor(Math.random() * 2000) + 1000; // Random delay between 1000ms and 3000ms
        setTimeout(() => {
            button.click();
            chrome.runtime.sendMessage({ action: 'adSkipped' });
        }, delay);
    };

    const skipAdFallback = () => {
        let isSkipped = false;
        const skipAddButtons = document.getElementsByClassName("ytp-ad-skip-button-text");
        if (skipAddButtons.length === 1) {
            const button = skipAddButtons[0];
            const skipButtonCta = button.parentElement.classList.contains("ytp-ad-skip-button-modern");
            if (skipButtonCta) {
                skipAdWithDelay(button.parentElement);
                isSkipped = true;
            }
        }
        return isSkipped
    }

    const skipAd = () => {
        const skipAddButtons = document.getElementsByClassName("ytp-skip-ad-button");
        if (skipAddButtons.length) {
            const skipButtonCta = skipAddButtons[0];
            if (skipButtonCta) {
                skipAdWithDelay(skipButtonCta);
            }
        } else if (!skipAdFallback()) {
            increaseAdPlaybackSpeed()
        }
    };

    // Function to check if a node has child elements
    const checkChildElements = (node) => {
        return node?.children?.length > 0
    }

    // Function to check for child elements and skip ad
    const checkForChildElementAndSkipAd = (node) => {
        checkChildElements(node) && skipAd()
    }

    // Callback function for MutationObserver
    const observerCallback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const randomTimeout = Math.random() * (2000 - 500) + 500; // Random delay between 500ms and 2000ms
                setTimeout(() => {
                    checkForChildElementAndSkipAd(targetNode);
                }, randomTimeout);
            }
        }
    }

    // Disconnect existing observer if any
    if (observer && observer.disconnect) {
        observer.disconnect()
    }

    // Create a new MutationObserver to observe targetNode
    observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, { childList: true });
    // Check for child elements and skip ad initially
    checkForChildElementAndSkipAd(targetNode)
}

const handleSkipOrSpeedAd = () => {
    const targetNode = document.querySelector(".video-ads.ytp-ad-module");
    targetNode && execute(targetNode)
}

// MutationObserver to observe changes
if (window.MutationObserver) {
    const observer = new MutationObserver(handleSkipOrSpeedAd);
    observer.observe(document.body, {
        atrributes: true,
        attributeFilter: ['class', 'src'],
        childList: true,
        subtree: true
    })
} else {
    window.setInterval(handleSkipOrSpeedAd, 500);
}

handleSkipOrSpeedAd()