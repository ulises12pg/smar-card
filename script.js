/* ╔══════════════════════════════════════════════════╗
   ║  SMAR Digital Business Card – JavaScript        ║
   ║  Soldadura & Maquinados Rodriguez               ║
   ╚══════════════════════════════════════════════════╝ */

// ── Gallery Data ────────────────────────────────────
const galleryItems = [
    { src: 'images/project1.jpeg', caption: 'Soldadura Estructural' },
    { src: 'images/project2.jpeg', caption: 'Maquinado CNC' },
    { src: 'images/project3.png', caption: 'Fabricación a Medida' },
    { src: 'images/project4.png', caption: 'Herrería Industrial' },
    { src: 'images/project5.png', caption: 'Piezas de Precisión' },
];

let currentLightboxIndex = 0;
let toastTimeout;

// ── Initialization ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    generateQRCode();
    setupKeyboardNav();
    setupTouchNav();
});

// ── Background Particles ────────────────────────────
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('bg-particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = (50 + Math.random() * 50) + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.width = (2 + Math.random() * 2) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ── QR Code Generation ─────────────────────────────
function generateQRCode() {
    const container = document.getElementById('qrCodeContainer');
    if (!container || typeof QRCode === 'undefined') return;

    // Use the current page URL for the QR code
    const cardURL = window.location.href;

    new QRCode(container, {
        text: cardURL,
        width: 160,
        height: 160,
        colorDark: '#1a1a1a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ── Download QR Code ────────────────────────────────
function downloadQR() {
    const container = document.getElementById('qrCodeContainer');
    const canvas = container.querySelector('canvas');

    if (canvas) {
        canvas.toBlob(function(blob) {
            if (!blob) {
                showToast('Error al generar el archivo');
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'SMAR-Tarjeta-QR.png';
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('QR descargado correctamente');
        }, 'image/png');
    } else {
        // Fallback: try to download the img element
        const img = container.querySelector('img');
        if (img && img.src) {
            // Convert the base64 data URL to a blob
            fetch(img.src)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'SMAR-Tarjeta-QR.png';
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    showToast('QR descargado correctamente');
                })
                .catch(() => showToast('Error al descargar el QR'));
        } else {
            showToast('Error al descargar el QR');
        }
    }
}

// ── Share Card ──────────────────────────────────────
async function shareCard() {
    const shareData = {
        title: 'SMAR - Soldadura & Maquinados Rodriguez',
        text: 'Consulta la tarjeta digital de SMAR - Soldadura & Maquinados Rodriguez. Servicios de soldadura y maquinados industriales.',
        url: window.location.href,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (err.name !== 'AbortError') {
                fallbackShare();
            }
        }
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    copyToClipboardDirect(window.location.href);
    showToast('Enlace copiado al portapapeles');
}

// ── Lightbox ────────────────────────────────────────
function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');

    img.src = galleryItems[index].src;
    img.alt = galleryItems[index].caption;
    caption.textContent = galleryItems[index].caption;
    counter.textContent = `${index + 1} / ${galleryItems.length}`;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = galleryItems.length - 1;
    if (currentLightboxIndex >= galleryItems.length) currentLightboxIndex = 0;

    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lightboxCounter');

    // Animate transition
    img.style.opacity = '0';
    img.style.transform = direction > 0 ? 'translateX(30px)' : 'translateX(-30px)';

    setTimeout(() => {
        img.src = galleryItems[currentLightboxIndex].src;
        img.alt = galleryItems[currentLightboxIndex].caption;
        caption.textContent = galleryItems[currentLightboxIndex].caption;
        counter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;

        img.style.transform = direction > 0 ? 'translateX(-30px)' : 'translateX(30px)';
        requestAnimationFrame(() => {
            img.style.transition = 'all 0.3s ease';
            img.style.opacity = '1';
            img.style.transform = 'translateX(0)';

            setTimeout(() => {
                img.style.transition = '';
            }, 300);
        });
    }, 150);
}

// Keyboard navigation for lightbox
function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': navigateLightbox(-1); break;
            case 'ArrowRight': navigateLightbox(1); break;
        }
    });
}

// Touch swipe navigation for lightbox
function setupTouchNav() {
    const lightbox = document.getElementById('lightbox');
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                navigateLightbox(1);
            } else {
                navigateLightbox(-1);
            }
        }
    }, { passive: true });
}

// ── VCard Download ──────────────────────────────────
function downloadVCard() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Rodriguez;Alex;;;
FN:SMAR - Soldadura & Maquinados Rodriguez
ORG:SMAR - Soldadura & Maquinados Rodriguez
TEL;TYPE=CELL:+529989363962
TEL;TYPE=CELL:+523328300782
EMAIL;TYPE=WORK:rodriguezalex82602@gmail.com
EMAIL;TYPE=WORK:m_alejandror@hotmail.com
URL:${window.location.href}
X-SOCIALPROFILE;TYPE=facebook:https://www.facebook.com/share/1BYs3tFG1R/
X-SOCIALPROFILE;TYPE=tiktok:https://www.tiktok.com/@edgar24hrs?_r=1&_t=ZS-97F3dMNvd5O
NOTE:Soldadura y Maquinados Industriales - Donde la precisión del diseño se une con la fuerza del acero
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SMAR-Contacto.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Contacto descargado');
}

// ── Toast Notifications ─────────────────────────────
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ── Clipboard ───────────────────────────────────────
function copyToClipboard(text, event) {
    // Prevent the click from triggering the parent link
    event.preventDefault();
    event.stopPropagation();

    copyToClipboardDirect(text);
    showToast('Copiado: ' + text);
}

function copyToClipboardDirect(text) {
    // Try modern API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
        return;
    }

    fallbackCopy(text);
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Clipboard fallback failed:', err);
    }

    document.body.removeChild(textArea);
}
