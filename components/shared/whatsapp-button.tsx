'use client'

import { useState } from 'react'

const WHATSAPP_NUMBER = '971556936110'
const WHATSAPP_MESSAGE = 'Hello! I am interested in your products.'

interface WhatsAppButtonProps {
  phone?: string
  message?: string
}

export default function WhatsAppButton({
  message = WHATSAPP_MESSAGE,
}: WhatsAppButtonProps) {
  const [hovered, setHovered] = useState(false)

  const encodedMessage = encodeURIComponent(message)
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  return (
    <>
      <style>{`
        @keyframes wa-bounce-in {
          0%   { transform: scale(0) rotate(-12deg); opacity: 0; }
          55%  { transform: scale(1.18) rotate(3deg); opacity: 1; }
          75%  { transform: scale(0.94) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes wa-pulse-ring {
          0%   { box-shadow: 0 0 0 0px rgba(37,211,102,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
          100% { box-shadow: 0 0 0 0px rgba(37,211,102,0); }
        }
        @keyframes wa-label-in {
          0%   { opacity: 0; transform: translateX(8px) translateY(-50%); }
          100% { opacity: 1; transform: translateX(0) translateY(-50%); }
        }
        @keyframes wa-icon-wiggle {
          0%,100% { transform: rotate(0deg) scale(1); }
          20%     { transform: rotate(-12deg) scale(1.1); }
          40%     { transform: rotate(10deg) scale(1.1); }
          60%     { transform: rotate(-6deg) scale(1.05); }
          80%     { transform: rotate(4deg) scale(1.05); }
        }

        .wa-wrap {
          position: fixed;
          bottom: 8px;
          right: 96px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: wa-bounce-in 0.65s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .wa-label {
          background: #111b21;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 7px 14px;
          border-radius: 10px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.28);
          white-space: nowrap;
          animation: wa-label-in 0.22s ease both;
          pointer-events: none;
          user-select: none;
        }

        .wa-btn {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 20px rgba(37,211,102,0.45),
            0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
          animation: wa-pulse-ring 2.2s ease-out infinite;
          transition:
            border-radius 0.2s ease,
            transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .wa-btn:hover {
          background: #20ba5a;
          border-radius: 20px;
          transform: scale(1.1) translateY(-2px);
          box-shadow:
            0 8px 28px rgba(37,211,102,0.55),
            0 4px 12px rgba(0,0,0,0.2);
          animation: none;
        }

        .wa-btn:hover .wa-icon {
          animation: wa-icon-wiggle 0.55s ease both;
        }

        .wa-icon {
          width: 30px;
          height: 30px;
          fill: #fff;
          flex-shrink: 0;
          display: block;
        }

        @media (max-width: 640px) {
          .wa-wrap {
            bottom: 8px;
            right: 88px;
          }
          .wa-btn {
            width: 52px;
            height: 52px;
            border-radius: 14px;
          }
          .wa-icon {
            width: 27px;
            height: 27px;
          }
          .wa-label {
            font-size: 12px;
            padding: 6px 11px;
          }
        }
      `}</style>

      <div className='wa-wrap'>
        {hovered && <span className='wa-label'>Chat with us!</span>}
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='wa-btn'
          aria-label='Chat on WhatsApp'
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <svg
            className='wa-icon'
            viewBox='0 0 32 32'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.363.638 4.659 1.847 6.668L2.667 29.333l6.845-1.797A13.284 13.284 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16c0-7.364-5.963-13.333-13.33-13.333zm0 2.444c6.007 0 10.889 4.882 10.889 10.889 0 6.007-4.882 10.889-10.889 10.889a10.849 10.849 0 0 1-5.61-1.567l-.403-.245-4.063 1.067 1.085-3.959-.267-.416A10.849 10.849 0 0 1 5.114 16c0-6.007 4.882-10.889 10.889-10.889zm-3.19 5.245c-.218 0-.574.081-.875.406-.3.325-1.143 1.116-1.143 2.722s1.169 3.156 1.333 3.374c.163.217 2.277 3.674 5.647 5.004 2.8 1.104 3.37.883 3.977.828.606-.054 1.956-.8 2.233-1.573.277-.772.277-1.434.194-1.572-.082-.135-.3-.217-.626-.38-.325-.162-1.956-.965-2.258-1.075-.3-.109-.519-.163-.738.163-.218.325-.845 1.075-1.034 1.292-.19.218-.381.245-.706.082-.326-.163-1.374-.507-2.619-1.616-.967-.862-1.62-1.928-1.81-2.253-.19-.326-.02-.502.142-.664.146-.146.325-.38.487-.57.163-.19.217-.326.326-.543.108-.218.054-.407-.028-.57-.081-.162-.727-1.782-1.006-2.436-.261-.625-.532-.535-.737-.544-.19-.008-.406-.01-.624-.01z' />
          </svg>
        </a>
      </div>
    </>
  )
}
