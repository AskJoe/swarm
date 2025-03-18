import React from 'react';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Frontend Application is Running!</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          This is a simplified version of the frontend application.
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button 
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => alert('Button clicked!')}
          >
            Sample Button
          </button>
          <a href="/test.html" style={{ color: '#4285f4', textDecoration: 'none', marginTop: '20px' }}>
            View Test Page
          </a>
        </div>
      </div>
    </div>
  );
} 