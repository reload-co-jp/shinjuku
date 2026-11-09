import { Metadata } from "next"
import Script from "next/script"
import { PageAd, TransitionOverlay } from "@/components/elements/ad"
import { Footer, Header, Main, Nav, Title } from "@/components/elements/layout"
import { Logo } from "@/components/elements/logo"
import { display, sans } from "@/lib/fonts"
import { getDictionary, HTML_LANG, localePath } from "@/lib/i18n"
import { SITE_URL } from "@/lib/json-ld"
import { getSisterSites, SISTER_SITES_HEADING } from "@/lib/sister-sites"
import "../reset.css"

// GA4の測定ID。未設定ならタグを出さない
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-7MCDDY9EBF"

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getDictionary()
  return {
    metadataBase: new URL(SITE_URL),
    title: t.siteName,
    description: t.siteDescription,
    // Google Discoverで大きい画像プレビューを許可
    robots: { "max-image-preview": "large" },
    openGraph: { images: "/opengraph-image.png" },
  }
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const { locale, t } = await getDictionary()
  const href = (path: string) => localePath(locale, path)
  const sisterLang = locale === "ja" ? "ja" : "en"
  const sisterHeading = SISTER_SITES_HEADING[sisterLang]
  const navLinks = [
    { href: "/", label: t.nav.latest },
    { href: "/events/", label: t.nav.events },
    { href: "/today/", label: t.nav.today },
    { href: "/this-week/", label: t.nav.thisWeek },
    { href: "/weekend/", label: t.nav.weekend },
    { href: "/this-month/", label: t.nav.thisMonth },
    { href: "/category/performance/", label: t.nav.performance },
    { href: "/category/concert/", label: t.nav.concert },
    { href: "/category/exhibition/", label: t.nav.exhibition },
    { href: "/category/popup/", label: t.nav.popup },
    { href: "/category/collab/", label: t.nav.collab },
    { href: "/category/illumination/", label: t.nav.illumination },
    { href: "/category/festival/", label: t.nav.festival },
    { href: "/category/new_opening/", label: t.nav.newOpening },
    { href: "/category/closing/", label: t.nav.closing },
    { href: "/category/sale/", label: t.nav.sale },
    { href: "/category/guide/", label: t.nav.guide },
    { href: "/place/", label: t.nav.places },
    { href: "/area/", label: t.nav.areas },
  ].map((link) => ({ ...link, href: href(link.href) }))
  const mainLinks = [
    { href: "/today/", label: t.nav.today },
    { href: "/weekend/", label: t.nav.weekend },
    { href: "/events/", label: t.nav.events },
    { href: "/category/performance/", label: t.nav.performance },
    { href: "/category/exhibition/", label: t.nav.exhibition },
    { href: "/category/popup/", label: t.nav.popup },
    { href: "/category/illumination/", label: t.nav.illumination },
    { href: "/category/new_opening/", label: t.nav.newOpening },
    { href: "/category/local_news/", label: t.nav.news },
    { href: "/place/", label: t.nav.spots },
    { href: "/area/", label: t.nav.areas },
  ].map((link) => ({ ...link, href: href(link.href) }))
  return (
    <html
      className={`${sans.variable} ${display.variable}`}
      lang={HTML_LANG[locale]}
    >
      <head />
      <body>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6542845006087970"
          strategy="afterInteractive"
        />
        <Header>
          <div className="masthead">
            <p aria-hidden="true" className="masthead__tagline">
              {t.home.hero}
            </p>
            <Title as="p" className="masthead__logo">
              <a className="site-logo" href={href("/")}>
                <Logo sub={t.siteName} />
              </a>
            </Title>
          </div>
          <div className="masthead__bar">
            <Nav
              className="site-nav"
              label={t.home.byCategory}
              links={mainLinks}
            />
            <form
              action={href("/search/")}
              className="search"
              method="get"
              role="search"
            >
              <input
                aria-label={t.search.label}
                className="search__input"
                name="q"
                placeholder={t.search.placeholder}
                type="search"
              />
              <button className="search__button" type="submit">
                {t.search.submit}
              </button>
            </form>
          </div>
        </Header>
        <Main>
          {children}
          <PageAd />
        </Main>
        <Footer>
          <div className="site-footer__grid">
            <div>
              <a className="site-logo" href={href("/")}>
                <Logo sub={t.siteName} />
              </a>
              <p className="site-footer__tagline">{t.home.hero}</p>
            </div>
            <section>
              <h2 className="site-footer__heading">{t.footer.about}</h2>
              <p>{t.footer.aboutText}</p>
            </section>
            <section>
              <h2 className="site-footer__heading">{t.footer.operator}</h2>
              <p>
                <a href="https://reload.co.jp/">{t.footer.operatorName}</a>
              </p>
              <h2 className="site-footer__heading">{t.footer.contact}</h2>
              <p>
                <a href="https://reload.co.jp/">{t.footer.contactText}</a>
              </p>
            </section>
          </div>
          <Nav className="site-footer__nav" links={navLinks} />
          <nav aria-label={sisterHeading} className="site-footer__sister">
            <h2 className="site-footer__heading">{sisterHeading}</h2>
            <ul>
              {getSisterSites("shinjuku").map((site) => (
                <li key={site.id}>
                  <a href={site.url} title={site.name}>
                    {site.label[sisterLang]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="site-footer__copy">
            &copy; Shinjuku Live — SHINJUKU JOURNAL
          </p>
        </Footer>
        <TransitionOverlay
          labels={t.interstitial}
          links={mainLinks}
          topHref={href("/")}
        />
      </body>
    </html>
  )
}
export default RootLayout
