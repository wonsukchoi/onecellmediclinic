import React from 'react';
import type { PageBlock } from '../../types';
import styles from './SpacerBlockRenderer.module.css';

interface SpacerBlockRendererProps {
  block: PageBlock;
}

const SpacerBlockRenderer: React.FC<SpacerBlockRendererProps> = ({ block }) => {
  const { content } = block;

  const {
    height = 'medium',
    backgroundColor,
    showDivider = false,
    dividerStyle = 'solid',
    dividerColor = '#e0e0e0',
    customHeight
  } = content || {};

  // Predefined spacing heights
  const spacingMap = {
    'small': '1rem',
    'medium': '2rem',
    'large': '3rem',
    'xlarge': '4rem',
    'custom': customHeight || '2rem'
  };

  const spacerHeight = spacingMap[height as keyof typeof spacingMap] || spacingMap.medium;

  const spacerStyle: React.CSSProperties = {
    height: spacerHeight,
    ...(backgroundColor && { backgroundColor }),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dividerStyles: React.CSSProperties = {
    width: '100%',
    height: '1px',
    backgroundColor: dividerColor,
    border: 'none',
    ...(dividerStyle === 'dashed' && {
      borderTop: `1px dashed ${dividerColor}`,
      backgroundColor: 'transparent'
    }),
    ...(dividerStyle === 'dotted' && {
      borderTop: `1px dotted ${dividerColor}`,
      backgroundColor: 'transparent'
    })
  };

  return (
    <div className={styles.spacer} style={spacerStyle}>
      {showDivider && (
        <hr style={dividerStyles} aria-hidden="true" />
      )}
    </div>
  );
};

export default SpacerBlockRenderer;