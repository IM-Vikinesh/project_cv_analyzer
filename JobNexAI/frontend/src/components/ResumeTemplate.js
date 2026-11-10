import React from "react";
import "./ResumeTemplate.css";

const defaultResume = {
  personalInfo: {
    fullName: "YOUR FULL NAME",
    jobTitle: "Professional Job Title",
    phone: "+94 77 123 4567",
    email: "your.email@example.com",
    address: "Batticaloa, Sri Lanka",
  },

  aboutMe:
    "A motivated and dedicated professional with strong technical knowledge, problem-solving abilities, and excellent communication skills. Passionate about learning new technologies, developing innovative solutions, and contributing to organizational success.",

  education: [
    {
      institution: "Your University / Institution",
      duration: "2022 - 2026",
      qualification: "Higher National Diploma in Information Technology",
      description:
        "Studied software development, programming, database management, web technologies, and software engineering.",
    },
    {
      institution: "Your School",
      duration: "2018 - 2021",
      qualification: "General Certificate of Education",
      description:
        "Completed secondary education with a strong foundation in academic and professional development.",
    },
  ],

  experience: [
    {
      company: "Company Name",
      duration: "2025 - Present",
      position: "Software Developer",
      description:
        "Developed responsive web applications, implemented frontend components, integrated APIs, and collaborated with development teams.",
    },
    {
      company: "Previous Company",
      duration: "2024 - 2025",
      position: "Trainee Developer",
      description:
        "Assisted in software development, debugging, testing, and maintaining web-based applications.",
    },
  ],

  skills: [
    "Java",
    "JavaScript",
    "Python",
    "React",
    "HTML5",
    "CSS3",
    "Bootstrap",
    "Flask",
    "Node.js",
    "MySQL",
    "Firebase",
    "Git & GitHub",
    "REST APIs",
    "Software Testing",
    "Problem Solving",
  ],

  languages: ["English", "Tamil", "Sinhala"],
  certifications: [],
};

function ContactIcon({ type }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  };

  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.56 3.57.56a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.19 2.45.56 3.57a1 1 0 01-.25 1.02l-2.19 2.2z" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg {...common}>
        <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
    </svg>
  );
}

function Section({ title, children }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="resume-skills">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function ResumeTemplate({ data = defaultResume }) {
  const personalInfo = data?.personalInfo || {};
  const aboutMe = data?.aboutMe || "";
  const education = (data?.education || []).filter(
    (item) => item.institution || item.qualification || item.duration || item.description
  );
  const experience = (data?.experience || []).filter(
    (item) => item.company || item.position || item.duration || item.description
  );
  const skills = (data?.skills || []).filter(Boolean);
  const languages = (data?.languages || []).filter(Boolean);
  const certifications = (data?.certifications || []).filter(Boolean);

  const hasContact =
    personalInfo.phone || personalInfo.email || personalInfo.address;

  return (
    <div className="resume-page">
      <header className="resume-header">
        {personalInfo.fullName && (
          <h1 className="resume-name">{personalInfo.fullName}</h1>
        )}

        {personalInfo.jobTitle && (
          <p className="resume-job-title">{personalInfo.jobTitle}</p>
        )}

        {hasContact && (
          <div className="resume-contact">
            {personalInfo.phone && (
              <div className="resume-contact-item">
                <ContactIcon type="phone" />
                <span>{personalInfo.phone}</span>
              </div>
            )}

            {personalInfo.email && (
              <div className="resume-contact-item">
                <ContactIcon type="email" />
                <span>{personalInfo.email}</span>
              </div>
            )}

            {personalInfo.address && (
              <div className="resume-contact-item">
                <ContactIcon type="location" />
                <span>{personalInfo.address}</span>
              </div>
            )}
          </div>
        )}
      </header>

      {aboutMe && (
        <Section title="ABOUT ME">
          <p className="resume-description">{aboutMe}</p>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="EDUCATION">
          <div className="resume-entries">
            {education.map((item, index) => (
              <article className="resume-entry" key={index}>
                {(item.institution || item.duration) && (
                  <p className="resume-meta">
                    {[item.institution, item.duration].filter(Boolean).join(" | ")}
                  </p>
                )}

                {item.qualification && (
                  <h3 className="resume-position">{item.qualification}</h3>
                )}

                {item.description && (
                  <p className="resume-description">{item.description}</p>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="WORK EXPERIENCE">
          <div className="resume-entries">
            {experience.map((item, index) => (
              <article className="resume-entry" key={index}>
                {(item.company || item.duration) && (
                  <p className="resume-meta">
                    {[item.company, item.duration].filter(Boolean).join(" | ")}
                  </p>
                )}

                {item.position && (
                  <h3 className="resume-position">{item.position}</h3>
                )}

                {item.description && (
                  <p className="resume-description">{item.description}</p>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="SKILLS">
          <BulletList items={skills} />
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="LANGUAGES">
          <BulletList items={languages} />
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="CERTIFICATIONS">
          <BulletList items={certifications} />
        </Section>
      )}
    </div>
  );
}

export { defaultResume };
export default ResumeTemplate;
