'use client';

import { useState } from 'react';

type HeaderLink = {
  href: string;
  label: string;
  button?: boolean;
};

type SiteHeaderProps = {
  initials: string;
  name: string;
  links: HeaderLink[];
};

export default function SiteHeader({
  initials,
  name,
  links,
}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="nav">
      <a href="#home" className="logo" aria-label="Home" onClick={() => setIsOpen(false)}>
        <span className="logo-mark">{initials}</span>
        <span>{name}</span>
      </a>
      <button
        className="burger"
        type="button"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav id="menu" className={`menu${isOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={link.button ? 'btn btn-small' : undefined}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
