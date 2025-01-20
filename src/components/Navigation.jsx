import React, { Component } from 'react';
import './Navigation.css';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditMode: false,
      hoveredItem: null,
    };
    this.hoverTimers = {};
  }

  componentWillUnmount() {
    // 清除所有定时器
    Object.values(this.hoverTimers).forEach((timer) => clearTimeout(timer));
  }

  handleMouseEnter = (index) => {
    this.hoverTimers[index] = setTimeout(() => {
      this.setState({ hoveredItem: index });
    }, 1000);
  };

  handleMouseLeave = (index) => {
    clearTimeout(this.hoverTimers[index]);
    this.hoverTimers[index] = setTimeout(() => {
      this.setState({ hoveredItem: null });
    }, 1000);
  };

  handleRemoveLink = (index) => {
    const newLinks = [...this.props.links];
    newLinks.splice(index, 1);
    this.props.setLinks(newLinks);
    Storager.set({ links: newLinks });
    this.props.onLinksChange && this.props.onLinksChange(newLinks);
  };

  render() {
    const { links } = this.props;
    const { isDarkMode } = this.props;

    return (
      <>
        <div className={`navigation ${isDarkMode ? 'dark' : ''}`}>
          <ul className="navigation-list">
            {links.map((link, index) => (
              <li
                key={index}
                className="navigation-item"
                onMouseEnter={() => this.handleMouseEnter(index)}
                onMouseLeave={() => this.handleMouseLeave(index)}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigation-link"
                >
                  {link.name}
                </a>

                <span
                  className={`delete-icon ${this.state.hoveredItem === index ? 'visible' : ''}`}
                  onClick={() => this.handleRemoveLink(index)}
                >
                  <FaTimes />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}

Navigation.propTypes = {
  links: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default Navigation;
