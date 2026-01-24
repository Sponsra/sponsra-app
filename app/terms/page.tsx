import Link from "next/link";
import { Button } from "primereact/button";
import styles from "./terms.module.css";

export default function TermsPage() {
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
                <h1 className={styles.title}>Terms of Service</h1>
                <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>

                <div className={styles.content}>
                    <p>
                        Welcome to Sponsra. By accessing or using our website and services (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
                    </p>

                    <h3>1. The Service</h3>
                    <p>
                        Sponsra is a software platform that provides infrastructure for newsletter creators (&quot;Creators&quot;) to manage ad inventory and accept bookings from advertisers (&quot;Sponsors&quot;).
                    </p>
                    <p className={styles.importantBox}>
                        Important: Sponsra is not a publisher, ad network, or media agency. We act solely as a technical facilitator. We are not a party to any agreement between Creators and Sponsors. The contract for the sale of advertising space is strictly between the Creator and the Sponsor.
                    </p>

                    <h3>2. Accounts and Registration</h3>
                    <p>
                        To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
                    </p>
                    <ul>
                        <li><strong>Identity Verification:</strong> You may be required to verify your identity through our payment processor (Stripe) to receive payouts. Failure to provide accurate identity information is a violation of these Terms.</li>
                        <li><strong>Security:</strong> You are responsible for safeguarding your password. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.</li>
                    </ul>

                    <h3>3. Payments and Fees</h3>

                    <h4>3.1. Stripe Connect</h4>
                    <p>
                        Sponsra processes payments through Stripe Connect. By using Sponsra, you agree to the Stripe Connected Account Agreement.
                    </p>
                    <p>
                        <strong>Merchant of Record:</strong> The Creator is the &quot;Merchant of Record&quot; for all transactions. Sponsra is not the seller of the advertising space. The Creator is solely responsible for determining the price, tax obligations, and fulfillment of the service.
                    </p>

                    <h4>3.2. Fees</h4>
                    <ul>
                        <li><strong>Platform Fee:</strong> Sponsra charges a transaction fee (currently 5%) on the total booking value. This fee is deducted automatically at the time of payment.</li>
                        <li><strong>Processing Fees:</strong> Stripe charges a separate processing fee (typically 2.9% + 30¢). This fee is paid directly to Stripe and is not controlled by Sponsra.</li>
                    </ul>

                    <h4>3.3. Refunds and Disputes</h4>
                    <ul>
                        <li><strong>Refund Policy:</strong> Because the Creator is the Merchant of Record, all refund requests must be directed to the Creator. Sponsra does not control the Creator’s funds and cannot force a refund unless strictly required by law or in cases of proven fraud.</li>
                        <li><strong>Non-Refundable Fees:</strong> If a transaction is refunded, Stripe processing fees are not returned by Stripe. Additionally, Sponsra&#39;s Platform Fee is non-refundable unless the refund is due to a technical error on our part.</li>
                        <li><strong>Liability:</strong> Sponsra is not liable for any chargebacks, refund shortfalls, or financial losses associated with disputes between Creators and Sponsors.</li>
                    </ul>

                    <h3>4. User Conduct & Acceptable Use</h3>

                    <h4>4.1. For Creators</h4>
                    <p>You agree that you will not:</p>
                    <ul>
                        <li>List fake or non-existent inventory.</li>
                        <li>Misrepresent your newsletter statistics (subscriber count, open rates) in your Media Kit.</li>
                        <li>Accept payment for an ad and fail to publish it (&quot;Ghosting&quot;).</li>
                        <li>Use the Service to process payments for prohibited goods or services (e.g., drugs, weapons, gambling).</li>
                    </ul>

                    <h4>4.2. For Sponsors</h4>
                    <p>You agree that your Ad Assets (images, copy, links) will not:</p>
                    <ul>
                        <li>Contain illegal, hateful, or obscene material.</li>
                        <li>Violate the intellectual property rights of others.</li>
                        <li>Contain malware, phishing links, or deceptive practices.</li>
                    </ul>

                    <h4>4.3. Violation</h4>
                    <p>
                        Sponsra reserves the right to suspend or terminate your account immediately if you violate these rules. In cases of suspected fraud, we cooperate fully with law enforcement and payment processors.
                    </p>

                    <h3>5. Content and Intellectual Property</h3>

                    <h4>5.1. Your Content</h4>
                    <p>
                        You retain ownership of the content (images, text, logos) you upload to Sponsra. However, you grant Sponsra a worldwide, royalty-free license to host, display, and reproduce your content solely for the purpose of providing the Service (e.g., displaying your booking page to potential Sponsors).
                    </p>

                    <h4>5.2. No Liability for Content</h4>
                    <p>
                        Sponsra does not pre-screen or approve ad content or newsletter content. We explicitly disclaim any liability for:
                    </p>
                    <ul>
                        <li>The quality, accuracy, or legality of the newsletter content.</li>
                        <li>The performance or results of any sponsorship booked through the Service.</li>
                        <li>Copyright infringement or offensive material uploaded by users.</li>
                    </ul>

                    <h3>6. Disclaimers</h3>
                    <p>
                        The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without any warranties. Sponsra does not guarantee that:
                    </p>
                    <ul>
                        <li>The Service will be uninterrupted or error-free.</li>
                        <li>A Creator will fulfill a booked ad slot.</li>
                        <li>A Sponsor&#39;s ad will generate clicks or sales.</li>
                        <li>Self-reported statistics (subscriber counts) are accurate.</li>
                    </ul>

                    <h3>7. Limitation of Liability</h3>
                    <p>
                        To the maximum extent permitted by law, Sponsra shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. In no event shall Sponsra&#39;s aggregate liability exceed the greater of: (a) the total Platform Fees paid by you to Sponsra in the past six (6) months, or (b) one hundred U.S. dollars ($100).
                    </p>

                    <h3>8. Governing Law</h3>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions.
                    </p>

                    <h3>9. Changes to Terms</h3>
                    <p>
                        We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                    </p>
                </div>
            </main>

            <footer className={styles.footer}>
                &copy; {new Date().getFullYear()} Sponsra Inc.
            </footer>
        </div>
    );
}
