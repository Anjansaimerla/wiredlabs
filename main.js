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

    // Configuration for the "reactive orb"
    const particles = [];
    const numParticles = 800; // Dense sphere
    
    // Create Fibonacci sphere distribution
    for (let i = 0; i < numParticles; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        particles.push({
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi),
            baseRadius: Math.random() * 1.5 + 1.0,
            currentRadius: 0,
            wasHovered: false
        });
    }

    // Mouse tracking
    const mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    let time = 0;
    const blasts = [];

    const render = () => {
        requestAnimationFrame(render);
        time += 0.005;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35; // Orb size

        // Background Glow
        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
        bgGradient.addColorStop(0, 'rgba(212, 175, 55, 0.05)');
        bgGradient.addColorStop(1, 'rgba(10, 10, 11, 0)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Project and depth sort
        const projected = particles.map(p => {
            // Rotations
            const cosY = Math.cos(time);
            const sinY = Math.sin(time);
            const cosX = Math.cos(time * 0.5);
            const sinX = Math.sin(time * 0.5);

            // Apply Y rotation
            let x1 = p.x * cosY - p.z * sinY;
            let z1 = p.z * cosY + p.x * sinY;

            // Apply X rotation
            let y1 = p.y * cosX - z1 * sinX;
            let z2 = z1 * cosX + p.y * sinX;

            return {
                orig: p,
                x: x1 * radius + centerX,
                y: y1 * radius + centerY,
                z: z2 * radius,
                scale: (z2 / radius + 1) / 2 // 0 (back) to 1 (front)
            };
        });

        // Sort by Z to draw back to front
        projected.sort((a, b) => a.z - b.z);

        projected.forEach(p => {
            // Distance from mouse to projected 2D center
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let targetRadius = p.orig.baseRadius;
            let alpha = 0.3 + (p.scale * 0.7); // Front is opaque, back is faded
            let isHovered = false;

            // If it's on the front half of the orb and close to the mouse
            if (p.z > 0 && dist < 120) {
                const reaction = 1 - (dist / 120);
                targetRadius += reaction * 4.5; // Grow larger
                alpha = Math.min(1, alpha + reaction); // Max opacity
                isHovered = true;

                if (!p.orig.wasHovered) {
                    p.orig.wasHovered = true;
                    // Spawn blast
                    if (Math.random() > 0.3) {
                        for (let b = 0; b < 4; b++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = Math.random() * 5 + 2;
                            blasts.push({
                                x: p.x,
                                y: p.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                life: 1.0,
                                decay: Math.random() * 0.06 + 0.03
                            });
                        }
                    }
                }
            } else {
                p.orig.wasHovered = false;
            }

            // Lerp radius for smooth transitions
            p.orig.currentRadius += (targetRadius - p.orig.currentRadius) * 0.15;

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.orig.currentRadius * Math.max(0.3, p.scale), 0, Math.PI * 2);
            
            if (isHovered) {
                ctx.fillStyle = `rgba(255, 223, 115, ${alpha})`; // Bright yellow burst
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(255, 223, 115, 0.8)';
            } else {
                ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`; // Normal Gold
                ctx.shadowBlur = 0;
            }
            
            ctx.fill();
        });

        // Render Blasts
        ctx.shadowBlur = 0;
        for (let i = blasts.length - 1; i >= 0; i--) {
            const b = blasts[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life -= b.decay;

            if (b.life <= 0) {
                blasts.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
                ctx.strokeStyle = `rgba(255, 223, 115, ${b.life})`;
                ctx.lineWidth = Math.max(0.5, b.life * 2);
                ctx.stroke();
            }
        }
    };

    render();
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
