import { BookingForm } from "@/components/BookingForm";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { HOURS, SALON, SERVICES } from "@/lib/salon";

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <p className="demo-banner">Portfolio sample: an invented business, made by jdcreative.studiodesign</p>

      <header className="container site-header">
        <p className="logo">{SALON.shortName.toUpperCase()}</p>
        <nav aria-label="Main">
          <a href="#services">Services</a>
          <a href="#visit">Visit</a>
          <a href="#book" className="button button-primary button-small">
            Book now
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="container hero-wrap" aria-labelledby="hero-title">
          <div className="hero">
            <Photo
              photo={PHOTOS["salon-hero"]}
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="hero-photo"
              eager
            />
            <div className="hero-text">
              <p className="eyebrow">Hair studio</p>
              <h1 id="hero-title">Sharp cuts. Bold colour. No rush.</h1>
              <div className="actions">
                <a href="#book" className="button button-primary">
                  Book a visit
                </a>
                <a href="#services" className="button button-outline">
                  See prices
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="container services" aria-labelledby="services-title">
          <div className="services-intro">
            <h2 id="services-title">The menu</h2>
            <p className="muted">Every appointment includes a consultation. Prices are fixed before we start.</p>
          </div>
          <ul className="service-list">
            {SERVICES.map((service) => (
              <li key={service.id} className="service">
                <div>
                  <h3>{service.name}</h3>
                  <p className="muted">{service.description}</p>
                </div>
                <p className="price">{service.price}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="book" className="panel" aria-labelledby="book-title">
          <div className="container booking">
            <div className="booking-intro">
              <h2 id="book-title">Book in a minute</h2>
              <p className="muted">Choose a service and a day. We confirm by email within the hour.</p>
              <p className="muted small">Client reviews will appear here once the studio is live.</p>
            </div>
            <BookingForm />
          </div>
        </section>
      </main>

      <footer id="visit" className="container site-footer">
        <div>
          <h2 className="footer-heading">Visit</h2>
          <p className="muted">[STREET ADDRESS]</p>
          <p className="muted">[CITY, POSTCODE]</p>
        </div>
        <div>
          <h2 className="footer-heading">Hours</h2>
          {HOURS.map((line) => (
            <p key={line} className="muted">
              {line}
            </p>
          ))}
        </div>
        <p className="muted small credit">Demo site by jdcreative.studiodesign</p>
      </footer>
    </>
  );
}
