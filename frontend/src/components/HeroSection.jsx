import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const HeroSection = () => {
  return (
    <>
      <style>
        {`
          @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap');

          @keyframes vouchifyPhoneFloat {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(0, -20px, 0); }
          }

          @keyframes vouchifySoftReveal {
            from { opacity: 0; transform: translate3d(0, 22px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }

          @keyframes vouchifyGlowPulse {
            0%, 100% { opacity: 0.58; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.96; transform: translate(-50%, -50%) scale(1.08); }
          }

          .vouchify-flash-hero {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            width: 100%;
            min-height: calc(100vh - 76px);
            background:
              radial-gradient(circle at 50% 48%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 34%, rgba(239,241,247,0.96) 64%, rgba(226,228,235,1) 100%);
            color: #11162f;
            font-family: 'Satoshi', 'Inter', system-ui, sans-serif;
          }

          .vouchify-flash-hero::before {
            content: "";
            position: absolute;
            inset: -15%;
            z-index: -4;
            background:
              radial-gradient(circle at 50% 44%, rgba(255,255,255,0.92), transparent 29%),
              radial-gradient(circle at 28% 42%, rgba(124,58,237,0.10), transparent 34%),
              radial-gradient(circle at 73% 48%, rgba(14,165,233,0.12), transparent 36%);
          }

          .vouchify-flash-hero::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -3;
            background:
              linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.38), rgba(255,255,255,0.92)),
              repeating-radial-gradient(circle at 50% 50%, rgba(17,22,47,0.050) 0 1px, transparent 1px 84px);
            opacity: 0.75;
          }

          .vouchify-hero-shell {
            position: relative;
            min-height: calc(100vh - 76px);
            width: min(100%, 1440px);
            margin: 0 auto;
            padding: 0 32px;
          }

          .vouchify-hero-content {
            position: relative;
            width: 100%;
            min-height: calc(100vh - 76px);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            /* reserve a clear lane on the right for the larger phone so the
               left-aligned text column never overlaps it, at any viewport width */
            padding-left: clamp(32px, 6vw, 96px);
            padding-right: clamp(260px, 30vw, 420px);
            box-sizing: border-box;
          }

          .vouchify-main-title {
            position: relative;
            z-index: 3;
            width: min(640px, 100%);
            text-align: left;
            font-size: clamp(3rem, 6.4vw, 5.6rem);
            line-height: 0.94;
            letter-spacing: -0.05em;
            font-weight: 900;
            color: #11162f;
            animation: vouchifySoftReveal 0.85s cubic-bezier(0.22,1,0.36,1) both;
          }

          .vouchify-main-title span { display: block; }

          /* Tagline now lives left-aligned under the headline, since the
             right side of the hero is reserved for the phone image */
          .vouchify-tagline {
            position: relative;
            z-index: 3;
            margin-top: 20px;
            width: min(480px, 100%);
            text-align: left;
            font-size: clamp(1rem, 1.3vw, 1.15rem);
            line-height: 1.55;
            font-weight: 500;
            color: rgba(17,22,47,0.62);
            animation: vouchifySoftReveal 0.85s cubic-bezier(0.22,1,0.36,1) 0.12s both;
          }

          /* ---------- CTAs: consistent spacing scale + balanced button weight ---------- */
          .vouchify-cta-row {
            position: relative;
            z-index: 3;
            margin-top: 36px;
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .vouchify-primary-btn,
          .vouchify-secondary-btn {
            min-height: 50px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 999px;
            padding: 0 26px;
            font-size: 13px;
            font-weight: 950;
            letter-spacing: -0.01em;
            transition: transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease;
          }

          .vouchify-primary-btn:hover,
          .vouchify-secondary-btn:hover { transform: translateY(-3px); }

          .vouchify-primary-btn {
            color: #fff;
            background: #11162f;
            box-shadow: 0 18px 45px rgba(17,22,47,0.20);
          }

          .vouchify-primary-btn:hover { box-shadow: 0 22px 50px rgba(17,22,47,0.28); }

          /* Sell Vouchers now carries the same visual weight as Buy Vouchers —
             a solid fill using the brand gradient, instead of a low-contrast outline */
          .vouchify-secondary-btn {
            color: #fff;
            background: linear-gradient(135deg, #4f46e5, #06b6d4);
            box-shadow: 0 18px 45px rgba(79,70,229,0.22);
          }

          .vouchify-secondary-btn:hover { filter: brightness(1.06); box-shadow: 0 22px 50px rgba(79,70,229,0.30); }

          /* ---------- Phone: transparent cutout bleeding from the bottom-right corner ---------- */
          .vouchify-phone-stage {
            position: absolute;
            right: clamp(-110px, -6vw, -50px);
            bottom: clamp(-60px, -6vh, -30px);
            z-index: 4;
            width: min(540px, 34vw);
            pointer-events: none;
            animation: vouchifyPhoneFloat 4.5s ease-in-out infinite;
          }

          /* Past the point where the hero shell itself stops growing (1440px),
             the phone image should stop scaling up too, or it keeps ballooning
             on ultra-wide monitors and overwhelms the layout. */
          @media (min-width: 1441px) {
            .vouchify-phone-stage {
              width: 500px;
              right: -80px;
              bottom: -44px;
            }
          }

          .vouchify-phone-image {
            display: block;
            width: 100%;
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 34px 55px rgba(17,22,47,0.24));
            user-select: none;
            pointer-events: none;
          }

          .vouchify-ring {
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: -2;
            width: min(780px, 78vw);
            aspect-ratio: 1;
            transform: translate(-50%, -50%);
            border: 1px solid rgba(17,22,47,0.055);
            border-radius: 50%;
          }

          .vouchify-ring::before,
          .vouchify-ring::after {
            content: "";
            position: absolute;
            inset: 10%;
            border-radius: 50%;
            border: 1px solid rgba(17,22,47,0.050);
          }

          .vouchify-ring::after { inset: 22%; }

          .vouchify-hero-light {
            position: absolute;
            z-index: -2;
            left: 50%;
            top: 52%;
            width: min(520px, 56vw);
            aspect-ratio: 1;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.96), rgba(255,255,255,0.55) 46%, transparent 72%);
            filter: blur(6px);
            animation: vouchifyGlowPulse 7s ease-in-out infinite;
          }

          @media (max-width: 1180px) {
            .vouchify-hero-content { padding-right: clamp(240px, 40vw, 400px); }
            .vouchify-phone-stage { width: min(420px, 40vw); }
          }

          /* Below this width the phone no longer fits beside the text as a
             side-by-side lane, so the layout switches to stacked: text on
             top, phone below, full-width, no more reserved right padding. */
          @media (max-width: 900px) {
  .vouchify-hero-shell {
    min-height: auto;
    padding: 92px 20px 44px;
  }

  .vouchify-hero-content {
    min-height: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 0;
    padding-top: 20px;
  }

  .vouchify-main-title {
    top: 30px;
    font-size: clamp(3rem, 14vw, 5.5rem);
  }

  .vouchify-main-title .title-line-two {
    transform: translateX(0);
  }

  /* CTA + description comes BEFORE the phone on mobile */
  .vouchify-right-copy {
    order: 1;
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: 560px;
    text-align: center;
    margin: 210px auto 0;
  }

  .vouchify-cta-row {
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Phone comes AFTER the CTA */
  .vouchify-phone-stage {
    order: 2;
    width: min(430px, 82vw);
    margin-top: 28px;
  }

  .vouchify-left-copy {
    order: 3;
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: 560px;
    text-align: center;
    margin: 18px auto 0;
  }

  .vouchify-card-mini {
    display: none;
  }

  .vouchify-card-value {
    display: none;
  }

  .vouchify-card-saving {
    display: none;
  }
}

@media (max-width: 560px) {
  .vouchify-hero-brand-mini {
    display: none;
  }

  .vouchify-hero-content {
    min-height: auto;
    padding-bottom: 20px;
  }

  .vouchify-main-title {
    font-size: clamp(3rem, 15vw, 4.8rem);
    top: 24px;
  }

  .vouchify-right-copy {
    margin-top: 190px;
  }

  .vouchify-right-copy p {
    font-size: 14px;
    line-height: 1.65;
  }

  .vouchify-cta-row {
    gap: 10px;
  }

  .vouchify-primary-btn,
  .vouchify-secondary-btn {
    min-height: 48px;
    padding: 0 18px;
  }

  .vouchify-phone-stage {
    width: min(360px, 88vw);
    margin-top: 24px;
  }

  .vouchify-left-copy {
    display: none;
  }

  .vouchify-card-mini,
  .vouchify-card-value,
  .vouchify-card-saving {
    display: none;
  }
}
        `}
      </style>

      <section className="vouchify-flash-hero">
        <div className="vouchify-hero-shell">
          <div className="vouchify-ring" aria-hidden="true" />
          <div className="vouchify-hero-light" aria-hidden="true" />

          <div className="vouchify-hero-content">
            <h1 className="vouchify-main-title">
              <span>Welcome</span>
              <span>To Vouchify</span>
            </h1>

            <p className="vouchify-tagline">
              List unused offers, let buyers purchase them at a better price, and
              complete the exchange through a secure verification flow.
            </p>

            <div className="vouchify-cta-row">
              <Link to="/vouchers" className="vouchify-primary-btn">
                Buy Vouchers
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/list-voucher" className="vouchify-secondary-btn">
                Sell Vouchers
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="vouchify-phone-stage" aria-hidden="true">
              <img src="/gpay-anime.png" alt="" className="vouchify-phone-image" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;