import React, { useState, useRef, useEffect } from 'react';
import { BiCog } from 'react-icons/bi';
import styled, { css } from 'styled-components';
import MenuContent from './MenuContent';

const MenuWrapper = styled.div`
  position: absolute;
  left: 30px;
  bottom: 20px;
`;

const PopoverContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PopoverContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(8px)'};
  transition: all 200ms ease;
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
  display: ${props => props.$isVisible ? 'block' : 'none'};
`;

const MenuButton = styled(BiCog).withConfig({
  shouldForwardProp: (prop) => !['$isOpen', 'innerRef', 'as', 'theme'].includes(prop),
})`
  opacity: 0.6;
  cursor: pointer;
  transition: all 300ms ease;
  transform-origin: 50% 50%;

  &:hover {
    opacity: 1;
  }

  ${(props) =>
    props.$isOpen &&
    css`
      opacity: 1;
      transform: rotate(45deg) scale(1.1);
    `}
`;

const ConfigMenu = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <MenuWrapper>
      <PopoverContainer ref={containerRef}>
        <MenuButton 
          id="menu-button" 
          size={20} 
          color="white" 
          $isOpen={isOpen}
          onClick={handleToggle}
        />
        <PopoverContent $isVisible={isOpen}>
          <MenuContent {...props} onClose={handleClose} />
        </PopoverContent>
        <Overlay $isVisible={isOpen} onClick={handleClose} />
      </PopoverContainer>
    </MenuWrapper>
  );
};

export default ConfigMenu;
