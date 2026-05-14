'use client'

import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
}

const sections = [
  {
    number: '01',
    title: 'Introduction',
    content: [
      'Welcome to Social Void ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website, mobile applications, and related services (collectively, the "Service").',
      'By accessing or using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.',
    ],
  },
  {
    number: '02',
    title: 'Information We Collect',
    subsections: [
      {
        subtitle: 'Personal Information',
        items: [
          'Account credentials: email address, username, and encrypted password.',
          'Profile data: display name, bio, avatar, and other information you choose to provide.',
          'Contact information: email address for account verification and communications.',
        ],
      },
      {
        subtitle: 'Usage Data',
        items: [
          'Interaction data: posts, comments, likes, shares, and other engagement metrics.',
          'Communication data: messages sent through Void Messenger, including metadata such as timestamps and participants.',
          'Search queries and content preferences.',
          'Feature usage patterns and interaction frequencies.',
        ],
      },
      {
        subtitle: 'Device Information',
        items: [
          'Device type, operating system, and browser version.',
          'IP address and approximate geographic location.',
          'Unique device identifiers and session tokens.',
          'Screen resolution, timezone, and language preferences.',
        ],
      },
    ],
  },
  {
    number: '03',
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect for the following purposes:',
    ],
    list: [
      'To create, maintain, and secure your account and authenticate your identity.',
      'To provide, operate, and improve the Service, including personalizing your experience and delivering relevant content.',
      'To facilitate real-time messaging and communication features through Void Messenger.',
      'To send you important updates, security alerts, and administrative messages.',
      'To monitor and analyze usage patterns to improve platform performance and user experience.',
      'To detect, prevent, and address technical issues, security threats, and fraudulent activity.',
      'To comply with applicable legal obligations and enforce our Terms of Service.',
    ],
  },
  {
    number: '04',
    title: 'Data Encryption & Security',
    content: [
      'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:',
    ],
    list: [
      'Transport Layer Security (TLS) encryption for all data in transit between your device and our servers.',
      'End-to-end encryption for Void Mode messages — messages sent in Void Mode are encrypted on your device before transmission and can only be decrypted by the intended recipient. We do not have access to the plaintext content of Void Mode messages.',
      'AES-256 encryption for data at rest, including stored personal information and account data.',
      'Regular security audits, vulnerability assessments, and penetration testing.',
      'Access controls and authentication mechanisms limiting data access to authorized personnel only.',
    ],
    note: 'While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.',
  },
  {
    number: '05',
    title: 'Data Sharing',
    content: [
      'Social Void does not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:',
    ],
    list: [
      'With your explicit consent: We will share your information with third parties only when you have provided clear, informed consent.',
      'Service providers: We may share information with trusted third-party service providers who assist us in operating the platform (e.g., cloud hosting, analytics), subject to strict confidentiality obligations.',
      'Legal requirements: We may disclose information if required by law, regulation, or legal process, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.',
      'Business transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to continued protection under this policy.',
    ],
  },
  {
    number: '06',
    title: 'Cookies & Tracking',
    content: [
      'We use cookies and similar tracking technologies to enhance your experience on Social Void:',
    ],
    list: [
      'Essential cookies: Required for the Service to function properly, including session authentication and security features.',
      'Functional cookies: Remember your preferences and settings to provide a personalized experience.',
      'Analytics cookies: Help us understand how users interact with the Service so we can improve it.',
    ],
    note: 'We do not use cookies for advertising or cross-site tracking purposes. You can manage your cookie preferences through your browser settings at any time.',
  },
  {
    number: '07',
    title: 'Your Rights',
    content: [
      'You have the following rights regarding your personal information:',
    ],
    list: [
      'Access: You can request a copy of the personal information we hold about you at any time.',
      'Modification: You can update or correct your profile information directly through your account settings.',
      'Deletion: You can request the deletion of your account and associated personal data. Upon confirmation, your data will be permanently removed within 30 days, subject to legal retention requirements.',
      'Data portability: You can request an export of your data in a machine-readable format.',
      'Objection: You can object to certain processing activities, including direct marketing communications.',
      'Restriction: You can request that we restrict the processing of your personal information in certain circumstances.',
    ],
    note: 'To exercise any of these rights, please contact us at privacy@socialvoid.app. We will respond to your request within 30 days.',
  },
  {
    number: '08',
    title: 'Data Retention',
    content: [
      'We retain your personal information for as long as your account is active or as needed to provide you with the Service. We may retain certain information for legitimate business purposes or as required by law, such as to resolve disputes, enforce our agreements, and comply with legal obligations.',
      'Void Mode messages are subject to automatic deletion based on their configured time-to-live (TTL) and are permanently removed from our servers upon expiration. Standard messages are retained for the duration of your account unless you choose to delete them.',
      'When you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or regulatory reasons.',
    ],
  },
  {
    number: '09',
    title: "Children's Privacy",
    content: [
      'Social Void is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13 years of age. If we become aware that we have inadvertently collected personal information from a child under 13, we will take steps to delete such information as promptly as possible.',
      'If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@socialvoid.app.',
    ],
  },
  {
    number: '10',
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.',
      'Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Privacy Policy. We encourage you to review this page periodically to stay informed about how we protect your information.',
    ],
  },
  {
    number: '11',
    title: 'Contact Us',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
    ],
    list: [
      'Email: privacy@socialvoid.app',
      'Through the Settings page within the Social Void application.',
      'By writing to: Social Void, Attn: Privacy Team.',
    ],
    note: 'We are committed to working with you to resolve any complaints or concerns about your privacy and our handling of your information.',
  },
]

export function PrivacyPolicy() {
  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center pb-6 border-b border-border">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: March 4, 2026
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <motion.section
            key={section.number}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-3"
          >
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="text-primary font-mono text-sm">{section.number}</span>
              <span>{section.title}</span>
            </h2>

            {section.content?.map((paragraph, j) => (
              <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}

            {section.list && (
              <ul className="space-y-2 pl-1">
                {section.list.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.subsections?.map((sub, j) => (
              <div key={j} className="space-y-2 ml-2">
                <h3 className="text-sm font-semibold text-foreground">{sub.subtitle}</h3>
                <ul className="space-y-2 pl-1">
                  {sub.items.map((item, k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {section.note && (
              <p className="text-sm italic text-muted-foreground/80 pl-3 border-l-2 border-primary/30">
                {section.note}
              </p>
            )}
          </motion.section>
        ))}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Social Void. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
