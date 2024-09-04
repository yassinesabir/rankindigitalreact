import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import './SwipeableRow.css'; // Import CSS file for styling

const SwipeableRow = ({ onSwipeLeft, onSwipeRight, onDoubleClick, isModalOpen, children }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const rowRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const endX = e.touches[0].clientX;
      setCurrentX(endX - startX);
      if (Math.abs(endX - startX) > 300) { // Adjusted swipe threshold
        if (startX - endX > 300) { // Swipe left threshold
          onSwipeLeft();
          setIsDragging(false);
        } else if (endX - startX > 50) { // Swipe right threshold
          onSwipeRight();
          setIsDragging(false);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setCurrentX(0);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const endX = e.clientX;
      setCurrentX(endX - startX);
      if (Math.abs(endX - startX) > 500) { // Adjusted swipe threshold
        if (startX - endX > 50) { // Swipe left threshold
          onSwipeLeft();
          setIsDragging(false);
        } else if (endX - startX > 50) { // Swipe right threshold
          onSwipeRight();
          setIsDragging(false);
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      setCurrentX(0);
    }
  };

  const handleClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onDoubleClick(); // Handle double-click
    } else {
      const timeout = setTimeout(() => {
        setClickTimeout(null);
      }, 300); // Time interval for detecting double-click
      setClickTimeout(timeout);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    trackMouse: true, // Enable swipe tracking on mouse events
  });

  useEffect(() => {
    if (isModalOpen) {
      // Reset position when modal is open
      setCurrentX(0);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (rowRef.current) {
      rowRef.current.style.transform = `translateX(${currentX}px)`;
    }
  }, [currentX]);

  return (
    <tr
      ref={rowRef}
      className={`swipeable-row ${isDragging ? (currentX > 0 ? 'swiping-right' : 'swiping-left') : ''}`}
      style={{ transform: `translateX(${currentX}px)` }}
      {...handlers}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick} // Add onClick handler to detect double-click
    >
      {children}
    </tr>
  );
};

export default SwipeableRow;
