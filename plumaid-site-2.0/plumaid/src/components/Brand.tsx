import { useId } from "react";

/**
 * Brand artwork, redrawn as vector from the PlumAid business card.
 * To use your original files instead, drop them in /public/brand and swap the SVG for an <img>.
 */

/** The water-drop + wrench icon from the real PlumAid logo (public/brand/icon.png). */
export function DropWrench({ size = 48, className = "" }: { size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/icon.png" alt="PlumAid" width={Math.round((size * 174) / 218)} height={size} className={className} />;
}

/**
 * The real PlumAid logo (from the business card artwork).
 * logo.png = dark text for light backgrounds, logo-light.png = white text for the navy footer/admin bar.
 */
export function Logo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  const h = Math.round(size * 1.3);
  const w = Math.round((h * 660) / 268);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="logo-img"
      src={light ? "/brand/logo-light.png" : "/brand/logo.png"}
      alt="PlumAid Plumbing Solutions"
      width={w}
      height={h}
      style={{ height: h, width: "auto", maxWidth: "100%" }}
    />
  );
}

/**
 * The PlumAid water-drop man from the business card: black PlumAid cap, black polo with orange collar,
 * tool belt, pipe wrench in one hand and a thumbs up with the other.
 * To use the original artwork instead, put it in /public/brand/mascot.png and set MASCOT_IMAGE below.
 */
const MASCOT_W = 760;
const MASCOT_H = 754;
const MASCOT_IMAGE: string | null = "/brand/mascot.webp"; // the official artwork; set to null to use the drawn SVG below

