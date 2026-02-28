// Supabase Configuration
const SUPABASE_CONFIG = {
    url: "https://qzatavslhtkioivemwlk.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXRhdnNsaHRraW9pdmVtd2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzIyMTYsImV4cCI6MjA4NjEwODIxNn0.LaNyj8T6VYGMMbuyX-Fg_6Fm6yIhPLTW0enYd6sNdGE"
};

// EmailJS Configuration (Optional - add your keys when ready)
const EMAILJS_CONFIG = {
    publicKey: "ArYIykvZ1hGuIpzXW",
    serviceId: "service_zvb7rx6",
    templateId: "template_vsbijr8"
};

// Initialize Supabase
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Initialize EmailJS if keys are provided
if (EMAILJS_CONFIG.publicKey !== "ArYIykvZ1hGuIpzXW") {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}