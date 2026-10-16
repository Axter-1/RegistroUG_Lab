import { useId } from 'react';
import './FluidGlass.css';

export default function FluidGlass({
  children,
  blur = 18,
  distortion = 12,
  scale = 0.008,
  radius = 20,
  tint = 0.07,
  as: Tag = 'div',
  className = '',
  style,
  ...rest
}) {
  const rawId = useId();
  const filterId = `fluid-glass-${rawId.replace(/:/g, '')}`;

  return (
    <Tag
      className={`fluid-glass ${className}`}
      style={{
        '--fg-blur': `${blur}px`,
        '--fg-radius': `${radius}px`,
        '--fg-tint': tint,
        ...style,
      }}
      {...rest}
    >
      {distortion > 0 && (
        <svg className="fluid-glass__defs" aria-hidden="true" focusable="false">
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={`${scale} ${scale * 1.6}`}
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feGaussianBlur in="noise" stdDeviation="1.4" result="softNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softNoise"
                scale={distortion}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      <span
        className="fluid-glass__refraction"
        aria-hidden="true"
        style={distortion > 0 ? { filter: `url(#${filterId})` } : undefined}
      />
      <span className="fluid-glass__sheen" aria-hidden="true" />
      <div className="fluid-glass__content">{children}</div>
    </Tag>
  );
}
