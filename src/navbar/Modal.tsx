import React, { useState, useEffect, useRef } from "react";
import "./Modal.css"; // Make sure to import your CSS file

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode; // Dynamic content for the modal
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close the modal when clicking outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={onClose}
    >
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{title}</h2>
        <div className="modal-divider"></div>
        <div>{content}</div>
      </div>
    </div>
  );
};

export default Modal;
