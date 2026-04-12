import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize Hero Canvas Animation (Purely Scroll-Linked)
const initHeroCanvas = () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Configuration for the "wired" look
    const nodes = [];
    const nodeCount = 60;
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    const render = (progress) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.max(canvas.width, canvas.height);

        // Background Glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.8);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.05)');
        gradient.addColorStop(1, 'rgba(10, 10, 11, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Nodes and Connections
        ctx.strokeStyle = '#D4AF37';
        ctx.fillStyle = '#D4AF37';

        nodes.forEach((node, i) => {
            // Calculate position with parallax and scroll influence
            const scrollInfluence = progress * 500 * node.speed;
            const x = (node.x * canvas.width + (scrollInfluence * (i % 2 === 0 ? 1 : -1))) % canvas.width;
            const y = (node.y * canvas.height + scrollInfluence) % canvas.height;

            // Draw Node
            ctx.globalAlpha = 0.3 + (progress * 0.7);
            ctx.beginPath();
            ctx.arc(x, y, node.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw Connections
            nodes.forEach((target, j) => {
                if (i === j) return;
                const tx = (target.x * canvas.width + (progress * 500 * target.speed * (j % 2 === 0 ? 1 : -1))) % canvas.width;
                const ty = (target.y * canvas.height + (progress * 500 * target.speed)) % canvas.height;

                const dist = Math.sqrt((x - tx) ** 2 + (y - ty) ** 2);
                if (dist < 150) {
                    ctx.globalAlpha = (1 - (dist / 150)) * 0.2 * (progress + 0.2);
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(tx, ty);
                    ctx.stroke();
                }
            });
        });

        // Pulsating center ring
        ctx.globalAlpha = 0.1 + (progress * 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100 + (progress * 200), 0, Math.PI * 2);
        ctx.stroke();
    };

    // Link scroll to canvas render
    gsap.to({}, {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => render(self.progress)
        }
    });

    render(0);
};

// Premium Reveal Animations
const initRevelations = () => {
    gsap.utils.toArray('.reveal').forEach((elem) => {
        gsap.fromTo(elem,
            {
                y: 60,
                opacity: 0,
                filter: "blur(5px)"
            },
            {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "expo.out",
            }
        );
    });
};

// 3D Tilt Effect for Tiles
const initTiltEffect = () => {
    const tiles = document.querySelectorAll('.tilt-enabled');
    tiles.forEach(tile => {
        tile.addEventListener('mousemove', (e) => {
            const rect = tile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(tile, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        tile.addEventListener('mouseleave', () => {
            gsap.to(tile, {
                rotateX: 0,
                rotateY: 0,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
};

// Magnetic Effects
const initMagneticEffects = () => {
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(magnet, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
};

// Form Submission Logic - Google Sheets backend
const initFormSubmission = () => {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable button and show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Transmitting...';
            submitBtn.disabled = true;
            status.innerText = '';

            // Gather form data and convert to URL encoded string for Google Apps Script
            const formData = new FormData(form);
            const data = new URLSearchParams(formData);

            try {
                // GOOGLE APPS SCRIPT WEB APP URL
                const scriptURL = 'https://script.google.com/macros/s/AKfycbz77BPWHKvy0cZKrV3c_leHQmU8Q3oCTHIpmkhqXOap_WQnvEVYlMCYNqxleLH_t1Qt0Q/exec';

                await fetch(scriptURL, {
                    method: 'POST',
                    body: data,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    mode: 'no-cors' // Google Script needs this to prevent CORS errors on simple unauthenticated POSTs
                });

                status.innerText = 'Transmission Successful. We will link up soon.';
                status.style.color = '#D4AF37';
                form.reset();
            } catch (error) {
                console.error('Error!', error.message);
                status.innerText = error.message.includes('YOUR_GOOGLE')
                    ? 'Setup Error: Google Sheet URL missing in main.js.'
                    : 'Transmission Failed. Secure link unstable.';
                status.style.color = 'red';
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
};

window.addEventListener('load', () => {
    initHeroCanvas();
    initRevelations();
    initTiltEffect();
    initMagneticEffects();
    initFormSubmission();
});
