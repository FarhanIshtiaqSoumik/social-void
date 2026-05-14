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
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using Social Void ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you may not access or use the Service.',
      'These Terms constitute a legally binding agreement between you and Social Void. They govern your use of the website, mobile applications, and all related services provided by Social Void. We reserve the right to modify these Terms at any time, and your continued use of the Service following any changes constitutes acceptance of the revised Terms.',
    ],
  },
  {
    number: '02',
    title: 'Account Registration & Security',
    content: [
      'To use certain features of the Service, you must create an account. When registering, you agree to:',
    ],
    list: [
      'Provide accurate, current, and complete information during the registration process.',
      'Maintain and promptly update your account information to keep it accurate and complete.',
      'Maintain the security and confidentiality of your account credentials, including your password.',
      'Accept responsibility for all activities that occur under your account.',
      'Notify Social Void immediately of any unauthorized use of your account or any other breach of security.',
    ],
    note: 'You must be at least 13 years of age to create an account and use the Service. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms.',
  },
  {
    number: '03',
    title: 'Content Ownership & License',
    content: [
      'You retain ownership of all content you create and submit to the Service ("Your Content"). By posting, uploading, or submitting Your Content to Social Void, you grant us a limited, non-exclusive, royalty-free, worldwide license to use, reproduce, modify, adapt, publish, translate, distribute, and display Your Content solely for the purpose of operating and providing the Service.',
      'This license persists only for as long as Your Content remains on the Service and will terminate upon deletion, subject to the following: content shared publicly may be cached or retained for a reasonable period to maintain platform integrity and user experience.',
      'You represent and warrant that you own or control all rights in and to Your Content, and that Your Content does not violate the rights of any third party.',
    ],
  },
  {
    number: '04',
    title: 'Community Guidelines',
    content: [
      'Social Void is built on respect, creativity, and open expression. To maintain a safe and inclusive environment, the following behaviors are strictly prohibited:',
    ],
    subsections: [
      {
        subtitle: 'Hate Speech',
        items: [
          'Content that promotes violence, incites hatred, or discriminates against individuals or groups based on race, ethnicity, national origin, religion, sexual orientation, gender identity, disability, or other protected characteristics.',
        ],
      },
      {
        subtitle: 'Harassment',
        items: [
          'Targeted harassment, bullying, intimidation, or threats directed at any individual or group. This includes sustained negative interactions, doxxing, and non-consensual sharing of private information.',
        ],
      },
      {
        subtitle: 'Illegal Content',
        items: [
          'Content that violates applicable local, state, national, or international law, including but not limited to content promoting illegal activities, drug trafficking, terrorism, or the exploitation of minors.',
        ],
      },
      {
        subtitle: 'Spam & Manipulation',
        items: [
          'Unsolicited commercial content, deceptive links, artificially inflating engagement metrics, or any coordinated inauthentic behavior designed to manipulate the platform.',
        ],
      },
    ],
  },
  {
    number: '05',
    title: 'Prohibited Activities',
    content: [
      'In addition to the Community Guidelines above, you agree not to:',
    ],
    list: [
      'Attempt to gain unauthorized access to any portion of the Service, other accounts, or any systems or networks connected to the Service.',
      'Use the Service for any purpose that is unlawful or prohibited by these Terms.',
      'Interfere with or disrupt the Service, servers, or networks connected to the Service.',
      'Impersonate any person or entity, or falsely represent your affiliation with any person or entity.',
      'Collect or harvest personal information of other users without their consent.',
      'Use automated systems, bots, or scrapers to access the Service for any purpose without our express written permission.',
      'Reverse engineer, decompile, or disassemble any part of the Service.',
      'Upload or transmit viruses, malware, or any other malicious code.',
    ],
  },
  {
    number: '06',
    title: 'Void Mode & Disappearing Messages Disclaimer',
    content: [
      'Social Void offers a feature called "Void Mode" that allows users to send messages with an automatic deletion timer (time-to-live or TTL). While Void Mode messages are designed to disappear after the specified TTL expires, you should be aware of the following:',
    ],
    list: [
      'Void Mode messages are end-to-end encrypted during transmission. Social Void cannot read the content of your Void Mode messages.',
      'Upon expiration of the TTL, messages are permanently deleted from our servers and cannot be recovered by Social Void.',
      'Recipients may still capture, screenshot, or copy message content before it is deleted. Social Void does not guarantee that recipients will not preserve message content through external means.',
      'We employ reasonable measures to delete expired messages, but may retain residual data in backup systems for a limited period in accordance with our data retention practices.',
      'Void Mode is intended for enhanced privacy, not for guaranteeing complete destruction of message content. You should exercise caution when sharing sensitive information.',
    ],
    note: 'SOCIAL VOID MAKES NO WARRANTY OR GUARANTEE THAT VOID MODE MESSAGES WILL BE COMPLETELY OR PERMANENTLY DELETED IN ALL CIRCUMSTANCES.',
  },
  {
    number: '07',
    title: 'Intellectual Property',
    content: [
      'The Service and its original content (excluding Your Content), features, and functionality are and shall remain the exclusive property of Social Void and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.',
      'Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Social Void. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use only.',
    ],
  },
  {
    number: '08',
    title: 'Termination',
    content: [
      'We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.',
      'Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.',
      'You may delete your account at any time through your account settings. Upon account deletion, your profile, posts, and associated data will be removed in accordance with our Privacy Policy.',
    ],
  },
  {
    number: '09',
    title: 'Limitation of Liability',
    content: [
      'In no event shall Social Void, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from:',
    ],
    list: [
      'Your access to or use of (or inability to access or use) the Service.',
      'Any conduct or content of any third party on the Service.',
      'Any content obtained from the Service.',
      'Unauthorized access, use, or alteration of your transmissions or content.',
    ],
    note: 'IN NO EVENT SHALL THE TOTAL LIABILITY OF SOCIAL VOID TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE EXCEED THE AMOUNT YOU HAVE PAID TO SOCIAL VOID IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.',
  },
  {
    number: '10',
    title: 'Governing Law',
    content: [
      'These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Social Void operates, without regard to its conflict of law provisions.',
      'Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with applicable arbitration rules, or in the courts of the applicable jurisdiction, at Social Void\'s sole discretion.',
      'Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in effect.',
    ],
  },
  {
    number: '11',
    title: 'Contact',
    content: [
      'If you have any questions about these Terms of Service, please contact us:',
    ],
    list: [
      'Email: legal@socialvoid.app',
      'Through the Settings page within the Social Void application.',
      'By writing to: Social Void, Attn: Legal Department.',
    ],
    note: 'We recommend reviewing these Terms periodically to stay informed of any updates or changes.',
  },
]

export function TermsOfService() {
  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center pb-6 border-b border-border">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: March 4, 2026
          </p>
        </div>

        {/* Preamble */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/10"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Important:</strong> By using Social Void, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must discontinue use of the Service immediately.
          </p>
        </motion.div>

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
