import type { Branch } from "@/types/content";

import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";

function BranchCard({ branch }: { branch: Branch }) {
  const phone = branch.phone.trim();
  const mapsFallback = getBusinessMapsSearchUrl();

  return (
    <article className="branches-card">
      <h2>{branch.name}</h2>
      <p className="branches-card-address">
        {branch.address}, {branch.city}
      </p>
      <dl className="branches-card-details">
        {phone ? (
          <div>
            <dt>טלפון</dt>
            <dd>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>סוג העסק</dt>
          <dd>{BUSINESS.businessTypeHe}</dd>
        </div>
        <div>
          <dt>כשרות</dt>
          <dd>{BUSINESS.kosherHe}</dd>
        </div>
        <div>
          <dt>שעות פתיחה</dt>
          <dd>{branch.openingHours}</dd>
        </div>
      </dl>
      {branch.wazeUrl ? (
        <a className="branches-card-nav" href={branch.wazeUrl} rel="noopener noreferrer" target="_blank">
          ניווט
        </a>
      ) : (
        <a className="branches-card-nav" href={mapsFallback} rel="noopener noreferrer" target="_blank">
          ניווט
        </a>
      )}
    </article>
  );
}

function PrimaryBranchFromBusiness() {
  const mapsUrl = getBusinessMapsSearchUrl();
  const hours = `א׳–ה׳ ${BUSINESS.displayHours.weekday} · שבת ${BUSINESS.displayHours.saturday}`;

  return (
    <ul className="branches-grid">
      <li>
        <article className="branches-card">
          <h2>
            {BUSINESS.name} {BUSINESS.address.addressLocality}
          </h2>
          <p className="branches-card-address">{BUSINESS.address.formatted.he}</p>
          <dl className="branches-card-details">
            <div>
              <dt>סוג העסק</dt>
              <dd>{BUSINESS.businessTypeHe}</dd>
            </div>
            <div>
              <dt>כשרות</dt>
              <dd>{BUSINESS.kosherHe}</dd>
            </div>
            <div>
              <dt>שעות פתיחה</dt>
              <dd>{hours}</dd>
            </div>
          </dl>
          <a className="branches-card-nav" href={mapsUrl} rel="noopener noreferrer" target="_blank">
            ניווט
          </a>
        </article>
      </li>
    </ul>
  );
}

export function BranchesPageView({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) {
    return <PrimaryBranchFromBusiness />;
  }

  return (
    <ul className="branches-grid">
      {branches.map((branch) => (
        <li key={branch.id}>
          <BranchCard branch={branch} />
        </li>
      ))}
    </ul>
  );
}
