import { useSiteSettings } from '../context/SiteSettingsContext';
import './About.css';

const About = () => {
  const { settings, sheikhImage } = useSiteSettings();
  const about = settings.aboutPage || {};

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{about.headerTitle}</h1>
          <p>{about.headerSubtitle}</p>
        </div>
      </div>

      <div className="container about-page">
        <div className="about-intro">
          <img
            src={sheikhImage}
            alt={settings.branding?.siteName}
            className="about-logo"
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
          <p className="about-intro-text">{about.intro}</p>
        </div>

        <section className="about-block">
          <h2>{about.missionTitle}</h2>
          {(about.missionParagraphs || []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="about-block about-sheikh">
          <div className="about-sheikh-content">
            <h2>{about.sheikhTitle}</h2>
            <p>{about.sheikhBio}</p>
          </div>
          <img src={sheikhImage} alt={about.sheikhTitle} className="about-sheikh-img" />
        </section>

        <section className="about-block about-values">
          <h2>{about.valuesTitle}</h2>
          <ul>
            {(about.values || []).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default About;
