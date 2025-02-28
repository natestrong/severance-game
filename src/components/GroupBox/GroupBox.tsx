import React from 'react';
import './GroupBox.css';

interface GroupBoxProps {
  boxNumber: string;
  progress: number;
  id: string;
}

/**
 * GroupBox component that displays a numbered box with a progress bar.
 * Each box represents 20% of the overall game completion.
 */
const GroupBox: React.FC<GroupBoxProps> = ({ boxNumber, progress, id }) => {
  return (
    <div className="number-container" id={`group-box-${id}`}>
      <div className="number-box">{boxNumber}</div>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{width: `${progress}%`}}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default GroupBox;
