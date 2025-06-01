'use client';

// Driver.js - A simple driver for handling user interactions and state management

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

class Driver {
    constructor() {
        this.state = {
            isActive: false,
            currentStep: 0,
            steps: []
        };
    }

    // Initialize the driver with steps
    init(steps) {
        this.state.steps = steps;
        this.state.currentStep = 0;
        this.state.isActive = false;
    }

    // Start the driver
    start() {
        if (this.state.steps.length === 0) {
            console.warn('No steps defined for the driver');
            return;
        }
        this.state.isActive = true;
        this.showStep(this.state.currentStep);
    }

    // Move to the next step
    next() {
        if (this.state.currentStep < this.state.steps.length - 1) {
            this.state.currentStep++;
            this.showStep(this.state.currentStep);
        } else {
            this.complete();
        }
    }

    // Move to the previous step
    previous() {
        if (this.state.currentStep > 0) {
            this.state.currentStep--;
            this.showStep(this.state.currentStep);
        }
    }

    // Show a specific step
    showStep(stepIndex) {
        const step = this.state.steps[stepIndex];
        if (step) {
            // Implementation for showing the step
            // This could include highlighting elements, showing tooltips, etc.
            console.log(`Showing step ${stepIndex}:`, step);
        }
    }

    // Complete the driver
    complete() {
        this.state.isActive = false;
        this.state.currentStep = 0;
        console.log('Driver completed');
    }

    // Reset the driver
    reset() {
        this.state.currentStep = 0;
        this.state.isActive = false;
    }
}

export const initDriver = () => {
    const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: [
            {
                element: "#regex-input-container",
                popover: {
                    title: "Step 1: Enter Pattern",
                    description: "Enter your regular expression pattern here. For example: a(b|c)*d. You can use operators like | (or), * (zero or more), + (one or more), ? (optional), and () for grouping.",
                    position: "bottom",
                },
            },
            {
                element: "#visualize-button",
                popover: {
                    title: "Step 2: Visualize",
                    description: "Click this button to convert your regex into an NFA visualization. The NFA will show states (circles) and transitions (arrows) between them.",
                    position: "bottom",
                },
            },
            {
                element: "#nfa-visualization",
                popover: {
                    title: "Step 3: View NFA",
                    description: "Here you'll see the NFA visualization of your regular expression. Blue circles are start states, green circles are accept states, and gray circles are intermediate states. Arrows show transitions with their symbols (a, b, c, or ε for epsilon). You can drag nodes to rearrange them and use the mouse wheel to zoom.",
                    position: "left",
                },
            },
            {
                element: "#simulation-container",
                popover: {
                    title: "Step 4: Test & Simulate",
                    description: "Enter a test string and use the simulation controls to see how the NFA processes it. The active states will be highlighted in yellow. Use the play button to animate the process, or step through it manually. The simulation will show you exactly how the NFA processes each character of your input string.",
                    position: "left",
                },
            },
        ],
    });

    return driverObj;
};

export default Driver; 