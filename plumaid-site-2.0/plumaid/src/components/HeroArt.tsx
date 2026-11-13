import { Mascot } from "./Brand";


/** Mascot + a copper pipe with a single drip. The drip lands in a puddle beside him. */
export default function HeroArt({ media }: { media?: { url: string; kind: "video" | "photo"; title: string } | null }) {
  // If the plumber uploaded a hero photo/video in the admin, show it in a frame with the mascot in front.
  if (media) {
    return (
      <div className="hero-art hero-art--media">
        <div className="hero-frame">
          {media.kind === "video" ? (
            <video src={media.url} autoPlay muted loop playsInline aria-label={media.title || "PlumAid at work"} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt={media.title || "PlumAid at work"} />
          )}
        </div>
        <Mascot className="mascot" size={220} wave />
      </div>
    );
  }
  return (
    <div className="hero-art">
      {/* Copper pipe: runs in from the right-hand edge of the screen, elbows down, and drips. */}
      <div className="hero-pipe" aria-hidden="true">
        <span className="hp-run" />
        <span className="hp-elbow" />
        <span className="hp-leg" />
        <span className="hp-collar" />
        <span className="hp-union" />
        <span className="hp-mouth" />
        {/* leak 1: a fine spray from the joint on the horizontal run */}
        <span className="hp-spray">
          <i /><i /><i /><i /><i />
        </span>
        {/* leak 2: water seeping from the collar and running down the pipe */}
        <span className="hp-seep" />
        <span className="hp-seep-drop" />
        {/* the main drip: forms at the open end, falls, splashes */}
        <span className="hp-drop" />
        <span className="hp-puddle" />
        <span className="hp-splash"><i /><i /><i /></span>
      </div>
      <Mascot className="mascot" size={300} wave />
    </div>
  );
}
