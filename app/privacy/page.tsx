import Link from "next/link";
import { Button } from "primereact/button";
import styles from "./privacy.module.css";

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            {/* Simple Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.logoLink}>
                    <img src="/logo.svg" alt="Sponsra" className={styles.logo} />
                    Sponsra
                </Link>
                <div className={styles.headerActions}>
                    <Link href="/login">
                        <Button label="Log In" text className="p-button-text" />
                    </Link>
                    <Link href="/signup">
                        <Button label="Sign Up" className="p-button-primary" />
                    </Link>
                </div>
            </header>

            <main className={styles.main}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>

                <div className={styles.content}>
                    <p>
                        At Sponsra (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and disclose information when you use our website and software services (the &quot;Service&quot;).
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect only the information necessary to provide our infrastructure services to Creators and Sponsors.
                    </p>

                    <h4>1.1. Information You Provide to Us</h4>
                    <ul>
                        <li><strong>Account Information:</strong> When you register as a Creator, we collect your name, email address, and newsletter details (name, URL).</li>
                        <li><strong>Booking Information:</strong> When a Sponsor books an ad slot, we collect your name, email address, and the ad content (text, images, links) you upload.</li>
                        <li><strong>Payment Information:</strong> We do not store your credit card numbers or bank account details on our servers. All payment data is collected and processed directly by our payment processor, Stripe.</li>
                    </ul>

                    <h4>1.2. Automatically Collected Information</h4>
                    <ul>
                        <li><strong>Log Data:</strong> Like most websites, our servers (hosted by Vercel) automatically record information when you access the Service. This may include your IP address, browser type, and the pages you visit.</li>
                        <li><strong>Cookies:</strong> We use essential cookies to keep you logged in and to remember your preferences. We do not use third-party advertising cookies.</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        We use your information strictly to operate the Sponsra platform. Specifically, we use it to:
                    </p>
                    <ul>
                        <li>Facilitate the booking and scheduling of sponsorships.</li>
                        <li>Process payments and payouts via Stripe.</li>
                        <li>Send transactional emails (e.g., booking confirmations, &quot;Action Required&quot; notifications).</li>
                        <li>Detect and prevent fraud or abuse of the Service.</li>
                    </ul>

                    <h3>3. How We Share Your Information</h3>
                    <p>
                        We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                    </p>
                    <p>
                        We only share information with the following third-party service providers (&quot;Sub-processors&quot;) who enable us to run the Service. These providers are authorized to use your personal information only as necessary to provide these services to us.
                    </p>

                    <h4>3.1. Our Service Providers</h4>
                    <ul>
                        <li><strong>Stripe (Payment Processing):</strong> We share transaction data and identity verification data (for Creators) with Stripe to facilitate payments and payouts. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
                        <li><strong>Supabase (Database & Storage):</strong> Your user data and uploaded ad assets are securely stored in our database hosted by Supabase. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
                        <li><strong>Vercel (Hosting):</strong> Our website infrastructure is hosted on Vercel. They process web requests and server logs. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
                    </ul>

                    <h4>3.2. Legal Requirements</h4>
                    <p>
                        We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to (i) comply with a legal obligation (e.g., a subpoena), (ii) protect and defend the rights or property of Sponsra, or (iii) prevent fraud or illegal activity.
                    </p>

                    <h3>4. Data Retention</h3>
                    <p>
                        We retain your personal information only for as long as is necessary to provide the Service and to comply with our legal obligations (such as tax and accounting laws).
                    </p>

                    <h3>5. Security</h3>
                    <p>
                        We take reasonable measures to protect your information from unauthorized access or disclosure.
                    </p>
                    <ul>
                        <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS (HTTPS).</li>
                        <li><strong>Payment Security:</strong> Sponsra never touches your raw credit card data; it is handled entirely by Stripe’s PCI-DSS compliant infrastructure.</li>
                    </ul>

                    <h3>6. Your Data Rights</h3>
                    <p>
                        Depending on your location (e.g., California or the European Union), you may have the right to:
                    </p>
                    <ul>
                        <li>Access the personal information we hold about you.</li>
                        <li>Request that we correct or delete your personal information.</li>
                        <li>Export your data.</li>
                    </ul>
                    <p>To exercise these rights, please contact us at [Your Support Email].</p>

                    <h3>7. Children&#39;s Privacy</h3>
                    <p>
                        Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
                    </p>

                    <h3>8. Changes to This Policy</h3>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
                    </p>

                    <h3>9. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@sponsra.app" className="font-medium text-blue-600 hover:text-blue-800">support@sponsra.app</a>
                    </p>
                </div>
            </main>

            <footer className={styles.footer}>
                &copy; {new Date().getFullYear()} Sponsra Inc.
            </footer>
        </div>
    );
}
