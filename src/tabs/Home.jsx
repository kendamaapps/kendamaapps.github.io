import { useMemo } from 'react';
import ModelViewer from '../components/ModelViewer';

export default function Home() {
  const features = useMemo(() => [
    {
      title: 'Trick Generator',
      description: 'Generate kendama tricks using event, year, and difficulty filters.',
      tag: 'Generator'
    },
    {
      title: 'Progress Tracker',
      description: 'Track completed tricks within a session.',
      tag: 'Tracker'
    },
    {
      title: 'Timer Mode',
      description: 'Timed sessions for structured practice blocks.',
      tag: 'Timer'
    }
  ], []);

  return (
    // Outer Flex Wrapper to handle structural centering perfectly
    <div 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh', // Centers vertically relative to available dashboard space
        width: '100%',
        padding: '2rem 1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Model Viewer Container - Anchored globally */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <ModelViewer
          // url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"
          url="../../data/kendama.glb"
          width="100%"
          height="100%"
          modelXOffset={0}
          modelYOffset={0.25}
          minZoomDistance={1}
          maxZoomDistance={5}
          enableMouseParallax
          enableHoverRotation
          fadeIn
          autoRotate
          autoRotateSpeed={0.5}
          showScreenshotButton={false}
        />
      </div>

      {/* The Actual Foreground Card Content */}
      <div 
        className="card" 
        style={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%',
          maxWidth: '550px', // Prevents the content from blowing out too wide
          backdropFilter: 'blur(4px)',
          boxSizing: 'border-box'
        }}
      >
        <h2>Home</h2>

        <p style={{ marginBottom: '1.5rem' }}>
          Training dashboard for structured kendama practice and progression tracking.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(26, 46, 69, 0.6)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                {f.tag}
              </div>

              <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                {f.title}
              </div>

              <div style={{ color: 'var(--color-text-body)', fontSize: '0.9rem' }}>
                {f.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}