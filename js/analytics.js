// ===== GOOGLE ANALYTICS CONFIGURATION =====

// Your Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-FXVSR2CJDM';

// Initialize Google Analytics
function initGoogleAnalytics() {
    // Create and append the Google Analytics script
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        // Enhanced measurement settings
        send_page_view: true,
        anonymize_ip: true, // GDPR compliance
        allow_google_signals: false, // Set to true if you want Google Signals
        cookie_flags: 'SameSite=None;Secure'
    });
}

// ===== CUSTOM EVENT TRACKING =====

// Track button clicks
function trackButtonClick(buttonName, category = 'Button') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: category,
            event_label: buttonName,
            value: 1
        });
    }
}

// Track form submissions
function trackFormSubmission(formName, category = 'Form') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            event_category: category,
            event_label: formName,
            value: 1
        });
    }
}

// Track page views for SPA or dynamic content
function trackPageView(pagePath, pageTitle) {
    if (typeof gtag !== 'undefined') {
        gtag('config', GA_MEASUREMENT_ID, {
            page_path: pagePath,
            page_title: pageTitle
        });
    }
}

// Track scroll depth
function trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    let trackedMilestones = [];

    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                    trackedMilestones.push(milestone);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll', {
                            event_category: 'Engagement',
                            event_label: `${milestone}%`,
                            value: milestone
                        });
                    }
                }
            });
        }
    });
}

// Track file downloads
function trackDownload(fileName, fileType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'file_download', {
            event_category: 'Download',
            event_label: fileName,
            file_extension: fileType,
            value: 1
        });
    }
}

// Track external link clicks
function trackExternalLink(url, linkText) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: 'External Link',
            event_label: url,
            event_action: linkText,
            value: 1
        });
    }
}

// Track contact form specific events
function trackContactFormEvents() {
    // Track form start (when user focuses on first field)
    const firstFormField = document.querySelector('.contact-form input, .contact-form select, .contact-form textarea');
    if (firstFormField) {
        let formStarted = false;
        firstFormField.addEventListener('focus', function() {
            if (!formStarted) {
                formStarted = true;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_start', {
                        event_category: 'Form',
                        event_label: 'Contact Form',
                        value: 1
                    });
                }
            }
        });
    }

    // Track successful form submission
    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            trackFormSubmission('Contact Form', 'Lead Generation');
            
            // Track conversion goal
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    send_to: GA_MEASUREMENT_ID,
                    event_category: 'Goal',
                    event_label: 'Contact Form Completed',
                    value: 1
                });
            }
        });
    }
}

// ===== ENHANCED ECOMMERCE TRACKING (for future service purchases) =====
function trackServiceInterest(serviceName, servicePrice) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_item', {
            currency: 'USD',
            value: servicePrice,
            items: [{
                item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
                item_name: serviceName,
                item_category: 'Service',
                price: servicePrice,
                quantity: 1
            }]
        });
    }
}

function trackServiceInquiry(serviceName, servicePrice) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'add_to_cart', {
            currency: 'USD',
            value: servicePrice,
            items: [{
                item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
                item_name: serviceName,
                item_category: 'Service',
                price: servicePrice,
                quantity: 1
            }]
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Analytics
    initGoogleAnalytics();
    
    // Initialize scroll tracking
    trackScrollDepth();
    
    // Initialize contact form tracking
    trackContactFormEvents();
    
    // Track button clicks automatically
    document.querySelectorAll('button, .btn, .cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim() || this.getAttribute('aria-label') || 'Unknown Button';
            trackButtonClick(buttonText);
        });
    });
    
    // Track external links automatically
    document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').forEach(link => {
        link.addEventListener('click', function() {
            const url = this.href;
            const linkText = this.textContent.trim() || url;
            trackExternalLink(url, linkText);
        });
    });
    
    // Track service interest on service page
    if (window.location.pathname.includes('servicios')) {
        document.querySelectorAll('.service-card, .btn[href*="servicios"]').forEach(element => {
            element.addEventListener('click', function() {
                const serviceName = this.querySelector('h3')?.textContent || 'Service Inquiry';
                trackServiceInterest(serviceName, 0); // Price can be added later
            });
        });
    }
});

// ===== PRIVACY COMPLIANCE =====

// Cookie consent handling (basic implementation)
function handleCookieConsent() {
    const cookieConsent = localStorage.getItem('ga_cookie_consent');
    
    if (cookieConsent === null) {
        // Show cookie banner or modal
        showCookieConsentBanner();
    } else if (cookieConsent === 'accepted') {
        // User has accepted cookies, continue with GA
        return true;
    } else {
        // User has declined cookies, disable GA
        disableGoogleAnalytics();
        return false;
    }
}

function showCookieConsentBanner() {
    // This is a basic implementation - you might want to use a more sophisticated solution
    const banner = document.createElement('div');
    banner.innerHTML = `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 1rem; z-index: 10000; text-align: center;">
            <p style="margin: 0 0 1rem 0;">Este sitio utiliza Google Analytics para mejorar la experiencia del usuario. 
            <a href="#" style="color: #4CAF50;">Política de Privacidad</a></p>
            <button onclick="acceptCookies()" style="background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; margin-right: 0.5rem; border-radius: 4px; cursor: pointer;">Aceptar</button>
            <button onclick="declineCookies()" style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Declinar</button>
        </div>
    `;
    document.body.appendChild(banner);
}

function acceptCookies() {
    localStorage.setItem('ga_cookie_consent', 'accepted');
    document.querySelector('[style*="position: fixed; bottom: 0"]')?.remove();
    initGoogleAnalytics();
}

function declineCookies() {
    localStorage.setItem('ga_cookie_consent', 'declined');
    document.querySelector('[style*="position: fixed; bottom: 0"]')?.remove();
    disableGoogleAnalytics();
}

function disableGoogleAnalytics() {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

// Export functions for global use
window.trackButtonClick = trackButtonClick;
window.trackFormSubmission = trackFormSubmission;
window.trackPageView = trackPageView;
window.trackDownload = trackDownload;
window.trackExternalLink = trackExternalLink;
window.trackServiceInterest = trackServiceInterest;
window.trackServiceInquiry = trackServiceInquiry;
window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;
