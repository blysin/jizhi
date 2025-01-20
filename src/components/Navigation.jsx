import React, { Component } from 'react';
import './Navigation.css';
import { FaTimes, FaPlus } from 'react-icons/fa';
import PropTypes from 'prop-types';
import Storager from '../utils/storager';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditMode: false,
      hoveredItem: null,
      isEditingTitle: false,
      currentTitle: '自定义标题',
    };
    this.hoverTimers = {};
    this.titleInputRef = React.createRef();
  }

  componentDidMount() {
    Storager.get(['navigationTitle'], (result) => {
      if (result && result.navigationTitle) {
        console.log('componentDidMount ', result.navigationTitle);
        this.setState({ currentTitle: result.navigationTitle });
      } else {
        console.log('componentDidMount 获取到空数据', result);
      }
    });
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

  handleTitleDoubleClick = () => {
    this.setState({ isEditingTitle: true }, () => {
      this.titleInputRef.current.focus();
    });
  };

  handleTitleChange = (e) => {
    this.setState({ currentTitle: e.target.value });
  };

  handleTitleBlur = () => {
    console.log('handleTitleBlur', this.state.currentTitle);
    this.setState({ isEditingTitle: false });
    Storager.set({ navigationTitle: this.state.currentTitle });
  };

  handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  render() {
    const { links } = this.props;
    const { isDarkMode } = this.props;

    return (
      <>
        <div className={`navigation ${isDarkMode ? 'dark' : ''}`}>
          <div class="link-row">
            <div className="title" onDoubleClick={this.handleTitleDoubleClick}>
              {this.state.isEditingTitle ? (
                <input
                  type="text"
                  ref={this.titleInputRef}
                  className="title-input"
                  value={this.state.currentTitle}
                  onChange={this.handleTitleChange}
                  onBlur={this.handleTitleBlur}
                  onKeyDown={this.handleTitleKeyDown}
                />
              ) : (
                this.state.currentTitle
              )}
            </div>
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
            <div className="add-item" >              
              <FaPlus />
            </div>
          </div>
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