export function Mascot({
  size = 240,
  className = "",
  wave = false,
}: {
  size?: number;
  className?: string;
  wave?: boolean;
}) {
  const id = useId();
  if (MASCOT_IMAGE) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={MASCOT_IMAGE}
        width={size}
        height={Math.round((size * MASCOT_H) / MASCOT_W)}
        alt="PlumAid mascot giving a thumbs up"
        className={`mascot-img ${wave ? "mascot-img--wave" : ""} ${className}`}
        style={{ height: "auto" }}
        draggable={false}
      />
    );
  }
  return (
    <svg
      className={`mascot-svg ${className}`}
      width={size}
      height={(size * 680) / 640}
      viewBox="20 0 640 680"
      role="img"
      aria-label="PlumAid mascot giving a thumbs up"
    >
  <defs>
    <linearGradient id={`${id}skin`} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor="#33b6f2"/>
      <stop offset="1" stopColor="#1688d6"/>
    </linearGradient>
    <linearGradient id={`${id}steel`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#d9dde3"/>
      <stop offset="1" stopColor="#8b939f"/>
    </linearGradient>
    <linearGradient id={`${id}red`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#e2582c"/>
      <stop offset="1" stopColor="#b8401b"/>
    </linearGradient>
    <linearGradient id={`${id}pouch`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#d27240"/>
      <stop offset="1" stopColor="#a24e26"/>
    </linearGradient>
  </defs>
  <g stroke="#0c2a4d" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">

    {/* ===== pipe wrench (behind fist) ===== */}
    <g>
      {/* handle */}
      <path d="M128 400 L170 400 L172 585 Q172 600 150 600 Q128 600 128 585 Z" fill="#3a3f48"/>
      {/* red body */}
      <path d="M92 285 L160 270 L182 420 L120 432 Z" fill={`url(#${id}red)`}/>
      <path d="M128 345 l38 -6 M132 372 l38 -6" strokeWidth="4" fill="none" stroke="#7a2a10"/>
      {/* adjusting nut */}
      <rect x="140" y="300" width="30" height="40" rx="6" fill={`url(#${id}steel)`} transform="rotate(-8 155 320)"/>
      {/* hook jaw */}
      <path d="M48 262 C40 236 58 214 90 212 L138 210 C150 210 156 220 152 232 L146 252 L112 254 L104 240 L84 242 C76 244 74 254 80 262 L96 290 L70 300 Z" fill={`url(#${id}steel)`}/>
      {/* lower jaw */}
      <path d="M104 262 L150 256 L158 290 L112 298 Z" fill={`url(#${id}steel)`}/>
    </g>

    {/* ===== left forearm (to fist) ===== */}
    <path d="M150 500 C175 545 205 565 245 560" fill="none" stroke="#0c2a4d" strokeWidth="62"/>
    <path d="M150 500 C175 545 205 565 245 560" fill="none" stroke={`url(#${id}skin)`} strokeWidth="48"/>

    {/* ===== torso ===== */}
    <path d="M222 425 C250 405 290 398 330 398 L392 398 C440 398 488 408 515 428 L500 520 L482 590 L232 595 L222 520 Z" fill="#1a1a20"/>
    {/* sleeves */}
    <path d="M222 425 C196 438 184 470 190 500 L248 508 L250 440 Z" fill="#1a1a20"/>
    <path d="M188 484 L250 492 L248 512 L190 506 Z" fill="#e8642a" strokeWidth="5"/>
    <path d="M515 428 C536 440 540 466 532 492 L480 494 L484 438 Z" fill="#1a1a20"/>
    <path d="M534 476 L480 480 L480 498 L530 496 Z" fill="#e8642a" strokeWidth="5"/>
    {/* collar */}
    <path d="M300 398 L345 452 L404 398" fill="none" stroke="#e8642a" strokeWidth="20"/>
    <path d="M300 398 L345 452 L404 398" fill="none" stroke="#0c2a4d" strokeWidth="4" transform="translate(0 12)"/>
    {/* chest logo */}
    <text x="366" y="494" fontFamily="Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="21" stroke="none" letterSpacing="-0.5"><tspan fill="#fff">PLUM</tspan><tspan fill="#f07a2c">AID</tspan></text>

    {/* ===== belt + pouches ===== */}
    <path d="M222 578 L492 572 L494 606 L222 612 Z" fill="#5b3420"/>
    <rect x="288" y="580" width="62" height="44" rx="8" fill={`url(#${id}steel)`}/>
    <rect x="304" y="592" width="30" height="20" rx="4" fill="#5b3420" strokeWidth="5"/>
    <path d="M214 596 L284 594 L286 646 Q286 660 270 660 L228 660 Q214 660 214 646 Z" fill={`url(#${id}pouch)`}/>
    <path d="M214 614 L284 612" strokeWidth="5"/>
    <path d="M392 590 L478 586 L482 646 Q482 660 466 660 L408 660 Q394 660 394 646 Z" fill={`url(#${id}pouch)`}/>
    <path d="M392 608 L480 604 M436 588 L436 660" strokeWidth="5"/>

    {/* ===== left fist round the wrench ===== */}
    <path d="M84 440 C80 414 100 400 124 404 C136 392 160 394 170 406 C190 402 206 418 200 438 C212 456 208 484 192 498 C184 524 152 536 120 530 C90 524 74 502 78 480 C68 466 72 450 84 440 Z" fill={`url(#${id}skin)`}/>
    <path d="M94 452 C122 446 162 446 194 452 M90 476 C120 470 160 470 196 476 M98 500 C124 496 158 496 186 500" fill="none" strokeWidth="4"/>
    {/* ===== thumbs-up arm ===== */}
    <g className={wave ? "mascot-arm" : undefined} style={{ transformOrigin: "520px 500px" }}>
      <path d="M520 470 C540 500 520 520 500 530" fill="none" stroke="#0c2a4d" strokeWidth="62"/>
      <path d="M520 470 C540 500 520 520 500 530" fill="none" stroke={`url(#${id}skin)`} strokeWidth="48"/>
      {/* rounded fist with curled fingers */}
      <path d="M506 400 C506 378 526 368 548 370 L600 372 C622 374 630 392 626 410 C640 420 640 442 628 452 C640 464 636 486 622 492 C630 506 620 526 600 528 L546 530 C518 530 500 510 500 482 L500 430 C500 416 502 406 506 400 Z" fill={`url(#${id}skin)`}/>
      <path d="M560 410 C584 408 606 410 626 412 M560 450 C586 448 610 450 630 452 M560 490 C584 490 606 490 622 492" fill="none" strokeWidth="4.5"/>
      {/* the thumb: short, chunky and rounded, pointing up */}
      <path d="M516 396 C512 360 518 318 532 296 C544 278 572 280 578 302 C584 324 578 356 572 378 C568 392 560 402 548 404 C532 406 520 404 516 396 Z" fill={`url(#${id}skin)`}/>
      <path d="M540 300 C546 292 562 292 568 302 C566 312 556 316 546 314 C540 312 538 306 540 300 Z" fill="#8fd8fb" strokeWidth="3"/>
      <path d="M528 380 C540 386 556 386 566 380" fill="none" strokeWidth="4"/>
    </g>

    {/* ===== head: a round, friendly water drop ===== */}
    <path className="m-drop" d="M392 6 C398 46 444 92 482 138 C508 170 520 206 520 246 C520 342 444 414 352 414 C260 414 186 342 186 250 C186 196 216 156 262 128 C312 98 372 66 392 6 Z" fill={`url(#${id}skin)`}/>
    {/* head highlight */}
    <path d="M214 242 C216 214 230 192 252 176" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="11"/>
    <circle cx="232" cy="276" r="6" fill="#fff" fillOpacity=".45" stroke="none"/>
    <g className="m-face" transform="translate(0 16)">
    {/* eyebrows */}
    <path d="M254 214 C266 200 290 196 308 204" fill="none" strokeWidth="9"/>
    <path d="M350 206 C372 198 396 204 408 218" fill="none" strokeWidth="9"/>
    {/* eyes (blink) */}
    <g className="m-eyes">
    <ellipse cx="284" cy="256" rx="24" ry="31" fill="#fff" strokeWidth="5"/>
    <ellipse cx="376" cy="262" rx="26" ry="32" fill="#fff" strokeWidth="5"/>
    <ellipse cx="295" cy="262" rx="12" ry="15" fill="#15121c" stroke="none"/>
    <ellipse cx="388" cy="268" rx="13" ry="16" fill="#15121c" stroke="none"/>
    <circle cx="299" cy="255" r="4.5" fill="#fff" stroke="none"/>
    <circle cx="392" cy="261" r="4.5" fill="#fff" stroke="none"/>
    </g>
    {/* nose */}
    <path d="M326 292 C318 302 322 314 336 312" fill="none" strokeWidth="5"/>
    {/* cheeks */}
    <ellipse cx="248" cy="320" rx="20" ry="11" fill="#0e74c0" opacity=".35" stroke="none"/>
    <ellipse cx="444" cy="322" rx="20" ry="11" fill="#0e74c0" opacity=".35" stroke="none"/>
    {/* mouth */}
    <path d="M292 328 C320 340 370 338 400 318 C402 352 380 378 348 380 C316 382 296 360 292 328 Z" fill="#a3231b" strokeWidth="6"/>
    <path d="M318 364 C330 350 360 348 378 358 C370 372 356 378 346 378 C334 378 324 372 318 364 Z" fill="#f17a6c" stroke="none"/>
    <path d="M296 332 C322 344 368 342 398 322 C396 334 390 342 380 346 C356 354 322 352 296 332 Z" fill="#fff" stroke="none"/>

    </g>

    {/* ===== cap ===== */}
    <g>
      <path d="M250 168 C250 112 300 70 372 72 C442 74 500 116 504 178 C504 192 498 204 490 206 C430 180 330 170 250 182 Z" fill="#1a1a20"/>
      <path d="M282 122 C298 98 324 86 352 82" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="10"/>
      
      <text x="296" y="134" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="31" stroke="none" letterSpacing="-1" transform="rotate(4 300 134)"><tspan fill="#fff">PLUM</tspan><tspan fill="#f07a2c">AID</tspan></text>
      {/* brim: orange, sweeping out to the left */}
      <path d="M204 162 C214 142 252 136 292 142 C352 150 420 162 476 188 L470 208 C420 188 352 178 292 180 C260 182 226 192 210 194 C198 188 196 172 204 162 Z" fill="#d9572a"/>
    </g>
  </g>
    </svg>
  );
}

/** Simple falling-water drop used by the pipe drip animation. */
export function Drop({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="20" viewBox="0 0 14 20" aria-hidden="true">
      <path d="M7 0C7 0 0 8 0 13a7 7 0 0 0 14 0C14 8 7 0 7 0Z" fill="#5fbdf2" />
    </svg>
  );
}
