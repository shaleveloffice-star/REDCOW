import Image from "next/image";

import {
  PLANCHA_BITE_IMAGE,
  PLANCHA_MEAT_IMAGE,
  PLANCHA_SEAR_IMAGE
} from "@/data/site-images.registry";
import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";
import { resolveImageAlt } from "@/lib/image-alt";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const stepIds = ["plancha-meat", "plancha-sear", "plancha-bite"] as const;
const stepImages = [PLANCHA_MEAT_IMAGE, PLANCHA_SEAR_IMAGE, PLANCHA_BITE_IMAGE] as const;

type PlanchaSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function PlanchaSection({ siteImages }: PlanchaSectionProps) {
  const locale = await getServerLocale();
  const t = getMessages(locale);

  const steps = stepIds.map((id, index) => ({
    id,
    img: stepImages[index],
    title: t.plancha.steps[index]?.title ?? "",
    desc: t.plancha.steps[index]?.desc ?? ""
  }));

  return (
    <section id="plancha" className="plancha-section" aria-labelledby="plancha-title">
      <div className="plancha-intro">
        <h2 id="plancha-title" className="plancha-title css-reveal css-reveal--0">
          {t.plancha.title}
        </h2>
        <p className="plancha-lead css-reveal css-reveal--1">{t.plancha.lead}</p>
      </div>

      <ol className="plancha-panels" aria-label={t.plancha.listAria}>
        {steps.map((item, i) => {
          const src = pickSiteImage(siteImages, item.id, item.img);
          const textSide =
            item.id === "plancha-bite" ? "right" : i % 2 === 0 ? "left" : "right";

          return (
            <li
              key={item.id}
              className={`plancha-panel plancha-panel--text-${textSide} plancha-panel--${item.id} css-reveal css-reveal--panel-${i}`}
            >
              <article className="plancha-panel-frame">
                <div className="plancha-panel-copy">
                  <h3 className="plancha-panel-title">{item.title}</h3>
                  <p className="plancha-panel-desc">{item.desc}</p>
                </div>
                {src ? (
                  <div className="plancha-panel-media">
                    <Image
                      src={src}
                      alt={resolveImageAlt({ kind: "plancha", locale, name: item.title })}
                      width={900}
                      height={1200}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
