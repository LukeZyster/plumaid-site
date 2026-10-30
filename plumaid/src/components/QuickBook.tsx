"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { serviceCards } from "@/content/site";
import { IconArrow } from "./Icons";

/** Hero shortcut: pick what's wrong → jump straight into the booking flow with it preselected. */
export default function QuickBook() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  return (
    <form
      className="quickbook"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(slug ? `/appointments?service=${slug}` : "/appointments");
      }}
    >
      <label htmlFor="qb-service">What do you need help with?</label>
      <div className="row">
        <select id="qb-service" className="select" value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Choose a service</option>
          {serviceCards.slice(0, 3).map((s) => (
            <option key={s.slug} value={s.slug}>{s.title}</option>
          ))}
          <option value="general-assessment">Not sure yet</option>
        </select>
        <button className="btn btn--primary" type="submit">
          Find a time <IconArrow />
        </button>
      </div>
    </form>
  );
}
