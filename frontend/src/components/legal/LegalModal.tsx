import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

const TERMS_CONTENT = `
## Terms of Service

**Last updated:** July 24, 2026

Welcome to Business Nexus. By accessing or using our platform, you agree to be bound by these Terms of Service.

### 1. Acceptance of Terms
By creating an account or using Business Nexus, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, do not use the platform.

### 2. Eligibility
You must be at least 18 years old to use Business Nexus. By using the platform, you represent that you meet this age requirement and have the legal capacity to enter into a binding agreement.

### 3. Account Registration
- You must provide accurate, complete, and current information during registration.
- You are responsible for maintaining the confidentiality of your account credentials.
- You must notify us immediately of any unauthorized use of your account.
- One person or entity may not maintain more than one account.

### 4. User Roles
Business Nexus supports two user roles:
- **Entrepreneurs** may create profiles, upload pitch documents, schedule meetings, and receive investment inquiries.
- **Investors** may browse entrepreneur profiles, schedule meetings, create deals, and initiate payments.

### 5. User Conduct
You agree NOT to:
- Use the platform for any unlawful purpose
- Impersonate another person or entity
- Upload malicious software or harmful content
- Attempt to gain unauthorized access to other accounts or systems
- Harass, abuse, or harm other users
- Scrape, mine, or harvest data from the platform
- Interfere with or disrupt the platform's infrastructure

### 6. Content and Intellectual Property
- You retain ownership of content you upload to Business Nexus.
- By uploading content, you grant us a non-exclusive license to store, display, and process that content solely for platform functionality.
- You represent that you have the right to upload any content you submit.
- Our platform, logos, and design are protected by intellectual property laws.

### 7. Meetings and Communications
- Meeting scheduling is subject to availability and conflict detection.
- Video calls are facilitated through our platform but we do not record or store call content.
- You are responsible for the conduct of your meetings and communications.

### 8. Payments and Transactions
- All payments are processed through Stripe (sandbox environment for testing).
- Business Nexus does not store your credit card or banking information.
- Transaction fees may apply and will be disclosed before confirmation.
- Refund policies are governed by the agreement between transacting parties.

### 9. Documents and E-Signatures
- Documents uploaded to the platform are stored securely.
- E-signatures applied through our platform are simulated for demonstration purposes.
- You are responsible for the legal validity of documents and signatures in your jurisdiction.

### 10. Termination
We reserve the right to suspend or terminate your account at our discretion, with or without notice, for conduct that violates these Terms or is harmful to other users or the platform.

### 11. Disclaimer of Warranties
Business Nexus is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the platform will be uninterrupted, error-free, or secure.

### 12. Limitation of Liability
To the maximum extent permitted by law, Business Nexus shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.

### 13. Modifications
We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms. We will notify users of material changes.

### 14. Governing Law
These Terms are governed by the laws of the jurisdiction in which Business Nexus operates, without regard to conflict of law principles.

### 15. Contact
For questions about these Terms, please contact us through the platform or at the email associated with your account.
`;

const PRIVACY_CONTENT = `
## Privacy Policy

**Last updated:** July 24, 2026

Your privacy is important to us. This Privacy Policy explains how Business Nexus collects, uses, and protects your personal information.

### 1. Information We Collect

**Account Information:**
- Name, email address, and role (Investor or Entrepreneur)
- Password (stored in encrypted form)
- Profile details: bio, location, website, startup/investment information

**Usage Data:**
- Pages visited and features used within the platform
- Timestamps of login sessions and activity
- Device type, browser, and operating system information

**Uploaded Content:**
- Profile avatars and images
- Documents (pitch decks, contracts, etc.)
- E-signatures drawn on the platform

**Communication Data:**
- Messages sent through the chat system
- Meeting details (title, description, time, participants)
- Deal information and status updates

**Payment Data:**
- Transaction history (amounts, types, status, timestamps)
- Payment processing is handled by Stripe — we do not store card numbers or banking details

### 2. How We Use Your Information

We use your information to:
- Provide and maintain the Business Nexus platform
- Authenticate your identity and secure your account
- Process meetings, messages, deals, and payments between users
- Display profiles and facilitate connections between investors and entrepreneurs
- Send important notifications about account activity
- Improve platform functionality and user experience
- Comply with legal obligations

### 3. Information Sharing

We do NOT sell your personal information. We may share your information only:
- **With other users** — Your profile information (name, bio, role) is visible to other registered users for platform functionality.
- **With service providers** — We use MongoDB (database hosting), Railway (backend hosting), Vercel (frontend hosting), and Stripe (payment processing). These providers have access only as needed to perform their services.
- **For legal compliance** — If required by law, regulation, or legal process.

### 4. Data Storage and Security

- All data is stored in MongoDB Atlas with encrypted connections.
- Communications between frontend and backend use HTTPS.
- Passwords are hashed using bcrypt with salt rounds.
- JWT tokens are used for session authentication with expiration.
- We implement Helmet security headers on all API responses.
- Uploaded files are stored in a secure directory on our backend server.

### 5. Data Retention

- Account data is retained as long as your account is active.
- Messages and chat history are retained to maintain conversation context.
- Documents are retained until you choose to delete them.
- Transaction records are retained for audit and compliance purposes.
- If you delete your account, your personal data will be removed within 30 days, except where retention is required by law.

### 6. Your Rights

You have the right to:
- **Access** your personal data
- **Update** your profile and account information at any time
- **Delete** your uploaded documents
- **Request** a copy of your data
- **Close** your account through the settings page

### 7. Cookies and Local Storage

Business Nexus uses:
- **Local Storage** to persist your authentication token and theme preferences
- **Session Storage** for temporary application state
- We do NOT use third-party tracking cookies or analytics cookies

### 8. Children's Privacy

Business Nexus is not intended for users under 18 years of age. We do not knowingly collect information from children. If we become aware that a child has provided us with personal data, we will take steps to delete it.

### 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of material changes through the platform or via email. Continued use of the platform after changes constitutes acceptance of the updated policy.

### 10. Contact

If you have questions about this Privacy Policy or how your data is handled, please contact us through the platform or at the email associated with your account.
`;

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const content = isTerms ? TERMS_CONTENT : PRIVACY_CONTENT;

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('- **')) {
          const match = line.match(/^- \*\*(.+?)\*\*(.*)/);
          if (match) {
            return (
              <li key={i} className="ml-4 mb-1 text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">{match[1]}</strong>{match[2]}
              </li>
            );
          }
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 mb-1 text-sm text-gray-700 dark:text-gray-300 list-disc">
              {line.replace('- ', '')}
            </li>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 mb-1 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
          {renderMarkdown(content)}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            I have read and understand
          </button>
        </div>
      </div>
    </div>
  );
};
