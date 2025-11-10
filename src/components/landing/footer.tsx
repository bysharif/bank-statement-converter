import React from "react";
import Image from "next/image";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const sections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/#features" },
      { name: "How it Works", href: "/#how-it-works" },
      { name: "Supported Banks", href: "/#banks" },
      { name: "Formats", href: "/#formats" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/#blog" },
      { name: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "GDPR Compliance", href: "/gdpr" },
      { name: "Security", href: "/security" },
    ],
  },
];

const socialLinks = [
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
  { icon: <FaGithub className="size-5" />, href: "#", label: "GitHub" },
];

const legalLinks = [
  { name: "Terms and Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <section className="pt-40 pb-16 bg-[#1E40AF]">
      <div className="container">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex flex-col gap-2 lg:justify-start">
              <div className="relative w-[60px] h-[60px]">
                <Image
                  src="/logo-white.svg"
                  alt="ConvertBank-Statement Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold text-white">convertbank-statement.com</h2>
            </div>
            <p className="text-blue-100 max-w-[70%] text-sm">
              Convert PDF bank statements to CSV, QIF & Excel with 99.6% accuracy. Secure, private, and GDPR-compliant processing for all major UK banks.
            </p>
            <ul className="text-blue-100 flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-primary font-medium">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-white">{section.title}</h3>
                <ul className="text-blue-100 space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-white font-medium"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="text-blue-100 mt-8 flex flex-col justify-between gap-4 border-t border-blue-400 py-8 text-xs font-medium md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">© 2024 UK Bank Statement Converter. All rights reserved.</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-white">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}