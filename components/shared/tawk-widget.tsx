'use client'

import Script from 'next/script'

// Tawk.to chat widget - loads lazily, positioned above WhatsApp button.
// Get your IDs from: https://dashboard.tawk.to -> Administration -> Chat Widget

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID

// Layout (bottom-right stack, mobile-first):
//   [Tawk.to bubble]  <- top   (desktop: 96px, mobile: 84px from bottom)
//   [WhatsApp button] <- below (desktop: 12px, mobile: 10px from bottom)

export default function TawkWidget() {
  // If env vars are not set, render nothing - no error, no crash
  if (!PROPERTY_ID || !WIDGET_ID) return null

  return (
    <>
      {/*
        CSS approach: override Tawk.to's inline bottom position.
        Targets several known minimized-widget containers.
      */}
      <style>{`
        /* Desktop: keep Tawk safely above the lowered WhatsApp button. */
        #tawk-bubble-container,
        .tawk-min-container,
        #tawkchat-minified-box,
        .tawk-button,
        .tawk-button-circle {
          bottom: 96px !important;
          right: 24px !important;
        }

        /* Mobile: preserve the same visual gap on smaller screens. */
        @media (max-width: 640px) {
          #tawk-bubble-container,
          .tawk-min-container,
          #tawkchat-minified-box,
          .tawk-button,
          .tawk-button-circle {
            bottom: 84px !important;
            right: 16px !important;
          }
        }
      `}</style>

      <Script
        id='tawk-to'
        strategy='lazyOnload'
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();

            Tawk_API.onLoad = function() {
              var selectors = [
                '#tawk-bubble-container',
                '#tawkchat-minified-box',
                '.tawk-min-container',
                '.tawk-button',
                '.tawk-button-circle'
              ];

              function applyOffsets() {
                var isMobile = window.innerWidth <= 640;
                var bottomVal = isMobile ? '84px' : '96px';
                var rightVal = isMobile ? '16px' : '24px';

                selectors.forEach(function(selector) {
                  document.querySelectorAll(selector).forEach(function(el) {
                    el.style.setProperty('bottom', bottomVal, 'important');
                    el.style.setProperty('right', rightVal, 'important');
                  });
                });
              }

              applyOffsets();
              window.addEventListener('resize', applyOffsets);
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
