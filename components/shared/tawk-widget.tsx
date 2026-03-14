'use client'

import Script from 'next/script'

// Tawk.to chat widget — loads lazily, positioned above WhatsApp button.
// Get your IDs from: https://dashboard.tawk.to → Administration → Chat Widget

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

// Layout (bottom-right stack, mobile-first):
//   [Tawk.to bubble]  ← top   (desktop: 90px, mobile: 80px from bottom)
//   [WhatsApp button] ← below (desktop: 24px, mobile: 16px from bottom)

export default function TawkWidget() {
  // If env vars are not set, render nothing — no error, no crash
  if (!PROPERTY_ID || !WIDGET_ID) return null

  return (
    <>
      {/*
        CSS approach: override Tawk.to's inline bottom position.
        Targets all known Tawk.to bubble container IDs/classes.
        !important overrides their inline styles (which are set without !important).
      */}
      <style>{`
        /* Desktop: push Tawk.to bubble above WhatsApp (56px + 24px gap = 90px) */
        #tawk-bubble-container,
        .tawk-min-container,
        #tawkchat-minified-box {
          bottom: 90px !important;
          right: 24px !important;
        }
        /* Mobile: above WhatsApp (52px + 16px gap = 80px) */
        @media (max-width: 640px) {
          #tawk-bubble-container,
          .tawk-min-container,
          #tawkchat-minified-box {
            bottom: 80px !important;
            right: 12px !important;
          }
        }
      `}</style>

      <Script
        id='tawk-to'
        strategy='lazyOnload'
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();

            /*
              JS fallback: runs after Tawk.to fully loads.
              Uses style.setProperty with 'important' flag — overrides
              even inline !important styles that CSS cannot override.
            */
            Tawk_API.onLoad = function() {
              var isMobile = window.innerWidth <= 640;
              var bottomVal = isMobile ? '80px' : '90px';
              var rightVal  = isMobile ? '12px' : '24px';

              var ids = ['tawk-bubble-container', 'tawkchat-minified-box'];
              ids.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) {
                  el.style.setProperty('bottom', bottomVal, 'important');
                  el.style.setProperty('right',  rightVal,  'important');
                }
              });

              /* Also re-apply on window resize for responsive behaviour */
              window.addEventListener('resize', function() {
                var mobile = window.innerWidth <= 640;
                ids.forEach(function(id) {
                  var elem = document.getElementById(id);
                  if (elem) {
                    elem.style.setProperty('bottom', mobile ? '80px' : '90px', 'important');
                    elem.style.setProperty('right',  mobile ? '12px' : '24px', 'important');
                  }
                });
              });
            };

            (function(){
              var s1 = document.createElement("script"),
                  s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();
          `,
        }}
      />
    </>
  )
}
