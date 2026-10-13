import Image from 'next/image';
import SiteHeader from '@/app/ui/site-header';
import { fetchPortfolioData } from '@/app/lib/firebase-portfolio';

export default async function Page() {
  const { about, contacts, cta, profile, projects, services, skills } =
    await fetchPortfolioData();
  const year = new Date().getFullYear();

  return (
    <>
      <SiteHeader
        initials={profile.initials}
        name={profile.name}
        links={[
          { href: '#home', label: 'Home' },
          { href: '#about', label: 'About' },
          { href: '#services', label: 'What I Do' },
          { href: '#projects', label: 'Projects' },
          { href: '#skills', label: 'Skills' },
          { href: '#contact', label: 'Contact', button: true },
        ]}
      />
      <main>
        <section className="hero" id="home">
          <div className="hero-text">
            <p className="hello">
              {profile.badge} <span>{profile.name}</span>
            </p>
            <h1>{profile.headline}</h1>
            <p className="lead">
              I&apos;m a <span>{profile.role}</span> focused on {profile.stack.toLowerCase()}.
              {` ${profile.intro}`}
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn">
                See my work
              </a>
              <a href="#contact" className="btn btn-ghost">
                Hire me
              </a>
            </div>
          </div>
          <div className="hero-photo">
            <div className="blob" />
            <Image
              src={profile.photo}
              alt={`Photo of ${profile.name}`}
              fill
              priority
              sizes="(max-width: 820px) 300px, 460px"
            />
          </div>
        </section>

        <section className="section" id="about">
          <div className="about">
            <div>
              <h2>About me</h2>
              <p>{about.text}</p>
              {about.points.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
            <ul className="stats">
              {about.stats.map((stat) => (
                <li key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="services">
          <h2>What I do</h2>
          <div className="cards">
            {services.map((service) => (
              <article key={service.title} className="card">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="projects">
          <h2>Featured projects</h2>
          <div className="projects">
            {projects.map((project) => (
              <article key={project.id} className="project">
                <div className="shot">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={800}
                    height={500}
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="project-body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul className="tags">
                    {project.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  {project.link ? (
                    <a
                      href={project.link}
                      className="btn btn-small"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View project
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="skills">
          <h2>Skills</h2>
          <ul className="skills">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="banner">
            <h2>{cta.title}</h2>
            <p>{cta.text}</p>
            <a href="#contact" className="btn btn-light">
              Let&apos;s talk
            </a>
          </div>
        </section>

        <section className="section" id="contact">
          <h2>Contact</h2>
          <div className="contact">
            {contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                className="contact-card"
                target={contact.external ? '_blank' : undefined}
                rel={contact.external ? 'noreferrer' : undefined}
              >
                <span>{contact.label}</span>
                <strong>{contact.value}</strong>
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer" id="top">
        <p>
          &copy; {year} {profile.name}. All rights reserved.
        </p>
        <a href="#home">Back to top</a>
      </footer>
    </>
  );
}
