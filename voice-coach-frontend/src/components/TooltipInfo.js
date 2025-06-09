import { useState } from 'react';

function TooltipInfo({ message}) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', marginLeft: 6 }}>
      <span
        style={{
          cursor: 'pointer',
          color: '#0070f3',
          fontWeight: 700,
          fontSize: 16,
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        &#9432;
      </span>
      {show && (
        <span
          style={{
            position: 'absolute',
            left: 20,
            top: 0,
            background: '#fff',
            color: '#222',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 13,
            zIndex: 100,
            maxWidth: 400,
            minWidth: 300,           // Limit width
            whiteSpace: 'normal',    // Allow wrapping
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflowWrap: 'break-word', // Break long words if needed
          }}
        >
          {message}
        </span>
      )}
    </span>
  );
}

export default TooltipInfo;